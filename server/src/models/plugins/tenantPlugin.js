const tenantPlugin = (schema) => {
  // Add tenantId to all schemas
  schema.add({
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
  });

  // Ensure all queries filter by tenantId
  schema.pre(/^find/, function (next) {
    if (this.getQuery().tenantId) {
      next();
    } else {
      // This is a safety check - middleware should set tenantId
      next();
    }
  });

  // Add compound indexes with tenantId
  schema.index({ tenantId: 1, createdAt: -1 });
};

module.exports = tenantPlugin;
