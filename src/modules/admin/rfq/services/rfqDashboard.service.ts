import { apiFetch } from '../../../../lib/api';

const getHeaders = () => {
  const token = localStorage.getItem('arcus_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const rfqDashboardService = {
  async getDashboardMetrics(): Promise<any> {
    try {
      const res = await apiFetch(`/admin/dashboard/metrics`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard metrics.');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('API error fetching dashboard metrics:', err);
      return null;
    }
  }
};
