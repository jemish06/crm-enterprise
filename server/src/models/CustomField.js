const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: ['lead', 'contact', 'deal', 'account'],
      required: true,
    },
    fieldName: {
      type: String,
      required: [true, 'Field name is required'],
      trim: true,
    },
    label: {
      type: String,
      required: [true, 'Field label is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'multiselect', 'checkbox', 'textarea', 'url', 'email', 'phone'],
      required: true,
    },
    options: [{
      type: String,
      trim: true,
    }],
    isRequired: {
      type: Boolean,
      default: false,
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
customFieldSchema.index({ tenantId: 1, module: 1, fieldName: 1 }, { unique: true });
customFieldSchema.index({ tenantId: 1, module: 1, order: 1 });

module.exports = mongoose.model('CustomField', customFieldSchema);
