export class NumberGenerator {
  /**
   * Generates a unique, sequential-like human-readable reference number.
   * Format: PREFIX-YYYY-XXXXX (e.g. RFQ-2026-00045)
   */
  public static generateNumber(prefix: string, sequence: number): string {
    const year = new Date().getFullYear();
    const seqStr = String(sequence).padStart(5, '0');
    return `${prefix.toUpperCase()}-${year}-${seqStr}`;
  }
}
