const jwt = require('jsonwebtoken');
const Ticket = require('../models/Ticket');

let ioInstance = null;

const initSockets = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // 1. Join ticket room via public token or ticket ID
    socket.on('join:ticket', async ({ publicToken, ticketId }) => {
      try {
        let resolvedTicketId = ticketId;
        if (!resolvedTicketId && publicToken) {
          const ticket = await Ticket.findOne({ publicToken }).select('_id');
          if (ticket) {
            resolvedTicketId = ticket._id.toString();
          }
        }

        if (resolvedTicketId) {
          socket.join(`ticket:${resolvedTicketId}`);
        }
      } catch (err) {
        console.error('[Socket join:ticket error]', err.message);
      }
    });

    // 2. Join service queue room
    socket.on('join:service', ({ serviceId }) => {
      if (serviceId) {
        socket.join(`service:${serviceId}`);
      }
    });

    // 3. Join owner room (with optional JWT token auth)
    socket.on('join:owner', ({ ownerId, token }) => {
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'queueless_secret');
          if (decoded && decoded.id) {
            socket.join(`owner:${decoded.id}`);
            return;
          }
        } catch (err) {
          // Token invalid, fallback to ownerId if provided
        }
      }

      if (ownerId) {
        socket.join(`owner:${ownerId}`);
      }
    });

    // Leave rooms on demand
    socket.on('leave:ticket', ({ ticketId }) => {
      if (ticketId) socket.leave(`ticket:${ticketId}`);
    });

    socket.on('leave:service', ({ serviceId }) => {
      if (serviceId) socket.leave(`service:${serviceId}`);
    });
  });

  return io;
};

const getIO = () => ioInstance;

module.exports = {
  initSockets,
  getIO,
};
