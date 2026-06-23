export interface Inventory {
  available: number;
  reserved: number;
  reorderLevel: number;
}

export interface InventoryAdjustment {
  id?: number;
  productId: string;
  adjustmentType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  performedBy: string;
  timestamp?: string;
}

