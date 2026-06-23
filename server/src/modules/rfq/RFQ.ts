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
