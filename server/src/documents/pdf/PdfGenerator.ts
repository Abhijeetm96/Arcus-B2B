import { BrowserManager } from './BrowserManager';

export class PdfGenerator {
  /**
   * Compiles HTML string to PDF binary buffer.
   * Leverages singleton headless Chromium and closes pages instantly.
   */
  public static async generate(htmlContent: string): Promise<Buffer> {
    console.log('[PdfGenerator] Spawning new page tab...');
    const browser = await BrowserManager.getBrowser();
    const page = await browser.newPage();

    try {
      // Set A4 viewport to prevent scaling artifacts
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      console.log('[PdfGenerator] Converting page DOM to PDF stream...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm'
        }
      });

      return pdfBuffer;
    } finally {
      console.log('[PdfGenerator] Closing tab page...');
      await page.close();
    }
  }
}
export default PdfGenerator;
