const contactRepository = require('../repositories/contactRepository');
const logger = require('../utils/logger');

class ContactService {
  async createContact(tenantId, userId, contactData) {
    try {
      contactData.createdBy = userId;
      const contact = await contactRepository.create(tenantId, contactData);
      logger.info(`Contact created: ${contact.contactNumber}`);
      return contact;
    } catch (error) {
      logger.error('Create contact error:', error);
      throw error;
    }
  }

  async getContactById(tenantId, contactId) {
    const contact = await contactRepository.findById(tenantId, contactId, [
      'assignedTo',
      'account',
      'createdBy',
    ]);
    if (!contact) throw new Error('Contact not found');
    return contact;
  }

  async getAllContacts(tenantId, filters, options) {
    return contactRepository.findAll(tenantId, filters, options);
  }

  async updateContact(tenantId, userId, contactId, updateData) {
    const contact = await contactRepository.findById(tenantId, contactId);
    if (!contact) throw new Error('Contact not found');
    
    updateData.updatedBy = userId;
    return contactRepository.update(tenantId, contactId, updateData);
  }

  async deleteContact(tenantId, contactId) {
    const contact = await contactRepository.delete(tenantId, contactId);
    if (!contact) throw new Error('Contact not found');
    logger.info(`Contact deleted: ${contactId}`);
    return contact;
  }

  async addNote(tenantId, userId, contactId, noteContent) {
    const note = {
      content: noteContent,
      createdBy: userId,
      createdAt: new Date(),
    };
    const contact = await contactRepository.addNote(tenantId, contactId, note);
    if (!contact) throw new Error('Contact not found');
    return contact;
  }

  async createFromLead(tenantId, userId, lead, additionalData = {}) {
    const contactData = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      title: lead.title,
      address: lead.address,
      assignedTo: lead.assignedTo,
      ...additionalData,
    };
    return this.createContact(tenantId, userId, contactData);
  }
}

module.exports = new ContactService();
