const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    s3Key: {
      type: String,
    },
    s3Url: {
      type: String,
    },
    localPath: {
      type: String,
    },
    relatedTo: {
      type: {
        type: String,
        enum: ['lead', 'contact', 'deal', 'account', 'task'],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedTo.type',
      },
    },
    uploadedBy: {
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
fileSchema.index({ tenantId: 1, createdAt: -1 });
fileSchema.index({ 'relatedTo.type': 1, 'relatedTo.id': 1 });
fileSchema.index({ tenantId: 1, uploadedBy: 1 });

module.exports = mongoose.model('File', fileSchema);
