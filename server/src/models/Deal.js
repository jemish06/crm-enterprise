const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    dealNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, 'Deal name is required'],
      trim: true,
      maxlength: [100, 'Deal name cannot exceed 100 characters'],
    },
    value: {
      type: Number,
      required: [true, 'Deal value is required'],
      min: 0,
    },
    probability: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    expectedCloseDate: {
      type: Date,
    },
    actualCloseDate: {
      type: Date,
    },
    stage: {
      type: String,
      enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
      default: 'prospecting',
      index: true,
    },
    pipeline: {
      type: String,
      default: 'sales',
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      index: true,
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    products: [{
      name: String,
      quantity: {
        type: Number,
        min: 1,
        default: 1,
      },
      price: {
        type: Number,
        min: 0,
      },
      discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      total: Number,
    }],
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
    lostReason: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
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
dealSchema.index({ tenantId: 1, dealNumber: 1 }, { unique: true });
dealSchema.index({ tenantId: 1, stage: 1 });
dealSchema.index({ tenantId: 1, assignedTo: 1 });
dealSchema.index({ tenantId: 1, account: 1 });
dealSchema.index({ tenantId: 1, expectedCloseDate: 1 });

// Text search
dealSchema.index({
  name: 'text',
  description: 'text',
});

// Virtual for weighted value
dealSchema.virtual('weightedValue').get(function () {
  return (this.value * this.probability) / 100;
});

// Pre-save: generate deal number
dealSchema.pre('save', async function () {
  if (this.isNew && !this.dealNumber) {
    try {
      const count = await this.constructor.countDocuments({ tenantId: this.tenantId });
      const year = new Date().getFullYear();
      this.dealNumber = `DEAL-${year}-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  
  // Set close date when won/lost
  if (this.isModified('stage') && ['closed-won', 'closed-lost'].includes(this.stage)) {
    this.actualCloseDate = new Date();
  }
  

});

module.exports = mongoose.model('Deal', dealSchema);
