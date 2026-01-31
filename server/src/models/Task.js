const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['task', 'follow-up', 'meeting', 'call', 'email'],
      default: 'task',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    relatedTo: {
      type: {
        type: String,
        enum: ['Lead', 'Contact', 'Deal', 'Account'],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedTo.type',
      },
    },
    reminder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      time: Date,
      sent: {
        type: Boolean,
        default: false,
      },
    },
    completedAt: {
      type: Date,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes
taskSchema.index({ tenantId: 1, assignedTo: 1, status: 1 });
taskSchema.index({ tenantId: 1, dueDate: 1 });
taskSchema.index({ tenantId: 1, priority: 1 });
taskSchema.index({ 'relatedTo.type': 1, 'relatedTo.id': 1 });

// Text search
taskSchema.index({
  title: 'text',
  description: 'text',
});

// Virtual for overdue
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return this.dueDate && this.dueDate < new Date();
});

module.exports = mongoose.model('Task', taskSchema);
