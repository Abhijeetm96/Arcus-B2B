import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { useNotification } from '../../hooks/useNotification';

export function useBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { error: notifyError } = useNotification();

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('arcus_token');
      if (!token) {
        setBookings([]);
        setLoading(false);
        return;
      }
      const res = await apiFetch('/service-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        throw new Error('Failed to load service bookings.');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching service bookings');
      notifyError(err.message || 'Failed to fetch service bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return { bookings, loading, error, refresh: fetchBookings };
}
