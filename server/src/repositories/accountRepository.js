const Account = require('../models/Account');

class AccountRepository {
  async create(tenantId, accountData) {
    return Account.create({ tenantId, ...accountData });
  }

  async findById(tenantId, accountId, populate = []) {
    let query = Account.findOne({ tenantId, _id: accountId });
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

    const accounts = await Account.find(query)
      .populate('assignedTo createdBy')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Account.countDocuments(query);

    return {
      data: accounts,
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

  async update(tenantId, accountId, updateData) {
    return Account.findOneAndUpdate(
      { tenantId, _id: accountId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('assignedTo');
  }

  async delete(tenantId, accountId) {
    return Account.findOneAndDelete({ tenantId, _id: accountId });
  }

  async addNote(tenantId, accountId, note) {
    return Account.findOneAndUpdate(
      { tenantId, _id: accountId },
      { $push: { notes: note } },
      { new: true }
    );
  }

  async getAccountsByType(tenantId) {
    return Account.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);
  }
}

module.exports = new AccountRepository();
