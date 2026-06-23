import { useState, useEffect } from 'react';

export function useRFQs() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRfqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('arcus_token');
      if (!token) {
        setRfqs([]);
        setLoading(false);
        return;
      }
      const res = await fetch('http://localhost:5000/api/rfqs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRfqs(data);
      } else {
        throw new Error('Failed to load RFQs');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching RFQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  return { rfqs, loading, error, refresh: fetchRfqs };
}
