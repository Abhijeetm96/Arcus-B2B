import { Request, Response } from 'express';
import { QuotationService } from '../services/quotation.service';
import { DocumentService } from '../services/document.service';
import { pgPool } from '../database/db';

export class DocumentController {
  private quoteService: QuotationService;

  constructor() {
    if (!pgPool) {
      throw new Error('[DocumentController] PostgreSQL pool is not initialized.');
    }
    this.quoteService = new QuotationService(pgPool);
  }

  public async renderDocument(req: Request, res: Response) {
    const { id } = req.params;
    const format = req.query.format || 'pdf';
    const download = req.query.download === 'true';

    console.log(`[DocumentController] Processing render request: id=${id}, format=${format}, download=${download}`);

    // Verify UUID boundary (Phase 1)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      console.error(`[DocumentController] Fail: Invalid UUID format "${id}"`);
      return res.status(400).json({ error: 'Invalid document ID format. UUID is required.' });
    }

    try {
      // 1. Fetch Quotation data
      const quote = await this.quoteService.getQuotation(id);
      if (!quote) {
        return res.status(404).json({ error: 'Quotation not found' });
      }

      // 2. Render HTML first (Phase 4)
      const htmlContent = await DocumentService.renderQuotationHtml(quote, quote, quote.items);

      // Phase 6 & 7: Preview / Delivery modes
      if (format === 'html') {
        res.setHeader('Content-Type', 'text/html');
        return res.send(htmlContent);
      }

      if (format === 'pdf') {
        // Compile to PDF (Phase 4)
        const pdfBuffer = await DocumentService.generatePdfFromHtml(htmlContent);
        
        const filename = `${quote.quotation_number}_v${quote.version}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        if (download) {
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        } else {
          res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        }
        return res.send(pdfBuffer);
      }

      return res.status(400).json({ error: `Unsupported format: ${format}` });
    } catch (err: any) {
      console.error('[DocumentController] Error rendering document:', err);
      return res.status(500).json({ error: 'Internal server error rendering document', message: err.message });
    }
  }
}
