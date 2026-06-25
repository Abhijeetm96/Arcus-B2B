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
  items?: any[];
}

export interface Booking {
  id?: string;
  timestamp?: string;
  serviceName: string;
  name: string;
  phone: string;
  date: string;
  notes?: string;
}

export interface DirectQuote {
  id?: string;
  timestamp?: string;
  contractorId: string;
  contractorCompany: string;
  name: string;
  phone: string;
  budget: string;
  timeline: string;
  desc?: string;
}

export interface QuotationItem {
  id?: string;
  quotationId?: string;
  itemName: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  gstRate?: number;
  lineTotal: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  version: number;
  rfqId: string;
  status: 'SENT' | 'APPROVED' | 'DECLINED' | 'NEGOTIATION_REQUESTED';
  subtotal: number;
  discountType: 'FLAT' | 'PERCENT' | 'NONE';
  discountValue: number;
  shippingCharges: number;
  freeShipping: boolean;
  gstAmount: number;
  grandTotal: number;
  deliveryTerms?: string;
  paymentTerms?: string;
  validityDate?: string;
  notes?: string;
  customerComments?: string;
  declineReason?: string;
  createdAt?: string;
  createdBy?: string;
  items?: QuotationItem[];
}

