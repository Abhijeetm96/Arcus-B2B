export interface RFQItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
}

export interface RFQTimelineEvent {
  id: string;
  eventType: string; // e.g., 'SUBMITTED' | 'ASSIGNED' | 'NOTE_ADDED' | 'QUOTE_CREATED' | 'REVISION_REQUESTED' | 'CONVERTED'
  title: string;
  description: string;
  timestamp: string;
  user: string;
  userRole: string;
}

export interface RFQComment {
  id: string;
  author: string;
  authorRole: string;
  text: string;
  timestamp: string;
  isInternal: boolean;
}

export interface RFQAttachment {
  id: string;
  filename: string;
  fileType: 'PDF' | 'EXCEL' | 'IMAGE' | 'CAD' | 'BOQ' | string;
  size: string;
  uploader: string;
  uploadedAt: string;
  version: string;
}

export interface RFQQuotation {
  id: string;
  version: string;
  value: number;
  status: 'DRAFT' | 'SENT' | 'REVISED' | 'ACCEPTED' | 'REJECTED' | string;
  createdAt: string;
  validUntil: string;
  pdfUrl: string;
  quotation_number?: string;
  grand_total?: number;
  created_at?: string;
  expires_at?: string;
}

export interface RFQCustomer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  gstNumber?: string;
  location: string;
  industry?: string;
}

export interface RFQSummary {
  id: string; // internal UUID or RFQ Number
  rfqNumber: string; // e.g. RFQ-2026-001
  companyName: string;
  contactName: string;
  status: string; // RFQStatus value
  priority: string; // RFQPriority value
  owner: string; // Sales representative name
  value: number; // total value in INR
  lastUpdated: string; // ISO date string
  dueDate: string; // ISO date string
}

export interface RFQDetail extends RFQSummary {
  customer: RFQCustomer;
  items: RFQItem[];
  timeline: RFQTimelineEvent[];
  notes: RFQComment[];
  attachments: RFQAttachment[];
  quotations: RFQQuotation[];
  description?: string;
  projectType?: string; // e.g. 'Commercial Building', 'Apartment Project', etc.
}
