import { QuotationRenderer } from './renderers/quotation/QuotationRenderer';
import { InvoiceRenderer } from './renderers/invoice/InvoiceRenderer';
import { PurchaseOrderRenderer } from './renderers/purchase-order/PurchaseOrderRenderer';
import { PdfGenerator } from './pdf/PdfGenerator';
import { DocumentCache } from './pdf/DocumentCache';

export class DocumentService {
  /**
   * Compiles HTML based on dynamic document type.
   * Utilizes cache layer.
   */
  public static async renderDocumentHtml(
    type: 'quotation' | 'invoice' | 'purchase-order',
    data: any
  ): Promise<string> {
    const cacheKey = `${type}_html_${data.id || data.rfqNumber || 'doc'}`;
    const cached = DocumentCache.get(cacheKey);
    if (cached && cached.html) {
      console.log(`[DocumentService] Cache HIT for HTML key: ${cacheKey}`);
      return cached.html;
    }

    let html = '';
    if (type === 'quotation') {
      const renderer = new QuotationRenderer();
      html = await renderer.render({
        quotation: data,
        totals: data,
        items: data.items || []
      });
    } else if (type === 'invoice') {
      const renderer = new InvoiceRenderer();
      html = await renderer.render(data);
    } else if (type === 'purchase-order') {
      const renderer = new PurchaseOrderRenderer();
      html = await renderer.render(data);
    }

    DocumentCache.setHtml(cacheKey, html);
    return html;
  }

  /**
   * Compiles HTML into PDF buffer using Puppeteer singleton.
   */
  public static async generatePdf(htmlContent: string, cacheKey?: string): Promise<Buffer> {
    if (cacheKey) {
      const cached = DocumentCache.get(cacheKey);
      if (cached && cached.pdf) {
        console.log(`[DocumentService] Cache HIT for PDF key: ${cacheKey}`);
        return cached.pdf;
      }
    }

    const pdfBuffer = await PdfGenerator.generate(htmlContent);

    if (cacheKey) {
      DocumentCache.setPdf(cacheKey, pdfBuffer);
    }

    return pdfBuffer;
  }
}
export default DocumentService;
