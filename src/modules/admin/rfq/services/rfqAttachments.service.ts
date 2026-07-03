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

export const rfqAttachmentsService = {
  async addAttachment(
    rfqId: string,
    attachment: { filename: string; fileType: string; size: string; uploader: string }
  ): Promise<RFQDetail> {
    try {
      const res = await apiFetch(`/admin/rfqs/${rfqId}/attachments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(attachment)
      });
      if (!res.ok) throw new Error('Failed to add attachment.');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to mock attachment addition:', err);
      return rfqMockService.addAttachment(rfqId, attachment);
    }
  }
};
