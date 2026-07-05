import { Request, Response } from 'express';
import { QuotationService } from '../../services/quotation.service';
import { getOrderById } from '../../modules/orders/OrderService';
import { DocumentService } from '../document.service';
import { pgPool } from '../../database/db';

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

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    try {
      let htmlContent = '';
      let filename = `document_${id}.pdf`;
      let docType: 'quotation' | 'invoice' | 'rfq' | 'purchase-order' = 'quotation';
      let documentData: any = null;

      // 1. Resolve Quotation (by UUID)
      if (isUuid) {
        documentData = await this.quoteService.getQuotation(id);
        if (documentData) {
          docType = 'quotation';
          filename = `${documentData.quotation_number}_v${documentData.version}.pdf`;
        }
      }

      // 2. Resolve Tax Invoice Order / Invoice
      if (!documentData) {
        try {
          const order = await getOrderById(id);
          if (order) {
            documentData = order;
            docType = 'invoice';
            filename = `INV-${documentData.id.split('-').pop()?.toUpperCase() || 'INVOICE'}.pdf`;
          }
        } catch (e) {
          console.warn(`[DocumentController] Order resolution failed for ID ${id}:`, e);
        }
      }



      if (!documentData) {
        return res.status(404).json({ error: `Document not found with ID: ${id}` });
      }

      // Render document HTML
      htmlContent = await DocumentService.renderDocumentHtml(docType, documentData);

      // Respond based on format
      if (format === 'html') {
        res.setHeader('Content-Type', 'text/html');
        return res.send(htmlContent);
      }

      if (format === 'pdf') {
        const lastUpdated = documentData && (documentData.updated_at || documentData.lastUpdated)
          ? new Date(documentData.updated_at || documentData.lastUpdated).getTime()
          : (documentData?.version || '1');
        const cacheKey = `${docType}_pdf_${id}_v${lastUpdated}`;
        const pdfBuffer = await DocumentService.generatePdf(htmlContent, cacheKey);
        
        res.setHeader('Content-Type', 'application/pdf');
        if (download) {
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        } else {
          res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        }
        return res.send(pdfBuffer);
      }

      return res.status(400).json({ error: `Unsupported document format: ${format}` });
    } catch (err: any) {
      console.error('[DocumentController] Error rendering document:', err);
      return res.status(500).json({ error: 'Internal server error rendering document', message: err.message });
    }
  }
}
export default DocumentController;
