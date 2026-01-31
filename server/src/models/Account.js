const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    accountNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: [100, 'Account name cannot exceed 100 characters'],
    },
    website: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['prospect', 'customer', 'partner', 'vendor', 'competitor', 'other'],
      default: 'customer',
    },
    employees: {
      type: Number,
      min: 0,
    },
    annualRevenue: {
      type: Number,
      min: 0,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    notes: [{
      content: {
        type: String,
        required: true,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
accountSchema.index({ tenantId: 1, accountNumber: 1 });
accountSchema.index({ tenantId: 1, name: 1 });
accountSchema.index({ tenantId: 1, assignedTo: 1 });
accountSchema.index({ tenantId: 1, type: 1 });

// Text search
accountSchema.index({
  name: 'text',
  website: 'text',
  industry: 'text',
});

// Virtual for contacts
accountSchema.virtual('contacts', {
  ref: 'Contact',
  localField: '_id',
  foreignField: 'account',
});

// Virtual for deals
accountSchema.virtual('deals', {
  ref: 'Deal',
  localField: '_id',
  foreignField: 'account',
});

// Pre-save: generate account number
accountSchema.pre('save', async function () {
  if (this.isNew && !this.accountNumber) {
    try {
      const count = await this.constructor.countDocuments({ tenantId: this.tenantId });
      const year = new Date().getFullYear();
      this.accountNumber = `ACC-${year}-${String(count + 1).padStart(6, '0')}`;
      
    } catch (error) {
      next(error);
    }
  } else {
    
  }
});

module.exports = mongoose.model('Account', accountSchema);
