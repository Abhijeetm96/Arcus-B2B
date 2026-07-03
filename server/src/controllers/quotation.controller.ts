import { Request, Response } from 'express';
import { pgPool } from '../database/db';
import { QuotationService } from '../services/quotation.service';
import { PermissionEngine } from '../domain/shared/PermissionEngine';

const pool = pgPool!;
const quoteService = new QuotationService(pool);

export class QuotationController {

  public async getQuotation(req: any, res: Response) {
    try {
      const { id } = req.params;
      const quote = await quoteService.getQuotation(id);
      if (!quote) {
        return res.status(404).json({ error: 'Quotation proposal not found' });
      }
      res.json({ success: true, data: quote });
    } catch (err: any) {
      console.error('[QuotationController] getQuotation error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async getQuotationsByRfq(req: any, res: Response) {
    try {
      const { rfqId } = req.params;
      const list = await quoteService.getQuotationsByRfq(rfqId);
      res.json({ success: true, data: list });
    } catch (err: any) {
      console.error('[QuotationController] getQuotationsByRfq error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async createQuotation(req: any, res: Response) {
    try {
      const { rfqId, quoteData, totalsData, items } = req.body;
      const performer = req.user;

      if (!rfqId || !quoteData || !totalsData || !items) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const saved = await quoteService.createQuotation(rfqId, quoteData, totalsData, items, performer.id);
      res.status(201).json({ success: true, message: 'Quotation drafted successfully', data: saved });
    } catch (err: any) {
      console.error('[QuotationController] createQuotation error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public async updateQuotation(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { quoteData, totalsData, items } = req.body;
      const performer = req.user;

      if (!quoteData || !totalsData || !items) {
        return res.status(400).json({ error: 'Missing update payload parameters' });
      }

      const saved = await quoteService.updateQuotation(id, quoteData, totalsData, items, performer.id);
      res.json({ success: true, message: 'Quotation updated successfully', data: saved });
    } catch (err: any) {
      console.error('[QuotationController] updateQuotation error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public async createRevision(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { quoteData, totalsData, items, reason } = req.body;
      const performer = req.user;

      if (!quoteData || !totalsData || !items) {
        return res.status(400).json({ error: 'Missing revision payload parameters' });
      }

      const saved = await quoteService.createRevision(id, quoteData, totalsData, items, performer.id, reason);
      res.status(201).json({ success: true, message: 'New quotation version revision created', data: saved });
    } catch (err: any) {
      console.error('[QuotationController] createRevision error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public async sendQuotation(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { channel, recipient } = req.body;
      const performer = req.user;

      if (!channel || !recipient) {
        return res.status(400).json({ error: 'Share channel and recipient details are required' });
      }

      const updated = await quoteService.sendQuotation(id, performer.id, channel, recipient);
      res.json({ success: true, message: 'Quotation proposal sent successfully', data: updated });
    } catch (err: any) {
      console.error('[QuotationController] sendQuotation error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public async approveQuotation(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { notes, signature } = req.body;
      const performer = req.user;

      // Restrict to admins and managers
      if (!PermissionEngine.canApprove(performer.role, performer.adminRole)) {
        return res.status(403).json({ error: 'Access denied: Only managers or system admins can sign off proposals' });
      }

      const updated = await quoteService.approveQuotation(id, performer.id, notes || 'Approved', signature);
      res.json({ success: true, message: 'Quotation approved and signed successfully', data: updated });
    } catch (err: any) {
      console.error('[QuotationController] approveQuotation error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public async rejectQuotation(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const performer = req.user;

      if (!PermissionEngine.canApprove(performer.role, performer.adminRole)) {
        return res.status(403).json({ error: 'Access denied: Insufficient permissions to decline proposals' });
      }

      const updated = await quoteService.rejectQuotation(id, performer.id, notes || 'Rejected');
      res.json({ success: true, message: 'Quotation declined and marked as rejected', data: updated });
    } catch (err: any) {
      console.error('[QuotationController] rejectQuotation error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public async convertToOrder(req: any, res: Response) {
    try {
      const { id } = req.params;
      const performer = req.user;

      const updated = await quoteService.convertToOrder(id, performer.id);
      res.json({ success: true, message: 'Quotation successfully converted to purchase contract order', data: updated });
    } catch (err: any) {
      console.error('[QuotationController] convertToOrder error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public async getPdf(req: any, res: Response) {
    const { id } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      console.error(`[QuotationController] getPdf Fail: Invalid UUID format "${id}"`);
      return res.status(400).json({ error: 'Invalid quotation ID format. UUID is required.' });
    }
    const token = req.query.token ? `&token=${encodeURIComponent(req.query.token as string)}` : '';
    res.redirect(`/api/documents/${id}?format=pdf${token}`);
  }
}
