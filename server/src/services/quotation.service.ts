import { Pool, PoolClient } from 'pg';
import { QuotationRepository } from '../database/repositories/quotation.repository';
import { ActivityRepository } from '../database/repositories/activity.repository';
import { ApprovalEngine } from '../domain/shared/approval/ApprovalEngine';
import { EventBus } from '../domain/shared/EventBus';

export class QuotationService {
  private rfqRepo: any; // We can use direct query or rfqRepo if needed
  private quoteRepo: QuotationRepository;
  private activityRepo: ActivityRepository;

  constructor(pool: Pool) {
    this.quoteRepo = new QuotationRepository(pool);
    this.activityRepo = new ActivityRepository(pool);
  }

  public async getQuotation(id: string): Promise<any> {
    const quote = await this.quoteRepo.findById(id);
    if (!quote) return null;
    const items = await this.quoteRepo.findItemsByQuotationId(id);
    const versions = await this.quoteRepo.findVersionsByQuotationId(id);
    const approvals = await this.quoteRepo.findApprovalsByQuotationId(id);
    const shareLogs = await this.quoteRepo.findShareLogsByQuotationId(id);

    return {
      ...quote,
      items,
      versions,
      approvals,
      shareLogs
    };
  }

  public async getQuotationsByRfq(rfqId: string): Promise<any[]> {
    return this.quoteRepo.findByRfqId(rfqId);
  }

  public async createQuotation(
    rfqId: string,
    quoteData: any,
    totalsData: any,
    items: any[],
    creatorId: string
  ): Promise<any> {
    return this.quoteRepo.executeTransaction(async (client) => {
      const qNumber = await this.quoteRepo.getNextSequence(client);
      
      const newQuote = {
        ...quoteData,
        rfq_id: rfqId,
        quotation_number: qNumber,
        version: 1,
        status: 'DRAFT',
        created_by_id: creatorId
      };

      const saved = await this.quoteRepo.save(client, newQuote, totalsData, items);

      // Save initial version entry
      await this.quoteRepo.saveVersion(client, saved.id, 1, creatorId, 'Initial creation of quotation draft');

      // Log activity
      await this.activityRepo.save(client, {
        entity_type: 'QUOTATION',
        entity_id: saved.id,
        action: 'QUOTATION_CREATED',
        title: 'Quotation Created',
        description: `Draft created: ${saved.quotation_number}`,
        performed_by_id: creatorId
      });

      // Emit event
      EventBus.getInstance().publish('QUOTATION_CREATED', { quotationId: saved.id, creatorId });

      return saved;
    });
  }

  public async updateQuotation(
    quoteId: string,
    quoteData: any,
    totalsData: any,
    items: any[],
    modifierId: string
  ): Promise<any> {
    const existing = await this.quoteRepo.findById(quoteId);
    if (!existing) {
      throw new Error(`Quotation not found: ${quoteId}`);
    }

    // Lock editing if already sent to customer
    if (existing.status !== 'DRAFT' && existing.status !== 'PENDING_APPROVAL') {
      throw new Error(`Cannot modify quotation: Status is ${existing.status}. Revisions must create a new version.`);
    }

    return this.quoteRepo.executeTransaction(async (client) => {
      const updatedQuote = {
        ...existing,
        ...quoteData,
        id: quoteId,
        version: existing.version // Passes version check for optimistic locking
      };

      const saved = await this.quoteRepo.save(client, updatedQuote, totalsData, items);

      await this.activityRepo.save(client, {
        entity_type: 'QUOTATION',
        entity_id: saved.id,
        action: 'QUOTATION_UPDATED',
        title: 'Quotation Updated',
        description: `Quotation details modified in ${saved.status} status`,
        performed_by_id: modifierId
      });

      EventBus.getInstance().publish('QUOTATION_UPDATED', { quotationId: saved.id, modifierId });

      return saved;
    });
  }

  public async createRevision(
    quoteId: string,
    quoteData: any,
    totalsData: any,
    items: any[],
    creatorId: string,
    reason: string
  ): Promise<any> {
    const existing = await this.quoteRepo.findById(quoteId);
    if (!existing) {
      throw new Error(`Quotation not found: ${quoteId}`);
    }

    return this.quoteRepo.executeTransaction(async (client) => {
      const nextVersion = existing.version + 1;
      
      const newQuote = {
        ...existing,
        ...quoteData,
        id: undefined, // Create new row
        quotation_number: existing.quotation_number, // Same number
        version: nextVersion,
        status: 'DRAFT', // Reset to draft
        created_by_id: creatorId
      };

      const saved = await this.quoteRepo.save(client, newQuote, totalsData, items);

      // Save revision version record
      await this.quoteRepo.saveVersion(client, saved.id, nextVersion, creatorId, reason || 'Revised negotiation version');

      // Log activity
      await this.activityRepo.save(client, {
        entity_type: 'QUOTATION',
        entity_id: saved.id,
        action: 'QUOTATION_REVISED',
        title: 'New Revision Created',
        description: `Quotation revised to V${nextVersion}: ${reason}`,
        performed_by_id: creatorId
      });

      EventBus.getInstance().publish('QUOTATION_REVISED', { quotationId: saved.id, version: nextVersion, creatorId });

      return saved;
    });
  }

