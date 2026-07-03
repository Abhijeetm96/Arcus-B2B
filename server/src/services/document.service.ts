import { BrowserManager } from '../domain/shared/pdf/BrowserManager';
import { QuotationRenderer } from '../documents/renderers/quotation/QuotationRenderer';
import { InvoiceRenderer } from '../documents/renderers/invoice/InvoiceRenderer';

export class DocumentService {
  /**
   * Renders the quotation model into styled corporate HTML.
   */
  public static async renderQuotationHtml(quote: any, totals: any, items: any[]): Promise<string> {
    const renderer = new QuotationRenderer();
    return renderer.render({
      quotation: quote,
      totals,
      items
    });
  }

  /**
   * Renders the order model into styled corporate HTML.
   */
  public static async renderInvoiceHtml(order: any): Promise<string> {
    const renderer = new InvoiceRenderer();
    return renderer.render(order);
  }

  /**
   * Compiles raw HTML into PDF binary using a Puppeteer singleton session page.
   */
  public static async generatePdfFromHtml(htmlContent: string): Promise<Buffer> {
    console.log('[DocumentService] Opening new tab in Chromium singleton...');
    const browser = await BrowserManager.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      console.log('[DocumentService] Rendering page to PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          bottom: '15mm',
          left: '15mm',
          right: '15mm'
        }
      });
      return pdfBuffer;
    } finally {
      console.log('[DocumentService] Closing Chromium tab...');
      await page.close();
    }
  }
}
