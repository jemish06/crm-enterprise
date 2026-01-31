const Deal = require('../models/Deal');
const mongoose = require('mongoose');

class DealRepository {
  async create(tenantId, dealData) {
    return Deal.create({ tenantId, ...dealData });
  }

  async findById(tenantId, dealId, populate = []) {
    let query = Deal.findOne({ tenantId, _id: dealId });
    populate.forEach(field => query = query.populate(field));
    return query.exec();
  }

  async findAll(tenantId, filters = {}, options = {}) {
    const { page = 1, limit = 50, sort = '-createdAt', search = '' } = options;
    const skip = (page - 1) * limit;
    const query = { tenantId, ...filters };

    if (search) {
      query.$text = { $search: search };
    }

    const deals = await Deal.find(query)
      .populate('assignedTo account contact createdBy')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Deal.countDocuments(query);

    return {
      data: deals,
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

  async findByStage(tenantId, stage) {
    return Deal.find({ tenantId, stage })
      .populate('assignedTo account contact')
      .sort('createdAt');
  }

  async update(tenantId, dealId, updateData) {
    return Deal.findOneAndUpdate(
      { tenantId, _id: dealId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('assignedTo account contact');
  }

  async updateStage(tenantId, dealId, newStage) {
    return Deal.findOneAndUpdate(
      { tenantId, _id: dealId },
      { $set: { stage: newStage } },
      { new: true }
    ).populate('assignedTo account contact');
  }

  async delete(tenantId, dealId) {
    return Deal.findOneAndDelete({ tenantId, _id: dealId });
  }

  async addNote(tenantId, dealId, note) {
    return Deal.findOneAndUpdate(
      { tenantId, _id: dealId },
      { $push: { notes: note } },
      { new: true }
    );
  }

  async addProduct(tenantId, dealId, product) {
    return Deal.findOneAndUpdate(
      { tenantId, _id: dealId },
      { $push: { products: product } },
      { new: true }
    );
  }

  async getPipelineStats(tenantId, pipeline = 'sales') {
    return Deal.aggregate([
      { $match: { tenantId: mongoose.Types.ObjectId(tenantId), pipeline } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
          avgValue: { $avg: '$value' },
          weightedValue: { $sum: { $multiply: ['$value', '$probability', 0.01] } },
        },
      },
      {
        $project: {
          stage: '$_id',
          count: 1,
          totalValue: 1,
          avgValue: 1,
          weightedValue: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getRevenueForecast(tenantId, startDate, endDate) {
    return Deal.aggregate([
      {
        $match: {
          tenantId: mongoose.Types.ObjectId(tenantId),
          expectedCloseDate: { $gte: startDate, $lte: endDate },
          stage: { $nin: ['closed-lost'] },
        },
      },
      {
        $group: {
          _id: null,
          totalPotential: { $sum: '$value' },
          totalWeighted: { $sum: { $multiply: ['$value', '$probability', 0.01] } },
          dealCount: { $sum: 1 },
        },
      },
    ]);
  }

  async getWonDeals(tenantId, startDate, endDate) {
    return Deal.aggregate([
      {
        $match: {
          tenantId: mongoose.Types.ObjectId(tenantId),
          stage: 'closed-won',
          actualCloseDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$value' },
          dealCount: { $sum: 1 },
          avgDealSize: { $avg: '$value' },
        },
      },
    ]);
  }

  async getDealsByUser(tenantId, startDate, endDate) {
    return Deal.aggregate([
      {
        $match: {
          tenantId: mongoose.Types.ObjectId(tenantId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          totalDeals: { $sum: 1 },
          totalValue: { $sum: '$value' },
          wonDeals: {
            $sum: { $cond: [{ $eq: ['$stage', 'closed-won'] }, 1, 0] },
          },
          wonValue: {
            $sum: { $cond: [{ $eq: ['$stage', 'closed-won'] }, '$value', 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          totalDeals: 1,
          totalValue: 1,
          wonDeals: 1,
          wonValue: 1,
          winRate: {
            $multiply: [{ $divide: ['$wonDeals', '$totalDeals'] }, 100],
          },
          _id: 0,
        },
      },
    ]);
  }
}

module.exports = new DealRepository();
