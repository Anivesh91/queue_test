const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required'],
      unique: true, // 1 service -> 1 queue
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'CLOSED',
      index: true,
    },
    currentTicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
    },
    lastSequenceNumber: {
      type: Number,
      default: 0,
    },
    openedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Queue', queueSchema);
