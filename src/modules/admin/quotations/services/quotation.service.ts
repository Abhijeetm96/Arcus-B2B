import { apiFetch } from '../../../../lib/api';

export const clientQuotationService = {
  async getQuotationsForRfq(rfqId: string): Promise<any[]> {
    const res = await apiFetch(`/admin/quotations/rfq/${rfqId}`);
    const json = await res.json();
    const list = json.data || [];
    return list.map((q: any) => ({ ...q, isPersisted: true }));
  },

  async getQuotationDetail(id: string): Promise<any> {
    const res = await apiFetch(`/admin/quotations/${id}`);
    const json = await res.json();
    const data = json.data;
    if (data) data.isPersisted = true;
    return data;
  },

  async createQuotation(
    rfqId: string,
    quoteData: any,
    totalsData: any,
    items: any[]
  ): Promise<any> {
    const res = await apiFetch('/admin/quotations', {
      method: 'POST',
      body: JSON.stringify({ rfqId, quoteData, totalsData, items })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create quotation');
    return json.data;
  },

  async updateQuotation(
    id: string,
    quoteData: any,
    totalsData: any,
    items: any[]
  ): Promise<any> {
    const res = await apiFetch(`/admin/quotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quoteData, totalsData, items })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update quotation');
    return json.data;
  },

  async createRevision(
    id: string,
    quoteData: any,
    totalsData: any,
    items: any[],
    reason: string
  ): Promise<any> {
    const res = await apiFetch(`/admin/quotations/${id}/new-version`, {
      method: 'POST',
      body: JSON.stringify({ quoteData, totalsData, items, reason })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create revision');
    return json.data;
  },

  async sendQuotation(id: string, channel: string, recipient: string): Promise<any> {
    const res = await apiFetch(`/admin/quotations/${id}/send`, {
      method: 'POST',
      body: JSON.stringify({ channel, recipient })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to share quotation');
    return json.data;
  },

  async approveQuotation(id: string, notes: string, signature?: any): Promise<any> {
    const res = await apiFetch(`/admin/quotations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes, signature })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to approve quotation');
    return json.data;
  },

  async rejectQuotation(id: string, notes: string): Promise<any> {
    const res = await apiFetch(`/admin/quotations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to reject quotation');
    return json.data;
  },

  async convertToOrder(id: string): Promise<any> {
    const res = await apiFetch(`/admin/quotations/${id}/convert`, {
      method: 'POST'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to convert quotation to order');
    return json.data;
  }
};
