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

/**
 * Broadcast updated position and ETA to all waiting tickets in a queue
 */
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

/**
 * Guest joins an OPEN queue
 */
const joinQueue = async (serviceId, { name, phone }) => {
  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    throw new ApiError(404, 'Service is unavailable or inactive.');
  }

  const org = await Organization.findById(service.organizationId);
  if (!org || !org.isActive) {
    throw new ApiError(404, 'Organization is currently inactive.');
  }

  // 1. Check queue status (must be OPEN)
  let queue = await Queue.findOne({ serviceId });
  if (!queue || queue.status !== 'OPEN') {
    throw new ApiError(409, 'Queue is currently closed. New joins are not accepted at this time.');
  }

  const cleanPhone = phone.trim();
  const cleanName = name.trim();

  // 2. Duplicate active ticket prevention (same phone + same service)
  const existingActiveTicket = await Ticket.findOne({
    serviceId,
    customerPhone: cleanPhone,
    status: { $in: ['WAITING', 'CALLED', 'SERVING'] },
  });

  if (existingActiveTicket) {
    throw new ApiError(
      409,
      `You already have an active ticket (${existingActiveTicket.ticketNumber}) in this queue.`
    );
  }

  // 3. Allocate atomic sequence number
  let sequenceNumber = await getNextSequence(serviceId, queue.lastSequenceNumber);
  if (!sequenceNumber) {
    // MongoDB atomic fallback
    const updatedQueue = await Queue.findOneAndUpdate(
      { serviceId },
      { $inc: { lastSequenceNumber: 1 } },
      { new: true }
    );
    sequenceNumber = updatedQueue.lastSequenceNumber;
  } else {
    // Keep Mongo queue.lastSequenceNumber in sync
    await Queue.updateOne({ serviceId }, { lastSequenceNumber: sequenceNumber });
  }

  const ticketNumber = formatTicketNumber(service.ticketPrefix, sequenceNumber);
  const publicToken = generatePublicToken();

  // 4. Create Ticket document
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

  // 5. Push to Redis FIFO queue
  await pushWaitingTicket(serviceId, ticket._id);

  // 6. Calculate position & ETA
  const peopleAhead = await Ticket.countDocuments({
    serviceId,
    status: 'WAITING',
    sequenceNumber: { $lt: sequenceNumber },
  });
  const estimatedWaitMinutes = peopleAhead * (service.averageServiceTime || 10);
  const waitingCount = peopleAhead + 1;

  // 7. Emit Realtime Updates
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
  };
};

/**
 * Public track ticket by publicToken
 */
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

  // Active called/serving ticket in the queue for context
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

/**
 * Guest cancels WAITING ticket
 */
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

  // Remove from Redis list
  await removeWaitingTicket(ticket.serviceId._id, ticket._id);

  const ownerId = ticket.organizationId ? ticket.organizationId.ownerId.toString() : null;
  const serviceId = ticket.serviceId._id.toString();

  // Emit ticket cancelled event
  socketEmitter.emitTicketCancelled(ticket._id.toString(), serviceId, ownerId, {
    ticketNumber: ticket.ticketNumber,
  });

  // Recalculate remaining waiting tickets
  const waitingCount = await Ticket.countDocuments({ serviceId, status: 'WAITING' });
  socketEmitter.emitQueueUpdated(serviceId, ownerId, { waitingCount });
  notifyWaitingPositions(serviceId, ticket.serviceId.averageServiceTime);

  return { message: 'Ticket cancelled successfully.', ticket };
};

/**
 * Owner calls next ticket (FIFO)
 */
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

  // 1. Enforce single active operational ticket rule:
  // If there is already a CALLED or SERVING ticket, owner must finish it before calling next
  if (queue.currentTicketId) {
    const activeCurrent = await Ticket.findById(queue.currentTicketId);
    if (activeCurrent && ['CALLED', 'SERVING'].includes(activeCurrent.status)) {
      throw new ApiError(
        409,
        `Cannot call next ticket while ticket ${activeCurrent.ticketNumber} is currently ${activeCurrent.status}. Complete or mark it as No-Show first.`
      );
    }
  }

  // 2. Select next WAITING ticket atomically (FIFO: smallest sequenceNumber)
  const nextTicket = await Ticket.findOneAndUpdate(
    { serviceId, status: 'WAITING' },
    { status: 'CALLED', calledAt: new Date() },
    { sort: { sequenceNumber: 1 }, new: true }
  );

  if (!nextTicket) {
    throw new ApiError(409, 'No customers are currently waiting in the queue.');
  }

  // 3. Update queue pointer
  queue.currentTicketId = nextTicket._id;
  await queue.save();

  // Pop from Redis
  await popNextWaitingTicket(serviceId);

  const ownerIdStr = ownerId.toString();
  const serviceIdStr = serviceId.toString();

  // 4. Emit real-time events
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

  // 5. Update positions for remaining waiting tickets
  notifyWaitingPositions(serviceId, service.averageServiceTime);

  return {
    ticket: nextTicket,
    queue,
    waitingCount,
  };
};

/**
 * Owner starts serving CALLED ticket (CALLED -> SERVING)
 */
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

/**
 * Owner completes SERVING ticket (SERVING -> COMPLETED, clear current)
 */
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

  // Clear current ticket pointer in queue
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

/**
 * Owner marks CALLED ticket as NO_SHOW (CALLED -> NO_SHOW, clear current)
 */
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

  // Clear current ticket pointer in queue
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
  trackTicket,
  cancelTicket,
  callNextTicket,
  startServingTicket,
  completeTicket,
  markNoShowTicket,
};
