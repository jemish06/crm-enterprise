// server/src/models/Counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  entity: {
    type: String,
    required: true, // lead | contact | deal
  },
  year: {
    type: Number,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

counterSchema.index(
  { tenantId: 1, entity: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model('Counter', counterSchema);
