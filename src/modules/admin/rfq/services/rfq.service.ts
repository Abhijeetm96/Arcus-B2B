import type { RFQDetail, RFQSummary } from '../types/rfqTypes';

const getHeaders = () => {
  const token = localStorage.getItem('arcus_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const rfqService = {
  async getRFQList(filters?: {
    search?: string;
    status?: string;
    priority?: string;
    owner?: string;
    location?: string;
    industry?: string;
    minVal?: number;
    maxVal?: number;
  }): Promise<RFQSummary[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            queryParams.append(key, String(val));
          }
        });
      }
      
      const res = await fetch(`http://localhost:5000/api/admin/rfqs?${queryParams.toString()}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch RFQ list from server.');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to mock data:', err);
      const { rfqMockService } = await import('./rfq.mock.service');
      return rfqMockService.getRFQList(filters);
    }
  },

  async getRFQDetail(id: string): Promise<RFQDetail | undefined> {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/rfqs/${id}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch RFQ detail from server.');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to mock data:', err);
      const { rfqMockService } = await import('./rfq.mock.service');
      return rfqMockService.getRFQDetail(id);
    }
  },

  async addNote(
    rfqId: string,
    author: string,
    authorRole: string,
    text: string,
    isInternal: boolean
  ): Promise<RFQDetail> {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/rfqs/${rfqId}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ author, authorRole, text, isInternal })
      });
      if (!res.ok) throw new Error('Failed to add note.');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to mock note addition:', err);
      const { rfqMockService } = await import('./rfq.mock.service');
      return rfqMockService.addNote(rfqId, author, authorRole, text, isInternal);
    }
  },

  async addAttachment(
    rfqId: string,
    attachment: { filename: string; fileType: string; size: string; uploader: string }
  ): Promise<RFQDetail> {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/rfqs/${rfqId}/attachments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(attachment)
      });
      if (!res.ok) throw new Error('Failed to add attachment.');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to mock attachment addition:', err);
      const { rfqMockService } = await import('./rfq.mock.service');
      return rfqMockService.addAttachment(rfqId, attachment);
    }
  },

  async changeStatus(
    rfqId: string,
    status: string,
    user: string,
    userRole: string
  ): Promise<RFQDetail> {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/rfqs/${rfqId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, user, userRole })
      });
      if (!res.ok) throw new Error('Failed to update status.');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to mock status change:', err);
      const { rfqMockService } = await import('./rfq.mock.service');
      return rfqMockService.changeStatus(rfqId, status, user, userRole);
    }
  },

  async assignOwner(
    rfqId: string,
    owner: string,
    user: string,
    userRole: string
  ): Promise<RFQDetail> {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/rfqs/${rfqId}/assign`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ owner, user, userRole })
      });
      if (!res.ok) throw new Error('Failed to assign owner.');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to mock owner assignment:', err);
      const { rfqMockService } = await import('./rfq.mock.service');
      return rfqMockService.assignOwner(rfqId, owner, user, userRole);
    }
  },

  async createQuotation(
    rfqId: string,
    quoteDetails: { value: number; validityDays: number },
    user: string,
    userRole: string
  ): Promise<RFQDetail> {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/rfqs/${rfqId}/quotations-draft`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ value: quoteDetails.value, validityDays: quoteDetails.validityDays, user, userRole })
      });
      if (!res.ok) throw new Error('Failed to create quotation draft.');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to mock quotation creation:', err);
      const { rfqMockService } = await import('./rfq.mock.service');
      return rfqMockService.createQuotation(rfqId, quoteDetails, user, userRole);
    }
  },

  async createRFQ(rfqData: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    location: string;
    projectType: string;
    details: string;
    priority: string;
    dueDate: string;
    items: Array<{ itemName: string; quantity: number; description: string; unit: string; targetPrice: number }>;
  }): Promise<RFQDetail> {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/rfqs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(rfqData)
      });
      if (!res.ok) throw new Error('Failed to create RFQ on server.');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to mock RFQ creation:', err);
      const { rfqMockService } = await import('./rfq.mock.service');
      return rfqMockService.createRFQ(rfqData);
    }
  }
};
