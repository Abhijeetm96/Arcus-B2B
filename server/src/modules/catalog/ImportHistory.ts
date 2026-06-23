export interface ImportHistory {
  id: string;
  importDate: string;
  importedBy: string;
  fileName: string;
  mode: string;
  productsAdded: number;
  productsUpdated: number;
  productsFailed: number;
  errorReport?: string; // CSV error details format
}
