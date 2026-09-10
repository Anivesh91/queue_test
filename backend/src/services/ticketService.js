const Ticket = require('../models/Ticket');
const Queue = require('../models/Queue');
const Service = require('../models/Service');
const Organization = require('../models/Organization');
const ApiError = require('../utils/apiError');
const { generatePublicToken, formatTicketNumber } = require('../utils/tokenGenerator');
const socketEmitter = require('../sockets/socketEmitter');
const {
  pushWaitingTicket,
  popNextWaitingTicket,
  removeWaitingTicket,
  getNextSequence,
} = require('../redis/queueRedis');

const notifyWaitingPositions = async (serviceId, avgServiceTime) => {
  try {
    const waitingTickets = await Ticket.find({ serviceId, status: 'WAITING' })
      .sort({ sequenceNumber: 1 })
      .select('_id sequenceNumber');

    waitingTickets.forEach((t, index) => {
      const peopleAhead = index;
      const estimatedWaitMinutes = peopleAhead * (avgServiceTime || 10);
      socketEmitter.emitTicketPositionUpdated(t._id.toString(), {
        peopleAhead,
        estimatedWaitMinutes,
        status: 'WAITING',
      });
    });
  } catch (err) {
    console.error('[notifyWaitingPositions error]', err.message);
  }
};

const joinQueue = async (serviceId, { name, phone }) => {
  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    throw new ApiError(404, 'Service is unavailable or inactive.');
  }

  const org = await Organization.findById(service.organizationId);
  if (!org || !org.isActive) {
    throw new ApiError(404, 'Organization is currently inactive.');
  }

  const cleanPhone = phone.trim();
  const cleanName = name.trim();

  // Return existing active ticket if customer rejoins
  const existingActiveTicket = await Ticket.findOne({
    serviceId,
    customerPhone: cleanPhone,
    status: { $in: ['WAITING', 'CALLED', 'SERVING'] },
  });

  if (existingActiveTicket) {
    let peopleAhead = 0;
    let estimatedWaitMinutes = 0;

    if (existingActiveTicket.status === 'WAITING') {
      peopleAhead = await Ticket.countDocuments({
        serviceId,
        status: 'WAITING',
        sequenceNumber: { $lt: existingActiveTicket.sequenceNumber },
      });
      estimatedWaitMinutes = peopleAhead * (service.averageServiceTime || 10);
    }

    return {
      ticket: {
        id: existingActiveTicket._id,
        publicToken: existingActiveTicket.publicToken,
        ticketNumber: existingActiveTicket.ticketNumber,
        customerName: existingActiveTicket.customerName,
        customerPhone: existingActiveTicket.customerPhone,
        status: existingActiveTicket.status,
        joinedAt: existingActiveTicket.joinedAt,
        serviceName: service.name,
        organizationName: org.name,
      },
      peopleAhead,
      estimatedWaitMinutes,
      publicToken: existingActiveTicket.publicToken,
      isExisting: true,
      message: `Welcome back! Restored your existing ticket #${existingActiveTicket.ticketNumber}.`,
    };
  }

  let queue = await Queue.findOne({ serviceId });
  if (!queue || queue.status !== 'OPEN') {
    throw new ApiError(409, 'Queue is currently closed. New joins are not accepted at this time.');
  }

  let sequenceNumber = await getNextSequence(serviceId, queue.lastSequenceNumber);
  if (!sequenceNumber) {
    const updatedQueue = await Queue.findOneAndUpdate(
      { serviceId },
      { $inc: { lastSequenceNumber: 1 } },
      { new: true }
    );
    sequenceNumber = updatedQueue.lastSequenceNumber;
  } else {
    await Queue.updateOne({ serviceId }, { lastSequenceNumber: sequenceNumber });
  }

  const ticketNumber = formatTicketNumber(service.ticketPrefix, sequenceNumber);
  const publicToken = generatePublicToken();

  const ticket = await Ticket.create({
    publicToken,
    ticketNumber,
    sequenceNumber,
    organizationId: org._id,
    serviceId: service._id,
    queueId: queue._id,
    customerName: cleanName,
    customerPhone: cleanPhone,
    status: 'WAITING',
    joinedAt: new Date(),
  });

  await pushWaitingTicket(serviceId, ticket._id);

  const peopleAhead = await Ticket.countDocuments({
    serviceId,
    status: 'WAITING',
    sequenceNumber: { $lt: sequenceNumber },
  });
  const estimatedWaitMinutes = peopleAhead * (service.averageServiceTime || 10);
  const waitingCount = peopleAhead + 1;

  socketEmitter.emitQueueUpdated(serviceId.toString(), org.ownerId.toString(), {
    waitingCount,
    lastJoinedTicket: {
      ticketNumber,
      customerName: cleanName,
      joinedAt: ticket.joinedAt,
    },
  });

  return {
    ticket: {
      id: ticket._id,
      publicToken: ticket.publicToken,
      ticketNumber: ticket.ticketNumber,
      customerName: ticket.customerName,
      customerPhone: ticket.customerPhone,
      status: ticket.status,
      joinedAt: ticket.joinedAt,
      serviceName: service.name,
      organizationName: org.name,
    },
    peopleAhead,
    estimatedWaitMinutes,
    publicToken,
    isExisting: false,
  };
};

