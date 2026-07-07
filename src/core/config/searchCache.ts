// In-memory cache for search queries in the current session
const cache: Record<string, any> = {};
const suggestCache: Record<string, any> = {};
const pending: Record<string, Promise<any>> = {};

export function getCachedSearch(query: string): any | null {
  const clean = query.trim().toLowerCase();
  return cache[clean] || null;
}

export function setCachedSearch(query: string, data: any): void {
  const clean = query.trim().toLowerCase();
  cache[clean] = data;
}

export function getCachedSuggest(query: string): any | null {
  const clean = query.trim().toLowerCase();
  return suggestCache[clean] || null;
}

export function setCachedSuggest(query: string, data: any): void {
  const clean = query.trim().toLowerCase();
  suggestCache[clean] = data;
}

export function getPendingSearch(query: string): Promise<any> | null {
  const clean = query.trim().toLowerCase();
  return pending[clean] || null;
}

export function setPendingSearch(query: string, promise: Promise<any>): void {
  const clean = query.trim().toLowerCase();
  pending[clean] = promise;
  promise.finally(() => {
    delete pending[clean];
  });
}
