import type { RFQDetail, RFQSummary } from '../types/rfqTypes';
import { apiFetch } from '../../../../lib/api';
import { rfqCommentsService } from './rfqComments.service';
import { rfqAttachmentsService } from './rfqAttachments.service';
import { rfqAssignmentsService } from './rfqAssignments.service';

const getHeaders = () => {
  const token = localStorage.getItem('arcus_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

import type { RFQTimelineEvent } from '../types/rfqTypes';

function mapBackendRfqToSummary(r: any): RFQSummary {
  if (r.rfqNumber) return r; // Already mapped/mocked
  const customer = typeof r.customer_json === 'string'
    ? JSON.parse(r.customer_json)
    : r.customer_json || {};
  return {
    id: r.id,
    rfqNumber: r.rfq_number || '',
    companyName: customer.companyName || r.company_name || r.name || '',
    contactName: customer.name || r.name || '',
    status: r.status,
    priority: r.priority,
    owner: r.assigned_name || 'Unassigned',
    value: typeof r.value === 'number' ? r.value : parseFloat(r.value) || 0,
    lastUpdated: r.updated_at || r.timestamp || new Date().toISOString(),
    dueDate: r.due_date || new Date().toISOString()
  };
}

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
      
      const res = await apiFetch(`/admin/rfqs?${queryParams.toString()}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch RFQ list from server.');
      const data = await res.json();
      if (data.success && data.rows) {
        return data.rows.map(mapBackendRfqToSummary);
      }
      return Array.isArray(data) ? data.map(mapBackendRfqToSummary) : data;
    } catch (err) {
      console.warn('API error, falling back to mock data:', err);
      const { rfqMockService } = await import('./rfq.mock.service');
      return rfqMockService.getRFQList(filters);
    }
  },

  async getRFQDetail(id: string): Promise<RFQDetail | undefined> {
    try {
      const res = await apiFetch(`/admin/rfqs/${id}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch RFQ detail from server.');
      const data = await res.json();
      if (data.success && data.rfq) {
        const r = data.rfq;
        const customer = typeof r.customer_json === 'string'
          ? JSON.parse(r.customer_json)
          : r.customer_json || {};

        // Parse comments/notes
        const notes = (data.comments || []).map((c: any) => ({
          id: c.id,
          author: c.author_name || c.author_id || '',
          authorRole: c.author_role || '',
          text: c.text || '',
          timestamp: c.timestamp || new Date().toISOString(),
          isInternal: c.is_internal ?? true
        }));

        // Parse items
        const items = (data.items || []).map((i: any) => {
          const specs = typeof i.specification_requirements === 'string'
            ? JSON.parse(i.specification_requirements)
            : i.specification_requirements || {};
          return {
            id: i.id,
            itemName: i.item_name || '',
            description: specs.description || '',
            quantity: typeof i.quantity === 'number' ? i.quantity : parseFloat(i.quantity) || 0,
            unit: specs.unit || 'Piece',
            targetPrice: specs.targetPrice
          };
        });

        // Parse attachments
        const attachments = (data.attachments || []).map((a: any) => ({
          id: a.id,
          filename: a.filename || '',
          fileType: a.mime_type || '',
          size: a.size || '',
          uploader: a.uploader_name || a.uploaded_by_id || '',
          uploadedAt: a.uploaded_at || new Date().toISOString(),
          version: a.version || 'v1.0'
        }));

        // Parse timeline
        const timelineEvents: RFQTimelineEvent[] = [];
        
        // 1. Submitted
        timelineEvents.push({
          id: `submit-${r.id}`,
          eventType: 'SUBMITTED',
          title: 'RFQ Submitted',
          description: `RFQ was submitted by ${customer.name || r.name}.`,
          timestamp: r.timestamp || new Date().toISOString(),
          user: customer.name || r.name,
          userRole: 'Buyer Client Representative'
        });

        // 2. Assignment history
        if (data.assignmentHistory && data.assignmentHistory.length > 0) {
          data.assignmentHistory.forEach((ah: any) => {
            timelineEvents.push({
              id: ah.id,
              eventType: 'ASSIGNED',
              title: 'RFQ Assigned',
              description: `Assigned to ${ah.primary_owner_name || 'Vikram Sharma'} (Sales) and ${ah.secondary_owner_name || 'Karan Malhotra'} (Procurement).`,
              timestamp: ah.assigned_at || new Date().toISOString(),
              user: ah.assigned_by_name || 'System Router',
              userRole: 'System Admin'
            });
          });
        }

        // 3. Comments as internal notes events
        notes.forEach((n: any) => {
          timelineEvents.push({
            id: `note-${n.id}`,
            eventType: 'NOTE_ADDED',
            title: n.isInternal ? 'Internal Note Added' : 'Customer Comment Added',
            description: n.text,
            timestamp: n.timestamp,
            user: n.author,
            userRole: n.authorRole
          });
        });

        // 4. Attachments upload events
        attachments.forEach((a: any) => {
          timelineEvents.push({
            id: `attach-${a.id}`,
            eventType: 'NOTE_ADDED',
            title: 'Attachment Uploaded',
            description: `${a.filename} was uploaded.`,
            timestamp: a.uploadedAt,
            user: a.uploader,
            userRole: 'Contributor'
          });
        });

        return {
          id: r.id,
          rfqNumber: r.rfq_number || '',
          companyName: customer.companyName || r.company_name || r.name || '',
          contactName: customer.name || r.name || '',
          status: r.status,
          priority: r.priority,
          owner: r.assigned_name || 'Unassigned',
          value: typeof r.value === 'number' ? r.value : parseFloat(r.value) || 0,
          lastUpdated: r.updated_at || r.timestamp || new Date().toISOString(),
          dueDate: r.due_date || new Date().toISOString(),
          description: r.details || '',
          projectType: r.project_type || 'General Procurement',
          customer: {
            id: customer.id || r.created_by_id || '',
            name: customer.name || r.name || '',
            companyName: customer.companyName || '',
            email: customer.email || '',
            phone: customer.phone || '',
            gstNumber: customer.gstNumber || '',
            location: customer.location || r.location || '',
            industry: customer.industry || ''
          },
          items,
          timeline: timelineEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
          notes,
          attachments,
          quotations: [] // Loaded asynchronously on the dashboard drawer
        };
      }
      return data;
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
    return rfqCommentsService.addNote(rfqId, author, authorRole, text, isInternal);
  },

  async addAttachment(
    rfqId: string,
    attachment: { filename: string; fileType: string; size: string; uploader: string }
  ): Promise<RFQDetail> {
    return rfqAttachmentsService.addAttachment(rfqId, attachment);
  },

  async changeStatus(
    rfqId: string,
    status: string,
    user: string,
    userRole: string
  ): Promise<RFQDetail> {
    try {
      const res = await apiFetch(`/admin/rfqs/${rfqId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, user, userRole })
      });
      if (!res.ok) throw new Error('Failed to update status.');
      const data = await res.json();
      return data.success && data.rfq ? data.rfq : data;
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
    return rfqAssignmentsService.assignOwner(rfqId, owner, user, userRole);
  },

  async createQuotation(
    rfqId: string,
    quoteDetails: { value: number; validityDays: number },
    user: string,
    userRole: string
  ): Promise<RFQDetail> {
    try {
      const res = await apiFetch(`/admin/rfqs/${rfqId}/quotations-draft`, {
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
      const res = await apiFetch(`/admin/rfqs`, {
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
