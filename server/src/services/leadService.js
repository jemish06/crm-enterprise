const leadRepository = require('../repositories/leadRepository');
const logger = require('../utils/logger');

class LeadService {
  async createLead(tenantId, userId, leadData) {
    try {
      leadData.createdBy = userId;
      
      // Set default assignment if not provided
      if (!leadData.assignedTo) {
        leadData.assignedTo = userId;
      }

      const lead = await leadRepository.create(tenantId, leadData);

      logger.info(`Lead created: ${lead.leadNumber} by user ${userId}`);

      // TODO: Trigger workflows
      // await workflowService.trigger(tenantId, 'lead_created', lead);

      return lead;
    } catch (error) {
      logger.error('Create lead error:', error);
      throw error;
    }
  }

  async getLeadById(tenantId, leadId, populate = []) {
    try {
      const lead = await leadRepository.findById(tenantId, leadId, populate);

      if (!lead) {
        throw new Error('Lead not found');
      }

      return lead;
    } catch (error) {
      logger.error('Get lead error:', error);
      throw error;
    }
  }

  async getAllLeads(tenantId, filters, options) {
    try {
      return await leadRepository.findAll(tenantId, filters, options);
    } catch (error) {
      logger.error('Get all leads error:', error);
      throw error;
    }
  }

  async updateLead(tenantId, userId, leadId, updateData) {
    try {
      // Check if lead exists
      const existingLead = await leadRepository.findById(tenantId, leadId);
      if (!existingLead) {
        throw new Error('Lead not found');
      }

      updateData.updatedBy = userId;

      // Track status/stage changes for activities
      const statusChanged = updateData.status && updateData.status !== existingLead.status;
      const stageChanged = updateData.stage && updateData.stage !== existingLead.stage;

      const lead = await leadRepository.update(tenantId, leadId, updateData);

      // Log activities for important changes
      if (statusChanged) {
        // TODO: Create activity log
        logger.info(`Lead ${leadId} status changed: ${existingLead.status} -> ${updateData.status}`);
      }

      if (stageChanged) {
        logger.info(`Lead ${leadId} stage changed: ${existingLead.stage} -> ${updateData.stage}`);
      }

      return lead;
    } catch (error) {
      logger.error('Update lead error:', error);
      throw error;
    }
  }

  async deleteLead(tenantId, leadId) {
    try {
      const lead = await leadRepository.delete(tenantId, leadId);

      if (!lead) {
        throw new Error('Lead not found');
      }

      logger.info(`Lead deleted: ${leadId}`);

      return lead;
    } catch (error) {
      logger.error('Delete lead error:', error);
      throw error;
    }
  }

  async addNote(tenantId, userId, leadId, noteContent) {
    try {
      const note = {
        content: noteContent,
        createdBy: userId,
        createdAt: new Date(),
      };

      const lead = await leadRepository.addNote(tenantId, leadId, note);

      if (!lead) {
        throw new Error('Lead not found');
      }

      logger.info(`Note added to lead ${leadId} by user ${userId}`);

      return lead;
    } catch (error) {
      logger.error('Add note error:', error);
      throw error;
    }
  }

  async assignLeads(tenantId, leadIds, assignedTo) {
    try {
      await leadRepository.bulkAssign(tenantId, leadIds, assignedTo);

      logger.info(`${leadIds.length} leads assigned to user ${assignedTo}`);

      return { message: `${leadIds.length} leads assigned successfully` };
    } catch (error) {
      logger.error('Assign leads error:', error);
      throw error;
    }
  }

  async getLeadStatistics(tenantId) {
    try {
      const [totalLeads, byStatus, bySource] = await Promise.all([
        leadRepository.count(tenantId),
        leadRepository.getLeadsByStatus(tenantId),
        leadRepository.getLeadsBySource(tenantId),
      ]);

      return {
        totalLeads,
        byStatus,
        bySource,
      };
    } catch (error) {
      logger.error('Get lead statistics error:', error);
      throw error;
    }
  }

 async convertLead(tenantId, userId, leadId, conversionData = {}) {
  try {
    const lead = await leadRepository.findById(tenantId, leadId);

    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.status === 'converted') {
      throw new Error('Lead already converted');
    }

    // Import models
    const Contact = require('../models/Contact');
    const Deal = require('../models/Deal');
    const Activity = require('../models/Activity');

    logger.info('Converting lead with data:', conversionData);

    // Create contact from lead data
    const contactData = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      title: lead.title,
      tenantId: tenantId,
      assignedTo: lead.assignedTo || userId,
      createdBy: userId,
    };

    const contact = await Contact.create(contactData);
    logger.info(`Contact created from lead: ${contact.contactNumber}`);

    let deal = null;

    // Create deal if requested
    if (conversionData && conversionData.createDeal && conversionData.dealName) {
      const dealData = {
        name: conversionData.dealName,
        value: conversionData.dealValue || 0,
        stage: conversionData.dealStage || 'prospecting',
        probability: conversionData.probability || 10,
        expectedCloseDate: conversionData.expectedCloseDate || undefined,
        pipeline: conversionData.pipeline || 'sales',
        contact: contact._id,
        tenantId: tenantId,
        assignedTo: conversionData.assignedTo || lead.assignedTo || userId,
        createdBy: userId,
      };

      deal = await Deal.create(dealData);
      logger.info(`Deal created from lead: ${deal.dealNumber}`);
    }

    // Update lead as converted
    const updateData = {
      status: 'converted',
      convertedToContact: contact._id,
      convertedAt: new Date(),
      updatedBy: userId,
    };

    if (deal) {
      updateData.convertedToDeal = deal._id;
    }

    const updatedLead = await leadRepository.update(tenantId, leadId, updateData);

    // Create activity
    try {
      await Activity.create({
        type: 'lead_converted',
        subject: `Lead converted: ${lead.fullName}`,
        description: `Lead was converted to contact${deal ? ' and deal' : ''}`,
        tenantId: tenantId,
        relatedTo: {
          type: 'Lead',
          id: lead._id,
        },
        createdBy: userId,
      });
      logger.info(`Activity created for lead conversion: ${leadId}`);
    } catch (activityError) {
      logger.error('Failed to create activity for lead conversion:', activityError);
    }

    logger.info(`Lead ${leadId} converted successfully by user ${userId}`);

    // Populate the related fields before returning
    await contact.populate('assignedTo', 'firstName lastName email');
    if (deal) {
      await deal.populate([
        { path: 'assignedTo', select: 'firstName lastName email' },
        { path: 'contact', select: 'firstName lastName email' },
      ]);
    }

    return { 
      lead: updatedLead, 
      contact, 
      deal,
      message: 'Lead converted successfully'
    };
  } catch (error) {
    logger.error('Convert lead error:', error);
    throw error;
  }
}

}

module.exports = new LeadService();
