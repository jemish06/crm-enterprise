const dealRepository = require('../repositories/dealRepository');
const logger = require('../utils/logger');

class DealService {
  async createDeal(tenantId, userId, dealData) {
    try {
      dealData.createdBy = userId;
      if (!dealData.assignedTo) {
        dealData.assignedTo = userId;
      }
      const deal = await dealRepository.create(tenantId, dealData);
      logger.info(`Deal created: ${deal.dealNumber}`);
      return deal;
    } catch (error) {
      logger.error('Create deal error:', error);
      throw error;
    }
  }

  async getDealById(tenantId, dealId) {
    const deal = await dealRepository.findById(tenantId, dealId, [
      'assignedTo',
      'account',
      'contact',
      'createdBy',
    ]);
    if (!deal) throw new Error('Deal not found');
    return deal;
  }

  async getAllDeals(tenantId, filters, options) {
    return dealRepository.findAll(tenantId, filters, options);
  }

  async getDealsByStage(tenantId, stage) {
    return dealRepository.findByStage(tenantId, stage);
  }

  async updateDeal(tenantId, userId, dealId, updateData) {
    const deal = await dealRepository.findById(tenantId, dealId);
    if (!deal) throw new Error('Deal not found');

    updateData.updatedBy = userId;

    // Track stage changes
    if (updateData.stage && updateData.stage !== deal.stage) {
      logger.info(`Deal ${dealId} stage changed: ${deal.stage} -> ${updateData.stage}`);
      // TODO: Create activity log
    }

    return dealRepository.update(tenantId, dealId, updateData);
  }

  async updateDealStage(tenantId, userId, dealId, newStage) {
    const deal = await dealRepository.findById(tenantId, dealId);
    if (!deal) throw new Error('Deal not found');

    const oldStage = deal.stage;
    const updatedDeal = await dealRepository.updateStage(tenantId, dealId, newStage);

    logger.info(`Deal ${dealId} moved from ${oldStage} to ${newStage}`);
    // TODO: Trigger workflows

    return updatedDeal;
  }

  async deleteDeal(tenantId, dealId) {
    const deal = await dealRepository.delete(tenantId, dealId);
    if (!deal) throw new Error('Deal not found');
    logger.info(`Deal deleted: ${dealId}`);
    return deal;
  }

  async addNote(tenantId, userId, dealId, noteContent) {
    const note = {
      content: noteContent,
      createdBy: userId,
      createdAt: new Date(),
    };
    const deal = await dealRepository.addNote(tenantId, dealId, note);
    if (!deal) throw new Error('Deal not found');
    return deal;
  }

  async addProduct(tenantId, dealId, productData) {
    // Calculate product total
    const total = productData.price * productData.quantity * (1 - productData.discount / 100);
    productData.total = total;

    const deal = await dealRepository.addProduct(tenantId, dealId, productData);
    if (!deal) throw new Error('Deal not found');

    // Update deal value based on products
    const totalValue = deal.products.reduce((sum, product) => sum + product.total, 0);
    await dealRepository.update(tenantId, dealId, { value: totalValue });

    return deal;
  }

  async getPipelineStats(tenantId, pipeline) {
    return dealRepository.getPipelineStats(tenantId, pipeline);
  }

  async getRevenueForecast(tenantId, startDate, endDate) {
    const forecast = await dealRepository.getRevenueForecast(tenantId, startDate, endDate);
    return forecast.length > 0 ? forecast[0] : { totalPotential: 0, totalWeighted: 0, dealCount: 0 };
  }

  async createFromLead(tenantId, userId, lead, contact) {
    const dealData = {
      name: `${lead.fullName} - ${lead.company || 'Deal'}`,
      value: lead.value || 0,
      probability: lead.probability || 10,
      expectedCloseDate: lead.expectedCloseDate,
      contact: contact._id,
      assignedTo: lead.assignedTo,
      stage: 'prospecting',
      description: `Converted from lead ${lead.leadNumber}`,
    };
    return this.createDeal(tenantId, userId, dealData);
  }
}

module.exports = new DealService();
