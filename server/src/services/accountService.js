const accountRepository = require('../repositories/accountRepository');
const logger = require('../utils/logger');

class AccountService {
  async createAccount(tenantId, userId, accountData) {
    try {
      accountData.createdBy = userId;
      const account = await accountRepository.create(tenantId, accountData);
      logger.info(`Account created: ${account.accountNumber}`);
      return account;
    } catch (error) {
      logger.error('Create account error:', error);
      throw error;
    }
  }

  async getAccountById(tenantId, accountId) {
    const account = await accountRepository.findById(tenantId, accountId, [
      'assignedTo',
      'createdBy',
    ]);
    if (!account) throw new Error('Account not found');
    return account;
  }

  async getAccountWithRelations(tenantId, accountId) {
    const account = await accountRepository.findById(tenantId, accountId, [
      'assignedTo',
      'createdBy',
      'contacts',
      'deals',
    ]);
    if (!account) throw new Error('Account not found');
    return account;
  }

  async getAllAccounts(tenantId, filters, options) {
    return accountRepository.findAll(tenantId, filters, options);
  }

  async updateAccount(tenantId, userId, accountId, updateData) {
    const account = await accountRepository.findById(tenantId, accountId);
    if (!account) throw new Error('Account not found');

    updateData.updatedBy = userId;
    return accountRepository.update(tenantId, accountId, updateData);
  }

  async deleteAccount(tenantId, accountId) {
    const account = await accountRepository.delete(tenantId, accountId);
    if (!account) throw new Error('Account not found');
    logger.info(`Account deleted: ${accountId}`);
    return account;
  }

  async addNote(tenantId, userId, accountId, noteContent) {
    const note = {
      content: noteContent,
      createdBy: userId,
      createdAt: new Date(),
    };
    const account = await accountRepository.addNote(tenantId, accountId, note);
    if (!account) throw new Error('Account not found');
    return account;
  }

  async getAccountStatistics(tenantId) {
    const [total, byType] = await Promise.all([
      accountRepository.findAll(tenantId, {}, { page: 1, limit: 1 }).then(r => r.pagination.totalItems),
      accountRepository.getAccountsByType(tenantId),
    ]);

    return { total, byType };
  }
}

module.exports = new AccountService();
