import { useState, useEffect } from 'react';

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('arcus_token');
      if (!token) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        throw new Error('Failed to load orders');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to cancel order.');
        return false;
      }
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      return true;
    } catch {
      alert('Network error. Failed to cancel order.');
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, refresh: fetchOrders, cancelOrder };
}
