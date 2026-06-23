export interface SearchQueryLog {
  query: string;
  resultsCount: number;
  timestamp: string;
}

export interface SearchClickLog {
  query: string;
  productId: string;
  timestamp: string;
}
