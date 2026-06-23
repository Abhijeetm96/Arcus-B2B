export interface PriceTier {
  min: number;
  max: number;
  price: number;
  save: number;
}

export interface Product {
  id: string;
  productId: string;
  sku: string;
  brand: string;
  model: string;
  name: string;
  description?: string;
  categoryId: string;
  subcategorySlug?: string;
  leafSlug?: string;
  price: number;
  unitOfMeasure: string;
  hsnCode?: string;
  gstRate?: number;
  inventory: {
    available: number;
    reserved: number;
    reorderLevel: number;
  };
  minimumOrderQuantity: number;
  minimumOrderUnit: string;
  orderMultiple?: number;
  allowB2B: boolean;
  allowB2C: boolean;
  leadTimeDays?: number;
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'COMING_SOON' | 'DISCONTINUED' | 'ARCHIVED' | 'RFQ_ONLY';
  specifications?: Record<string, string>;
  images?: string[];
  priceTiers?: PriceTier[];
  recommendedAccessories?: any[];
  reviews?: any[];
  
  // Legacy fields for backward compatibility:
  categoryTitle?: string;
  unit?: string;
  stock?: number;
  link?: string;
  icon?: string;
  rating?: string;
  procurementPrice?: number;
  vendorName?: string;
  vendorProductCode?: string;
}
