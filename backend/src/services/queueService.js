const Queue = require('../models/Queue');
const Service = require('../models/Service');
const Ticket = require('../models/Ticket');
const ApiError = require('../utils/apiError');
const socketEmitter = require('../sockets/socketEmitter');
const { getWaitingCount } = require('../redis/queueRedis');

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

  // Count WAITING tickets
  const waitingCount = await Ticket.countDocuments({
    serviceId,
    status: 'WAITING',
  });

  // Calculate estimated wait in minutes
  const estimatedWait = waitingCount * (service.averageServiceTime || 10);

  // Fetch current active ticket if any
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

  // Fetch current active ticket (CALLED / SERVING)
  let currentTicket = null;
  if (queue.currentTicketId) {
    currentTicket = await Ticket.findById(queue.currentTicketId);
  }

  // Fetch FIFO waiting tickets
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

  const queue = await Queue.findOneAndUpdate(
    { serviceId },
    { status: 'OPEN', openedAt: new Date() },
    { new: true, upsert: true }
  );

  const waitingCount = await Ticket.countDocuments({ serviceId, status: 'WAITING' });

  // Socket notification
  socketEmitter.emitQueueStatusChanged(serviceId, ownerId, { status: 'OPEN' });
  socketEmitter.emitQueueUpdated(serviceId, ownerId, { status: 'OPEN', waitingCount });

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

  const queue = await Queue.findOneAndUpdate(
    { serviceId },
    { status: 'CLOSED', closedAt: new Date() },
    { new: true, upsert: true }
  );

  const waitingCount = await Ticket.countDocuments({ serviceId, status: 'WAITING' });

  // Socket notification
  socketEmitter.emitQueueStatusChanged(serviceId, ownerId, { status: 'CLOSED' });
  socketEmitter.emitQueueUpdated(serviceId, ownerId, { status: 'CLOSED', waitingCount });

  return queue;
};

module.exports = {
  getPublicQueue,
  getManageQueue,
  openQueue,
  closeQueue,
};