const lookupActiveTicketsByPhone = async (phone) => {
  if (!phone || phone.trim().length < 4) {
    throw new ApiError(400, 'Please provide a valid phone number.');
  }

  const cleanPhone = phone.trim();
  const activeTickets = await Ticket.find({
    customerPhone: cleanPhone,
    status: { $in: ['WAITING', 'CALLED', 'SERVING'] },
  })
    .populate('serviceId', 'name ticketPrefix averageServiceTime')
    .populate('organizationId', 'name slug category')
    .sort({ joinedAt: -1 });

  const formattedTickets = await Promise.all(
    activeTickets.map(async (t) => {
      let peopleAhead = 0;
      let estimatedWaitMinutes = 0;

      if (t.status === 'WAITING' && t.serviceId) {
        peopleAhead = await Ticket.countDocuments({
          serviceId: t.serviceId._id,
          status: 'WAITING',
          sequenceNumber: { $lt: t.sequenceNumber },
        });
        estimatedWaitMinutes = peopleAhead * (t.serviceId.averageServiceTime || 10);
      }

      return {
        id: t._id,
        publicToken: t.publicToken,
        ticketNumber: t.ticketNumber,
        customerName: t.customerName,
        customerPhone: t.customerPhone,
        status: t.status,
        joinedAt: t.joinedAt,
        calledAt: t.calledAt,
        service: t.serviceId,
        organization: t.organizationId,
        peopleAhead,
        estimatedWaitMinutes,
      };
    })
  );

  return { tickets: formattedTickets };
};

const trackTicket = async (publicToken) => {
  const ticket = await Ticket.findOne({ publicToken })
    .populate('serviceId', 'name ticketPrefix averageServiceTime isActive')
    .populate('organizationId', 'name slug category phone city address')
    .populate('queueId', 'status currentTicketId');

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found. Please check your link.');
  }

  let peopleAhead = 0;
  let estimatedWaitMinutes = 0;

  if (ticket.status === 'WAITING') {
    peopleAhead = await Ticket.countDocuments({
      serviceId: ticket.serviceId._id,
      status: 'WAITING',
      sequenceNumber: { $lt: ticket.sequenceNumber },
    });
    estimatedWaitMinutes = peopleAhead * (ticket.serviceId.averageServiceTime || 10);
  }

  let currentServingTicketNumber = null;
  if (ticket.queueId && ticket.queueId.currentTicketId) {
    const currentTicket = await Ticket.findById(ticket.queueId.currentTicketId).select('ticketNumber status');
    if (currentTicket) {
      currentServingTicketNumber = currentTicket.ticketNumber;
    }
  }

  return {
    ticket: {
      id: ticket._id,
      publicToken: ticket.publicToken,
      ticketNumber: ticket.ticketNumber,
      sequenceNumber: ticket.sequenceNumber,
      customerName: ticket.customerName,
      customerPhone: ticket.customerPhone,
      status: ticket.status,
      joinedAt: ticket.joinedAt,
      calledAt: ticket.calledAt,
      serviceStartedAt: ticket.serviceStartedAt,
      completedAt: ticket.completedAt,
      cancelledAt: ticket.cancelledAt,
      noShowAt: ticket.noShowAt,
    },
    service: ticket.serviceId,
    organization: ticket.organizationId,
    queueStatus: ticket.queueId ? ticket.queueId.status : 'CLOSED',
    currentServingTicketNumber,
    peopleAhead,
    estimatedWaitMinutes,
  };
};

