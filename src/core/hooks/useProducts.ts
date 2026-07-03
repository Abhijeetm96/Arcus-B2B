import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const prodRes = await apiFetch('/products', { headers });
      if (!prodRes.ok) throw new Error('Failed to load products');
      const prodData = await prodRes.json();
      
      const flatProducts: any[] = [];
      if (Array.isArray(prodData)) {
        if (prodData.length > 0 && 'products' in prodData[0] && Array.isArray((prodData[0] as any).products)) {
          prodData.forEach((cat: any) => {
            if (cat.products && Array.isArray(cat.products)) {
              cat.products.forEach((p: any) => {
                if (!flatProducts.some(fp => fp.id === p.id)) {
                  flatProducts.push({
                    ...p,
                    categoryId: p.categoryId || cat.title.toLowerCase(),
                    categoryTitle: p.categoryTitle || cat.title,
                    price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^\d.]/g, '')) || 0
                  });
                }
              });
            }
          });
          setProducts(flatProducts);
        } else {
          setProducts(prodData);
        }
      }

      const catRes = await apiFetch('/admin/categories', { headers });
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  return { products, categories, loading, error, refresh: fetchCatalog };
}
