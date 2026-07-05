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
  inventory?: {
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
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'COMING_SOON' | 'DISCONTINUED' | 'ARCHIVED';
  specifications?: Record<string, string>;
  images?: string[];
  priceTiers?: PriceTier[];
  recommendedAccessories?: any[];
  reviews?: any[];
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

export interface Category {
  id: string;
  name: string;
  icon: string;
  count?: string;
  href?: string;
  parentId?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED' | string;
  count?: string;
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

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface Order {
  id: string;
  userId: string;
  timestamp?: string;
  date?: string;
  products: string;
  status: 'Pending' | 'Awaiting Delivery' | 'Out For Delivery' | 'Delivered' | 'Cancelled' | 'Awaiting Payment' | 'Confirmed' | 'Dispatched';
  amount: number;
  items: OrderItem[];
  shippingAddress: string;
  billingAddress: string;
  gstNumber?: string;
  paymentMethod: string;
  pointsEarned?: number;
  createdAt?: string;
}

export interface RFQ {
  id?: string;
  timestamp?: string;
  category: string;
  quantity?: string;
  location?: string;
  timeline?: string;
  details?: string;
  name: string;
  phone: string;
  buyerId?: string;
  status?: string;
  title?: string;
  budget?: string;
  attachmentUrls?: string[];
  createdAt?: string;
  description?: string;
  email?: string;
  items?: any[];
}

export interface User {
  id: string;
  createdAt: string;
  name: string;
  fullName?: string;
  full_name?: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  phone_number?: string;
  email_verified: boolean;
  companyName?: string;
  role: 'Customer' | 'Contractor' | 'Business' | 'Supplier' | 'Admin';
  gstNumber?: string;
  serviceCategory?: string;
  experience?: string;
  city?: string;
  state?: string;
  website?: string;
  portfolioUrl?: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  buildPoints?: number;
  orderCount?: number;
  rfqCount?: number;
  lifetimeValue?: number;
}

export interface AppSettings {
  b2cMinimumOrderValue: number;
  defaultGstRate: number;
  freeShippingThreshold: number;
  defaultMoq: number;
  defaultOrderMultiple: number;
  rfqAutoAssignment: string;
  rfqNotifications: boolean;
  quoteValidityDays: number;
  searchEnableLogging: boolean;
  notificationEmailAlerts: boolean;
}
