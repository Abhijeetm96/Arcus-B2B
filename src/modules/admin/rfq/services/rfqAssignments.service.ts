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

export const rfqAssignmentsService = {
  async assignOwner(
    rfqId: string,
    owner: string,
    user: string,
    userRole: string
  ): Promise<RFQDetail> {
    try {
      const res = await apiFetch(`/admin/rfqs/${rfqId}/assign`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ owner, user, userRole })
      });
      if (!res.ok) throw new Error('Failed to assign owner.');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to mock owner assignment:', err);
      return rfqMockService.assignOwner(rfqId, owner, user, userRole);
    }
  },

  async addWatcher(rfqId: string, userId: string): Promise<void> {
    try {
      const res = await apiFetch(`/admin/rfqs/${rfqId}/watchers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error('Failed to add watcher.');
    } catch (err) {
      console.warn('API error in addWatcher:', err);
    }
  },

  async removeWatcher(rfqId: string, userId: string): Promise<void> {
    try {
      const res = await apiFetch(`/admin/rfqs/${rfqId}/watchers/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to remove watcher.');
    } catch (err) {
      console.warn('API error in removeWatcher:', err);
    }
  }
};
