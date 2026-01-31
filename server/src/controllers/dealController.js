const dealService = require('../services/dealService');
const ApiResponse = require('../utils/response');

class DealController {
  async createDeal(req, res, next) {
    try {
      const deal = await dealService.createDeal(req.tenantId, req.user.userId, req.body);
      return ApiResponse.success(res, deal, 'Deal created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getDealById(req, res, next) {
    try {
      const deal = await dealService.getDealById(req.tenantId, req.params.id);
      return ApiResponse.success(res, deal, 'Deal retrieved successfully');
    } catch (error) {
      if (error.message === 'Deal not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async getAllDeals(req, res, next) {
    try {
      const { page, limit, sort, search, stage, assignedTo, pipeline } = req.query;
      const filters = {};
      if (stage) filters.stage = stage;
      if (assignedTo) filters.assignedTo = assignedTo;
      if (pipeline) filters.pipeline = pipeline;

      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 50, sort, search };
      const result = await dealService.getAllDeals(req.tenantId, filters, options);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Deals retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getDealsByStage(req, res, next) {
    try {
      const deals = await dealService.getDealsByStage(req.tenantId, req.params.stage);
      return ApiResponse.success(res, deals, 'Deals by stage retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateDeal(req, res, next) {
    try {
      const deal = await dealService.updateDeal(req.tenantId, req.user.userId, req.params.id, req.body);
      return ApiResponse.success(res, deal, 'Deal updated successfully');
    } catch (error) {
      if (error.message === 'Deal not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async updateDealStage(req, res, next) {
    try {
      const { stage } = req.body;
      const deal = await dealService.updateDealStage(req.tenantId, req.user.userId, req.params.id, stage);
      return ApiResponse.success(res, deal, 'Deal stage updated successfully');
    } catch (error) {
      if (error.message === 'Deal not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async deleteDeal(req, res, next) {
    try {
      await dealService.deleteDeal(req.tenantId, req.params.id);
      return ApiResponse.success(res, null, 'Deal deleted successfully');
    } catch (error) {
      if (error.message === 'Deal not found') {
        return ApiResponse.error(res, error.message, 404);
      }
      next(error);
    }
  }

  async addNote(req, res, next) {
    try {
      const deal = await dealService.addNote(req.tenantId, req.user.userId, req.params.id, req.body.content);
      return ApiResponse.success(res, deal, 'Note added successfully');
    } catch (error) {
      next(error);
    }
  }

  async addProduct(req, res, next) {
    try {
      const deal = await dealService.addProduct(req.tenantId, req.params.id, req.body);
      return ApiResponse.success(res, deal, 'Product added successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPipelineStats(req, res, next) {
    try {
      const { pipeline = 'sales' } = req.query;
      const stats = await dealService.getPipelineStats(req.tenantId, pipeline);
      return ApiResponse.success(res, stats, 'Pipeline stats retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DealController();
