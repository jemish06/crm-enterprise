const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    trigger: {
      type: {
        type: String,
        enum: [
          'lead_created',
          'lead_updated',
          'lead_stage_change',
          'deal_created',
          'deal_stage_change',
          'task_created',
          'task_completed',
          'contact_created',
        ],
        required: true,
      },
      conditions: [{
        field: String,
        operator: {
          type: String,
          enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'],
        },
        value: mongoose.Schema.Types.Mixed,
      }],
    },
    actions: [{
      type: {
        type: String,
        enum: ['send_email', 'assign_user', 'create_task', 'update_field', 'send_notification'],
        required: true,
      },
      config: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
      delay: {
        type: Number, // delay in minutes
        default: 0,
      },
      order: {
        type: Number,
        default: 0,
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    executionCount: {
      type: Number,
      default: 0,
    },
    lastExecutedAt: {
      type: Date,
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
workflowSchema.index({ tenantId: 1, 'trigger.type': 1, isActive: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
