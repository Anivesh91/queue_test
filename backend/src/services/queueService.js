const Queue = require('../models/Queue');
const Service = require('../models/Service');
const Ticket = require('../models/Ticket');
const ApiError = require('../utils/apiError');
const socketEmitter = require('../sockets/socketEmitter');
const { getWaitingCount, clearWaitingQueue } = require('../redis/queueRedis');

const getPublicQueue = async (serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId', 'name slug category').lean();
  if (!service || !service.isActive) {
    throw new ApiError(404, 'Service not found or inactive.');
  }

  let queue = await Queue.findOne({ serviceId }).lean();
  if (!queue) {
    queue = await Queue.create({
      organizationId: service.organizationId._id,
      serviceId: service._id,
      status: 'CLOSED',
      currentTicketId: null,
      lastSequenceNumber: 0,
    });
  }

  const waitingCount = await Ticket.countDocuments({
    serviceId,
    status: 'WAITING',
  });

  const estimatedWait = waitingCount * (service.averageServiceTime || 10);

  let currentTicketSummary = null;
  if (queue.currentTicketId) {
    const currentTicket = await Ticket.findById(queue.currentTicketId).lean();
    if (currentTicket && ['CALLED', 'SERVING'].includes(currentTicket.status)) {
      currentTicketSummary = {
        ticketNumber: currentTicket.ticketNumber,
        status: currentTicket.status,
        calledAt: currentTicket.calledAt,
        serviceStartedAt: currentTicket.serviceStartedAt,
      };
    }
  }

  return {
    serviceId: service._id,
    serviceName: service.name,
    ticketPrefix: service.ticketPrefix,
    averageServiceTime: service.averageServiceTime,
    organization: service.organizationId,
    status: queue.status,
    waitingCount,
    estimatedWait,
    currentTicket: currentTicketSummary,
  };
};

const getManageQueue = async (ownerId, serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId');
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  if (service.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this service queue.');
  }

  let queue = await Queue.findOne({ serviceId });
  if (!queue) {
    queue = await Queue.create({
      organizationId: service.organizationId._id,
      serviceId: service._id,
      status: 'CLOSED',
      currentTicketId: null,
      lastSequenceNumber: 0,
    });
  }

  let currentTicket = null;
  if (queue.currentTicketId) {
    currentTicket = await Ticket.findById(queue.currentTicketId);
  }

  const waitingTickets = await Ticket.find({
    serviceId,
    status: 'WAITING',
  })
    .sort({ sequenceNumber: 1 })
    .lean();

  return {
    service,
    queue,
    currentTicket,
    waitingTickets,
    waitingCount: waitingTickets.length,
  };
};

const openQueue = async (ownerId, serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId');
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  if (service.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this service queue.');
  }

  await clearWaitingQueue(serviceId);

  const queue = await Queue.findOneAndUpdate(
    { serviceId },
    {
      status: 'OPEN',
      openedAt: new Date(),
      currentTicketId: null,
    },
    { new: true, upsert: true }
  );

  const waitingCount = await Ticket.countDocuments({ serviceId, status: 'WAITING' });
  const orgId = service.organizationId._id || service.organizationId;

  socketEmitter.emitQueueStatusChanged(serviceId, ownerId, {
    status: 'OPEN',
    serviceId: serviceId.toString(),
    organizationId: orgId.toString(),
  });
  socketEmitter.emitQueueUpdated(serviceId, ownerId, {
    status: 'OPEN',
    waitingCount,
    serviceId: serviceId.toString(),
    organizationId: orgId.toString(),
  });

  return queue;
};

const closeQueue = async (ownerId, serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId');
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  if (service.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this service queue.');
  }

  const now = new Date();

  const activeTickets = await Ticket.find({
    serviceId,
    status: { $in: ['WAITING', 'CALLED', 'SERVING'] },
  });

  await Ticket.updateMany(
    {
      serviceId,
      status: { $in: ['WAITING', 'CALLED', 'SERVING'] },
    },
    {
      status: 'CANCELLED',
      cancelledAt: now,
    }
  );

  await clearWaitingQueue(serviceId);

  const queue = await Queue.findOneAndUpdate(
    { serviceId },
    {
      status: 'CLOSED',
      closedAt: now,
      currentTicketId: null,
    },
    { new: true, upsert: true }
  );

  const orgId = service.organizationId._id || service.organizationId;

  for (const t of activeTickets) {
    socketEmitter.emitTicketCancelled(t._id, serviceId, ownerId, {
      ticketNumber: t.ticketNumber,
      customerName: t.customerName,
      message: 'Queue was closed by the organization.',
    });
  }

  socketEmitter.emitQueueStatusChanged(serviceId, ownerId, {
    status: 'CLOSED',
    serviceId: serviceId.toString(),
    organizationId: orgId.toString(),
  });
  socketEmitter.emitQueueUpdated(serviceId, ownerId, {
    status: 'CLOSED',
    waitingCount: 0,
    serviceId: serviceId.toString(),
    organizationId: orgId.toString(),
  });

  return queue;
};

module.exports = {
  getPublicQueue,
  getManageQueue,
  openQueue,
  closeQueue,
};
