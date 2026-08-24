const mongoose = require('mongoose');

const CATEGORIES = [
  'HOSPITAL_CLINIC',
  'SALON_BARBER',
  'DIAGNOSTIC_CENTER',
  'REPAIR_SERVICE_CENTER',
  'CONSULTATION_CENTER',
  'OTHER',
];

const organizationSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      unique: true, // 1 owner -> 1 organization
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [120, 'Organization name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'OTHER',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
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

// Compound index for efficient public search
organizationSchema.index({ category: 1, city: 1, isActive: 1 });
organizationSchema.index({ name: 'text', description: 'text', city: 'text' });

organizationSchema.statics.generateSlug = function (name) {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
};

organizationSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Organization', organizationSchema);
