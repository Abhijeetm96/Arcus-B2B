import { apiFetch } from '../../../../lib/api';
import { rfqMockService } from './rfq.mock.service';
import type { RFQDetail } from '../types/rfqTypes';

const getHeaders = () => {
  const token = localStorage.getItem('arcus_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const rfqCommentsService = {
  async addNote(
    rfqId: string,
    author: string,
    authorRole: string,
    text: string,
    isInternal: boolean
  ): Promise<RFQDetail> {
    try {
      const res = await apiFetch(`/admin/rfqs/${rfqId}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ author, authorRole, text, isInternal })
      });
      if (!res.ok) throw new Error('Failed to add note.');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('API error, falling back to mock note addition:', err);
      return rfqMockService.addNote(rfqId, author, authorRole, text, isInternal);
    }
  }
};
