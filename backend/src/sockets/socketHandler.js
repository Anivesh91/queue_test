const jwt = require('jsonwebtoken');
const Ticket = require('../models/Ticket');

let ioInstance = null;

const initSockets = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
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

    socket.on('join:service', ({ serviceId }) => {
      if (serviceId) {
        socket.join(`service:${serviceId}`);
      }
    });

    socket.on('join:owner', ({ ownerId, token }) => {
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'queueless_secret');
          if (decoded && decoded.id) {
            socket.join(`owner:${decoded.id}`);
            return;
          }
        } catch (err) {
          // ignore invalid token and check ownerId
        }
      }

      if (ownerId) {
        socket.join(`owner:${ownerId}`);
      }
    });

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
