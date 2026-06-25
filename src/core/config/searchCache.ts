// In-memory cache for search queries in the current session
const cache: Record<string, any> = {};

export function getCachedSearch(query: string): any | null {
  const clean = query.trim().toLowerCase();
  return cache[clean] || null;
}

export function setCachedSearch(query: string, data: any): void {
  const clean = query.trim().toLowerCase();
  cache[clean] = data;
}
