const mongoose = require('mongoose');

const TICKET_STATUSES = [
  'WAITING',
  'CALLED',
  'SERVING',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

const ticketSchema = new mongoose.Schema(
  {
    publicToken: {
      type: String,
      required: [true, 'Public token is required'],
      unique: true,
      index: true,
    },
    ticketNumber: {
      type: String,
      required: [true, 'Ticket number is required'],
      trim: true,
    },
    sequenceNumber: {
      type: Number,
      required: [true, 'Sequence number is required'],
    },
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
      index: true,
    },
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: [true, 'Queue ID is required'],
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: 'WAITING',
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    serviceStartedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    noShowAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes matching Master Specification Page 15
ticketSchema.index({ queueId: 1, ticketNumber: 1 }, { unique: true });
ticketSchema.index({ queueId: 1, sequenceNumber: 1 }, { unique: true });
ticketSchema.index({ queueId: 1, status: 1, sequenceNumber: 1 });
ticketSchema.index({ serviceId: 1, customerPhone: 1, status: 1 });

ticketSchema.statics.STATUSES = TICKET_STATUSES;
ticketSchema.statics.ACTIVE_STATUSES = ['WAITING', 'CALLED', 'SERVING'];
ticketSchema.statics.TERMINAL_STATUSES = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];

module.exports = mongoose.model('Ticket', ticketSchema);
