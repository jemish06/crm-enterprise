const Contact = require('../models/Contact');

class ContactRepository {
  async create(tenantId, contactData) {
    return Contact.create({ tenantId, ...contactData });
  }

  async findById(tenantId, contactId, populate = []) {
    let query = Contact.findOne({ tenantId, _id: contactId });
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

    const contacts = await Contact.find(query)
      .populate('assignedTo account createdBy')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(query);

    return {
      data: contacts,
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

  async update(tenantId, contactId, updateData) {
    return Contact.findOneAndUpdate(
      { tenantId, _id: contactId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('assignedTo account');
  }

  async delete(tenantId, contactId) {
    return Contact.findOneAndDelete({ tenantId, _id: contactId });
  }

  async addNote(tenantId, contactId, note) {
    return Contact.findOneAndUpdate(
      { tenantId, _id: contactId },
      { $push: { notes: note } },
      { new: true }
    );
  }

  async findByAccount(tenantId, accountId) {
    return Contact.find({ tenantId, account: accountId })
      .populate('assignedTo')
      .sort('-createdAt');
  }
}

module.exports = new ContactRepository();
