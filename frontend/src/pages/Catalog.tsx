import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/axios';
import { ProductCard } from '../components/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  atomicNumber: number;
}

interface PaginatedResponse {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export const Catalog = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get<PaginatedResponse>(`/products?page=${page}&limit=12`);
        setProducts(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">{t('products')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center text-slate-400 py-12">
          <p>{t('noProducts') || 'No products available'}</p>
        </div>
      )}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 rounded transition-colors"
        >
          {t('previous')}
        </button>
        <span className="px-4 py-2 text-slate-400">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 rounded transition-colors"
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
};