  public async sendQuotation(
    quoteId: string,
    senderId: string,
    channel: string,
    recipient: string
  ): Promise<any> {
    return this.quoteRepo.executeTransaction(async (client) => {
      const quote = await this.quoteRepo.findById(quoteId);
      if (!quote) throw new Error('Quotation not found');

      // Check if approved
      if (quote.status === 'PENDING_APPROVAL') {
        throw new Error('Cannot send quotation: Approval is pending.');
      }

      await this.quoteRepo.updateStatus(client, quoteId, 'SENT', quote.version);

      await this.quoteRepo.saveShareLog(client, {
        quotation_id: quoteId,
        share_channel: channel,
        recipient,
        share_status: 'DELIVERED'
      });

      await this.activityRepo.save(client, {
        entity_type: 'QUOTATION',
        entity_id: quoteId,
        action: 'QUOTATION_SENT',
        title: 'Quotation Dispatched',
        description: `Proposal shared with client via ${channel} to ${recipient}`,
        performed_by_id: senderId
      });

      EventBus.getInstance().publish('QUOTATION_SENT', { quotationId: quoteId, senderId, channel });

      return this.quoteRepo.findById(quoteId);
    });
  }

  public async approveQuotation(
    quoteId: string,
    approverId: string,
    notes: string,
    sig?: any
  ): Promise<any> {
    return this.quoteRepo.executeTransaction(async (client) => {
      const quote = await this.quoteRepo.findById(quoteId);
      if (!quote) throw new Error('Quotation not found');

      const approvalPolicy = await ApprovalEngine.evaluateApprovalRequirements(
        client,
        'QUOTATION',
        Number(quote.grand_total)
      );

      // Record approval log
      await this.quoteRepo.saveApproval(client, {
        quotation_id: quoteId,
        approver_id: approverId,
        approval_level: approvalPolicy.requiredLevels,
        notes,
        signature_hash: sig?.signature_hash || null,
        signed_document_hash: sig?.signed_document_hash || null,
        certificate_id: sig?.certificate_id || null
      });

      // Update status to Approved
      await this.quoteRepo.updateStatus(client, quoteId, 'APPROVED', quote.version);

      await this.activityRepo.save(client, {
        entity_type: 'QUOTATION',
        entity_id: quoteId,
        action: 'QUOTATION_APPROVED',
        title: 'Quotation Signed-Off',
        description: `Approved by manager. Notes: ${notes}`,
        performed_by_id: approverId
      });

      EventBus.getInstance().publish('QUOTATION_APPROVED', { quotationId: quoteId, approverId });

      return this.quoteRepo.findById(quoteId);
    });
  }

  public async rejectQuotation(
    quoteId: string,
    rejecterId: string,
    notes: string
  ): Promise<any> {
    return this.quoteRepo.executeTransaction(async (client) => {
      const quote = await this.quoteRepo.findById(quoteId);
      if (!quote) throw new Error('Quotation not found');

      await this.quoteRepo.updateStatus(client, quoteId, 'REJECTED', quote.version);

      await this.activityRepo.save(client, {
        entity_type: 'QUOTATION',
        entity_id: quoteId,
        action: 'QUOTATION_REJECTED',
        title: 'Quotation Declined',
        description: `Declined by manager. Reason: ${notes}`,
        performed_by_id: rejecterId
      });

      EventBus.getInstance().publish('QUOTATION_REJECTED', { quotationId: quoteId, rejecterId });

      return this.quoteRepo.findById(quoteId);
    });
  }

  public async convertToOrder(quoteId: string, operatorId: string): Promise<any> {
    return this.quoteRepo.executeTransaction(async (client) => {
      const quote = await this.quoteRepo.findById(quoteId);
      if (!quote) throw new Error('Quotation not found');

      if (quote.status !== 'APPROVED' && quote.status !== 'SENT') {
        throw new Error('Cannot convert: Quotation must be APPROVED or SENT to convert to Order.');
      }

      await this.quoteRepo.updateStatus(client, quoteId, 'CONVERTED', quote.version);

      await this.activityRepo.save(client, {
        entity_type: 'QUOTATION',
        entity_id: quoteId,
        action: 'QUOTATION_CONVERTED',
        title: 'Quotation Converted to Order',
        description: `Proposal successfully converted to B2B purchase contract by operator.`,
        performed_by_id: operatorId
      });

      // Emits event so that OrderService can listen asynchronously and create the Order record
      EventBus.getInstance().publish('QUOTATION_CONVERTED', { quotationId: quoteId, operatorId, quote });

      return this.quoteRepo.findById(quoteId);
    });
  }
}
