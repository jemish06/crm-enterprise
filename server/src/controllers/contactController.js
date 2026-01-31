const contactService = require('../services/contactService');
const ApiResponse = require('../utils/response');

class ContactController {
  async createContact(req, res, next) {
    try {
      const contact = await contactService.createContact(req.tenantId, req.user.userId, req.body);
      return ApiResponse.success(res, contact, 'Contact created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getContactById(req, res, next) {
    try {
      const contact = await contactService.getContactById(req.tenantId, req.params.id);
      return ApiResponse.success(res, contact, 'Contact retrieved successfully');
    } catch (error) {
      if (error.message === 'Contact not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async getAllContacts(req, res, next) {
    try {
      const { page, limit, sort, search, assignedTo, account } = req.query;
      const filters = {};
      if (assignedTo) filters.assignedTo = assignedTo;
      if (account) filters.account = account;

      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 50, sort, search };
      const result = await contactService.getAllContacts(req.tenantId, filters, options);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Contacts retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateContact(req, res, next) {
    try {
      const contact = await contactService.updateContact(req.tenantId, req.user.userId, req.params.id, req.body);
      return ApiResponse.success(res, contact, 'Contact updated successfully');
    } catch (error) {
      if (error.message === 'Contact not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async deleteContact(req, res, next) {
    try {
      await contactService.deleteContact(req.tenantId, req.params.id);
      return ApiResponse.success(res, null, 'Contact deleted successfully');
    } catch (error) {
      if (error.message === 'Contact not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async addNote(req, res, next) {
    try {
      const contact = await contactService.addNote(req.tenantId, req.user.userId, req.params.id, req.body.content);
      return ApiResponse.success(res, contact, 'Note added successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContactController();
