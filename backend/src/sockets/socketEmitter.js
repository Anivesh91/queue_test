const { getIO } = require('./socketHandler');

const emitToRoom = (room, event, data) => {
  const io = getIO();
  if (io) {
    io.to(room).emit(event, data);
  }
};

const socketEmitter = {
  // Ticket Position Update (to specific ticket room)
  emitTicketPositionUpdated(ticketId, { peopleAhead, estimatedWaitMinutes, status }) {
    emitToRoom(`ticket:${ticketId}`, 'ticket:positionUpdated', {
      ticketId,
      peopleAhead,
      estimatedWaitMinutes,
      status,
      timestamp: new Date().toISOString(),
    });
  },

  // Ticket Called (to ticket room, service room, owner room, and global)
  emitTicketCalled(ticketId, serviceId, ownerId, data) {
    const payload = { ticketId, serviceId, ...data, timestamp: new Date().toISOString() };
    emitToRoom(`ticket:${ticketId}`, 'ticket:called', payload);
    emitToRoom(`service:${serviceId}`, 'ticket:called', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'ticket:called', payload);
    const io = getIO();
    if (io) io.emit('ticket:called', payload);
  },

  // Ticket Serving
  emitTicketServing(ticketId, serviceId, ownerId, data) {
    const payload = { ticketId, serviceId, ...data, timestamp: new Date().toISOString() };
    emitToRoom(`ticket:${ticketId}`, 'ticket:serving', payload);
    emitToRoom(`service:${serviceId}`, 'ticket:serving', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'ticket:serving', payload);
    const io = getIO();
    if (io) io.emit('ticket:serving', payload);
  },

  // Ticket Completed
  emitTicketCompleted(ticketId, serviceId, ownerId, data) {
    const payload = { ticketId, serviceId, ...data, timestamp: new Date().toISOString() };
    emitToRoom(`ticket:${ticketId}`, 'ticket:completed', payload);
    emitToRoom(`service:${serviceId}`, 'ticket:completed', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'ticket:completed', payload);
    const io = getIO();
    if (io) io.emit('ticket:completed', payload);
  },

  // Ticket Cancelled
  emitTicketCancelled(ticketId, serviceId, ownerId, data) {
    const payload = { ticketId, serviceId, ...data, timestamp: new Date().toISOString() };
    emitToRoom(`ticket:${ticketId}`, 'ticket:cancelled', payload);
    emitToRoom(`service:${serviceId}`, 'ticket:cancelled', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'ticket:cancelled', payload);
    const io = getIO();
    if (io) io.emit('ticket:cancelled', payload);
  },

  // Ticket No-Show
  emitTicketNoShow(ticketId, serviceId, ownerId, data) {
    const payload = { ticketId, serviceId, ...data, timestamp: new Date().toISOString() };
    emitToRoom(`ticket:${ticketId}`, 'ticket:noShow', payload);
    emitToRoom(`service:${serviceId}`, 'ticket:noShow', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'ticket:noShow', payload);
    const io = getIO();
    if (io) io.emit('ticket:noShow', payload);
  },

  // Queue state/waiting count updated - emitted to room and globally
  emitQueueUpdated(serviceId, ownerId, data) {
    const payload = { serviceId, ...data, timestamp: new Date().toISOString() };
    emitToRoom(`service:${serviceId}`, 'queue:updated', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'queue:updated', payload);
    const io = getIO();
    if (io) io.emit('queue:updated', payload);
  },

  // Queue OPEN/CLOSED changed - emitted to room and globally
  emitQueueStatusChanged(serviceId, ownerId, data) {
    const payload = { serviceId, ...data, timestamp: new Date().toISOString() };
    emitToRoom(`service:${serviceId}`, 'queue:statusChanged', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'queue:statusChanged', payload);
    const io = getIO();
    if (io) io.emit('queue:statusChanged', payload);
  },
};

module.exports = socketEmitter;
