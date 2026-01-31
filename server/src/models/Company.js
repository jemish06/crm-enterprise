const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    domain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    subdomain: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
    },
    plan: {
      type: String,
      enum: ['free'],
      default: 'free',
    },
    settings: {
      timezone: {
        type: String,
        default: 'UTC',
      },
      currency: {
        type: String,
        default: 'USD',
      },
      dateFormat: {
        type: String,
        default: 'MM/DD/YYYY',
      },
      timeFormat: {
        type: String,
        enum: ['12h', '24h'],
        default: '12h',
      },
      leadStages: {
        type: [String],
        default: ['new', 'contacted', 'qualified', 'proposal', 'negotiation'],
      },
      dealStages: {
        type: [String],
        default: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
      },
      leadSources: {
        type: [String],
        default: ['website', 'referral', 'social-media', 'cold-call', 'email-campaign', 'event', 'other'],
      },
      emailSettings: {
        smtpHost: String,
        smtpPort: Number,
        smtpUser: String,
        smtpPass: String,
        fromEmail: String,
        fromName: String,
      },
    },
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxUsers: {
      type: Number,
      default: 100, // Unlimited for free plan
    },
    totalUsers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
companySchema.index({ subdomain: 1 });
companySchema.index({ domain: 1 });
companySchema.index({ createdAt: -1 });

// Virtual for users
companySchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'tenantId',
});

module.exports = mongoose.model('Company', companySchema);
