import puppeteer, { Browser } from 'puppeteer';

export class BrowserManager {
  private static instance: Browser | null = null;
  private static launchPromise: Promise<Browser> | null = null;

  /**
   * Returns the shared singleton Browser instance.
   * Launches it if it does not yet exist.
   */
  public static async getBrowser(): Promise<Browser> {
    if (this.instance) {
      return this.instance;
    }

    if (this.launchPromise) {
      return this.launchPromise;
    }

    console.log('[BrowserManager] Launching reusable headless Chromium instance...');
    this.launchPromise = puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    }).then((browser) => {
      this.instance = browser;
      this.launchPromise = null;
      
      browser.on('disconnected', () => {
        console.warn('[BrowserManager] Chromium browser disconnected. Resetting singleton instance...');
        this.instance = null;
      });

      console.log('[BrowserManager] Reusable Chromium browser launched successfully.');
      return browser;
    }).catch((err) => {
      this.launchPromise = null;
      console.error('[BrowserManager] Failed to launch Chromium browser:', err);
      throw err;
    });

    return this.launchPromise;
  }

  /**
   * Closes the active browser instance.
   */
  public static async close(): Promise<void> {
    if (this.instance) {
      console.log('[BrowserManager] Closing browser instance...');
      await this.instance.close();
      this.instance = null;
    }
  }
}
