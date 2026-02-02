const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    leadNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls during creation
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'social-media', 'cold-call', 'email-campaign', 'event', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'lost', 'converted'],
      default: 'new',
      index: true,
    },
    stage: {
      type: String,
      enum: ['awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase'],
      default: 'awareness',
    },
    value: {
      type: Number,
      default: 0,
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
    convertedToContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
    },
    convertedToDeal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
    },
    convertedAt: {
      type: Date,
    },
    lostReason: {
      type: String,
    },
    lostAt: {
      type: Date,
    },
    lastContactedAt: {
      type: Date,
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

// Compound indexes
leadSchema.index({ tenantId: 1, leadNumber: 1 }, { unique: true });
leadSchema.index({ tenantId: 1, status: 1 });
leadSchema.index({ tenantId: 1, assignedTo: 1 });
leadSchema.index({ tenantId: 1, source: 1 });
leadSchema.index({ tenantId: 1, createdAt: -1 });
leadSchema.index({ tenantId: 1, email: 1 });

// Full-text search index
leadSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  company: 'text',
});

// Virtual for full name
leadSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for activities
leadSchema.virtual('activities', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'relatedTo.id',
});

// Virtual for tasks
leadSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'relatedTo.id',
});

// Pre-save middleware to generate lead number
// Pre-save middleware to generate lead number
leadSchema.pre('save', async function () {
  if (this.isNew && !this.leadNumber) {
    try {
      const year = new Date().getFullYear();
      
      // Find the last lead number for this tenant in current year
      const lastLead = await this.constructor
        .findOne({ 
          tenantId: this.tenantId,
          leadNumber: new RegExp(`^LEAD-${year}-`)
        })
        .sort({ leadNumber: -1 })
        .select('leadNumber')
        .lean();
      
      let nextNumber = 1;
      
      if (lastLead && lastLead.leadNumber) {
        // Extract number from LEAD-2026-000123 -> 123
        const lastNumber = parseInt(lastLead.leadNumber.split('-')[2]);
        nextNumber = lastNumber + 1;
      }
      
      // Pad with zeros: 1 -> 000001
      this.leadNumber = `LEAD-${year}-${String(nextNumber).padStart(6, '0')}`;
      
      
    } catch (error) {
      next(error);
    }
  } else {
    
  }
});


module.exports = mongoose.model('Lead', leadSchema);
