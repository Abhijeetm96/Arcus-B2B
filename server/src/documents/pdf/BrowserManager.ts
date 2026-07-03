import puppeteer, { Browser } from 'puppeteer';

export class BrowserManager {
  private static instance: Browser | null = null;
  private static launchPromise: Promise<Browser> | null = null;

  /**
   * Returns the shared singleton Browser instance.
   * Launces/restarts it if needed.
   */
  public static async getBrowser(): Promise<Browser> {
    if (this.instance) {
      return this.instance;
    }

    if (this.launchPromise) {
      return this.launchPromise;
    }

    console.log('[BrowserManager] Spawning reusable headless Chromium instance...');
    this.launchPromise = puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none'
      ]
    }).then((browser) => {
      this.instance = browser;
      this.launchPromise = null;

      browser.on('disconnected', () => {
        console.warn('[BrowserManager] Reusable browser was disconnected. Purging reference...');
        this.instance = null;
      });

      console.log('[BrowserManager] Headless Chromium launched successfully.');
      return browser;
    }).catch((err) => {
      this.launchPromise = null;
      console.error('[BrowserManager] Failed to launch Chromium browser:', err);
      throw err;
    });

    return this.launchPromise;
  }

  /**
   * Graceful shutdown of active instance.
   */
  public static async close(): Promise<void> {
    if (this.instance) {
      console.log('[BrowserManager] Gracefully shutting down browser instance...');
      await this.instance.close();
      this.instance = null;
    }
  }
}
export default BrowserManager;
