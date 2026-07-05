interface CacheEntry {
  html: string;
  pdf: Buffer | null;
  timestamp: number;
}

export class DocumentCache {
  private static cache: Map<string, CacheEntry> = new Map();
  private static readonly TTL = 10 * 60 * 1000; // 10 minutes cache expiry

  public static get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  public static setHtml(key: string, html: string): void {
    const existing = this.cache.get(key);
    this.cache.set(key, {
      html,
      pdf: existing ? existing.pdf : null,
      timestamp: Date.now()
    });
  }

  public static setPdf(key: string, pdf: Buffer): void {
    const existing = this.cache.get(key);
    this.cache.set(key, {
      html: existing ? existing.html : '',
      pdf,
      timestamp: Date.now()
    });
  }

  public static invalidate(key: string): void {
    console.log(`[DocumentCache] Invalidating cache key "${key}"`);
    this.cache.delete(key);
  }

  public static clear(): void {
    console.log('[DocumentCache] Clearing all document caches');
    this.cache.clear();
  }
}
export default DocumentCache;
