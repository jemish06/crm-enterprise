const Lead = require('../models/Lead');

class LeadRepository {
  async create(tenantId, leadData) {
    return Lead.create({ tenantId, ...leadData });
  }

  async findById(tenantId, leadId, populate = []) {
    let query = Lead.findOne({ tenantId, _id: leadId });
    
    if (populate.length > 0) {
      populate.forEach(field => {
        query = query.populate(field);
      });
    }
    
    return query.exec();
  }

  async findAll(tenantId, filters = {}, options = {}) {
    const {
      page = 1,
      limit = 50,
      sort = '-createdAt',
      populate = [],
      search = '',
    } = options;

    const skip = (page - 1) * limit;
    const query = { tenantId, ...filters };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    let dbQuery = Lead.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Populate fields
    if (populate.length > 0) {
      populate.forEach(field => {
        dbQuery = dbQuery.populate(field);
      });
    }

    const leads = await dbQuery.exec();
    const total = await Lead.countDocuments(query);

    return {
      data: leads,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async update(tenantId, leadId, updateData) {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, tenantId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate(['assignedTo', 'createdBy', 'updatedBy']);

    return lead;
  } catch (error) {
    logger.error('Lead repository update error:', error);
    throw error;
  }
}


  async delete(tenantId, leadId) {
    return Lead.findOneAndDelete({ tenantId, _id: leadId });
  }

  async count(tenantId, filters = {}) {
    return Lead.countDocuments({ tenantId, ...filters });
  }

  async getLeadsByStatus(tenantId) {
    return Lead.aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);
  }

  async getLeadsBySource(tenantId) {
    return Lead.aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $project: { source: '$_id', count: 1, _id: 0 } },
    ]);
  }

  async getAssignedLeads(tenantId, userId) {
    return Lead.find({ tenantId, assignedTo: userId }).sort('-createdAt');
  }

  async addNote(tenantId, leadId, note) {
    return Lead.findOneAndUpdate(
      { tenantId, _id: leadId },
      { $push: { notes: note } },
      { new: true }
    );
  }

  async bulkAssign(tenantId, leadIds, assignedTo) {
    return Lead.updateMany(
      { tenantId, _id: { $in: leadIds } },
      { $set: { assignedTo } }
    );
  }

  async convertToContact(tenantId, leadId, contactId, dealId = null) {
    const updateData = {
      status: 'converted',
      convertedToContact: contactId,
      convertedAt: new Date(),
    };

    if (dealId) {
      updateData.convertedToDeal = dealId;
    }

    return Lead.findOneAndUpdate(
      { tenantId, _id: leadId },
      { $set: updateData },
      { new: true }
    );
  }
}

module.exports = new LeadRepository();
