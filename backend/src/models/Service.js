const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    ticketPrefix: {
      type: String,
      required: [true, 'Ticket prefix is required'],
      trim: true,
      uppercase: true,
      maxlength: [5, 'Ticket prefix cannot exceed 5 characters'],
      match: [/^[A-Z0-9]+$/, 'Ticket prefix must be alphanumeric'],
    },
    averageServiceTime: {
      type: Number,
      required: [true, 'Average service time is required'],
      min: [1, 'Average service time must be at least 1 minute'],
      max: [300, 'Average service time cannot exceed 300 minutes'],
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: ticketPrefix unique within each organization
serviceSchema.index({ organizationId: 1, ticketPrefix: 1 }, { unique: true });

module.exports = mongoose.model('Service', serviceSchema);