const cancelTicket = async (publicToken) => {
  const ticket = await Ticket.findOne({ publicToken })
    .populate('serviceId')
    .populate('organizationId');

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  if (ticket.status !== 'WAITING') {
    throw new ApiError(409, `Only waiting tickets can be cancelled. Current status is ${ticket.status}.`);
  }

  ticket.status = 'CANCELLED';
  ticket.cancelledAt = new Date();
  await ticket.save();

  await removeWaitingTicket(ticket.serviceId._id, ticket._id);

  const ownerId = ticket.organizationId ? ticket.organizationId.ownerId.toString() : null;
  const serviceId = ticket.serviceId._id.toString();

  socketEmitter.emitTicketCancelled(ticket._id.toString(), serviceId, ownerId, {
    ticketNumber: ticket.ticketNumber,
  });

  const waitingCount = await Ticket.countDocuments({ serviceId, status: 'WAITING' });
  socketEmitter.emitQueueUpdated(serviceId, ownerId, { waitingCount });
  notifyWaitingPositions(serviceId, ticket.serviceId.averageServiceTime);

  return { message: 'Ticket cancelled successfully.', ticket };
};

const callNextTicket = async (ownerId, serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId');
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  if (service.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this service.');
  }

  const queue = await Queue.findOne({ serviceId });
  if (!queue) {
    throw new ApiError(404, 'Queue not found.');
  }

  if (queue.currentTicketId) {
    const activeCurrent = await Ticket.findById(queue.currentTicketId);
    if (activeCurrent && ['CALLED', 'SERVING'].includes(activeCurrent.status)) {
      throw new ApiError(
        409,
        `Cannot call next ticket while ticket ${activeCurrent.ticketNumber} is currently ${activeCurrent.status}. Complete or mark it as No-Show first.`
      );
    }
  }

  const nextTicket = await Ticket.findOneAndUpdate(
    { serviceId, status: 'WAITING' },
    { status: 'CALLED', calledAt: new Date() },
    { sort: { sequenceNumber: 1 }, new: true }
  );

  if (!nextTicket) {
    throw new ApiError(409, 'No customers are currently waiting in the queue.');
  }

  queue.currentTicketId = nextTicket._id;
  await queue.save();

  await popNextWaitingTicket(serviceId);

  const ownerIdStr = ownerId.toString();
  const serviceIdStr = serviceId.toString();

  socketEmitter.emitTicketCalled(nextTicket._id.toString(), serviceIdStr, ownerIdStr, {
    ticketNumber: nextTicket.ticketNumber,
    customerName: nextTicket.customerName,
    calledAt: nextTicket.calledAt,
  });

  const waitingCount = await Ticket.countDocuments({ serviceId, status: 'WAITING' });
  socketEmitter.emitQueueUpdated(serviceIdStr, ownerIdStr, {
    waitingCount,
    currentTicket: {
      id: nextTicket._id,
      ticketNumber: nextTicket.ticketNumber,
      customerName: nextTicket.customerName,
      customerPhone: nextTicket.customerPhone,
      status: nextTicket.status,
      calledAt: nextTicket.calledAt,
    },
  });

  notifyWaitingPositions(serviceId, service.averageServiceTime);

  return {
    ticket: nextTicket,
    queue,
    waitingCount,
  };
};

