const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'call',
        'email',
        'meeting',
        'note',
        'task_created',
        'task_completed',
        'lead_created',
        'lead_converted',
        'contact_created',
        'deal_created',
        'deal_won',
        'deal_lost',
        'stage_change',
        'status_change',
        'other',
      ],
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    relatedTo: {
      type: {
        type: String,
        enum: ['Lead', 'Contact', 'Deal', 'Account', 'Task'],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedTo.type',
      },
    },
    duration: {
      type: Number, // in minutes
      min: 0,
    },
    outcome: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
activitySchema.index({ tenantId: 1, type: 1 });
activitySchema.index({ tenantId: 1, createdAt: -1 });
activitySchema.index({ 'relatedTo.type': 1, 'relatedTo.id': 1 });
activitySchema.index({ tenantId: 1, createdBy: 1 });

// Text search
activitySchema.index({
  subject: 'text',
  description: 'text',
});

module.exports = mongoose.model('Activity', activitySchema);
