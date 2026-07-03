import { Request, Response } from 'express';
import { QuotationService } from '../services/quotation.service';
import { DocumentService } from '../services/document.service';
import { pgPool } from '../database/db';
import { getOrderById } from '../modules/orders/OrderService';

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

    // Determine if the ID is a valid UUID (required for quotations lookup to prevent pg cast crashes)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    try {
      let quote: any = null;
      
      // Query quotation only if the format is a valid UUID
      if (isUuid) {
        quote = await this.quoteService.getQuotation(id);
      }
      
      let htmlContent = '';
      let filename = `document_${id}.pdf`;

      if (quote) {
        // Render Quotation HTML first
        htmlContent = await DocumentService.renderQuotationHtml(quote, quote, quote.items);
        filename = `${quote.quotation_number}_v${quote.version}.pdf`;
      } else {
        // Try to fetch order (IDs can be UUID or VARCHAR format like ARC-XXXXX)
        const order = await getOrderById(id);
        if (!order) {
          return res.status(404).json({ error: 'Document not found' });
        }
        // Render Order HTML first (Tax Invoice)
        htmlContent = await DocumentService.renderInvoiceHtml(order);
        filename = `INV-${order.id.split('-').pop()?.toUpperCase() || 'INVOICE'}.pdf`;
      }

      // Phase 6 & 7: Preview / Delivery modes
      if (format === 'html') {
        res.setHeader('Content-Type', 'text/html');
        return res.send(htmlContent);
      }

      if (format === 'pdf') {
        // Compile to PDF
        const pdfBuffer = await DocumentService.generatePdfFromHtml(htmlContent);
        
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
