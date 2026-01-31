const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Email body is required'],
    },
    variables: [{
      type: String,
      trim: true,
    }],
    category: {
      type: String,
      enum: ['lead', 'contact', 'deal', 'follow-up', 'meeting', 'general'],
      default: 'general',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
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
emailTemplateSchema.index({ tenantId: 1, name: 1 });
emailTemplateSchema.index({ tenantId: 1, category: 1 });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