const startServingTicket = async (ownerId, ticketId) => {
  const ticket = await Ticket.findById(ticketId).populate({
    path: 'serviceId',
    populate: { path: 'organizationId' },
  });

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  if (ticket.serviceId.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this ticket.');
  }

  if (ticket.status !== 'CALLED') {
    throw new ApiError(409, `Only CALLED tickets can be marked as SERVING. Current status is ${ticket.status}.`);
  }

  ticket.status = 'SERVING';
  ticket.serviceStartedAt = new Date();
  await ticket.save();

  const serviceIdStr = ticket.serviceId._id.toString();
  const ownerIdStr = ownerId.toString();

  socketEmitter.emitTicketServing(ticket._id.toString(), serviceIdStr, ownerIdStr, {
    ticketNumber: ticket.ticketNumber,
    serviceStartedAt: ticket.serviceStartedAt,
  });

  return ticket;
};

const completeTicket = async (ownerId, ticketId) => {
  const ticket = await Ticket.findById(ticketId).populate({
    path: 'serviceId',
    populate: { path: 'organizationId' },
  });

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  if (ticket.serviceId.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this ticket.');
  }

  if (ticket.status !== 'SERVING') {
    throw new ApiError(409, `Only SERVING tickets can be completed. Current status is ${ticket.status}.`);
  }

  ticket.status = 'COMPLETED';
  ticket.completedAt = new Date();
  await ticket.save();

  const serviceIdStr = ticket.serviceId._id.toString();
  await Queue.updateOne({ serviceId: serviceIdStr, currentTicketId: ticket._id }, { currentTicketId: null });

  const ownerIdStr = ownerId.toString();

  socketEmitter.emitTicketCompleted(ticket._id.toString(), serviceIdStr, ownerIdStr, {
    ticketNumber: ticket.ticketNumber,
    completedAt: ticket.completedAt,
  });

  const waitingCount = await Ticket.countDocuments({ serviceId: serviceIdStr, status: 'WAITING' });
  socketEmitter.emitQueueUpdated(serviceIdStr, ownerIdStr, {
    waitingCount,
    currentTicket: null,
  });

  return ticket;
};

const markNoShowTicket = async (ownerId, ticketId) => {
  const ticket = await Ticket.findById(ticketId).populate({
    path: 'serviceId',
    populate: { path: 'organizationId' },
  });

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  if (ticket.serviceId.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this ticket.');
  }

  if (ticket.status !== 'CALLED') {
    throw new ApiError(409, `Only CALLED tickets can be marked as NO_SHOW. Current status is ${ticket.status}.`);
  }

  ticket.status = 'NO_SHOW';
  ticket.noShowAt = new Date();
  await ticket.save();

  const serviceIdStr = ticket.serviceId._id.toString();
  await Queue.updateOne({ serviceId: serviceIdStr, currentTicketId: ticket._id }, { currentTicketId: null });

  const ownerIdStr = ownerId.toString();

  socketEmitter.emitTicketNoShow(ticket._id.toString(), serviceIdStr, ownerIdStr, {
    ticketNumber: ticket.ticketNumber,
    noShowAt: ticket.noShowAt,
  });

  const waitingCount = await Ticket.countDocuments({ serviceId: serviceIdStr, status: 'WAITING' });
  socketEmitter.emitQueueUpdated(serviceIdStr, ownerIdStr, {
    waitingCount,
    currentTicket: null,
  });

  return ticket;
};

module.exports = {
  joinQueue,
  lookupActiveTicketsByPhone,
  trackTicket,
  cancelTicket,
  callNextTicket,
  startServingTicket,
  completeTicket,
  markNoShowTicket,
};
