import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { api } from '../lib/axios';
import { PrintableDocument } from '../components/PrintableDocument';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  product?: {
    name: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  items: OrderItem[];
}

export const MyOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get<Order[]>('/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-400';
      case 'COMPLETED':
        return 'text-green-400';
      case 'CANCELLED':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Sidebar />
        <Topbar />
        <div className="ml-64 pt-16 p-8">
          <div className="text-xl">{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <Topbar />
      <div className="ml-64 pt-16 p-8">
      <h1 className="text-4xl font-bold mb-8">{t('orders')}</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">{t('noOrders') || 'No orders yet'}</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-400 text-sm">{t('orderDate')}: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-slate-400 text-sm">ID: {order.id}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPrintingOrder(order)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Yazdır
                  </button>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${getStatusColor(order.status)}`}>
                      {t(order.status.toLowerCase())}
                    </p>
                    <p className="text-2xl font-bold text-accent-500 mt-2">
                      ${Number(order.totalAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-700 pt-4">
                <h3 className="font-semibold mb-3">{t('items')}</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-300">
                        {item.product?.name || `Product ID: ${item.productId}`}
                      </span>
                      <span className="text-slate-400">
                        {item.quantity} x ${Number(item.priceAtPurchase).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print Modal */}
      {printingOrder && (
        <PrintableDocument
          documentType="ORDER"
          documentNumber={printingOrder.id}
          requestDate={printingOrder.createdAt}
          customerInfo={{
            adSoyad: '-',
            kurum: '-',
            tcKimlik: '-',
            vergiNo: '-',
            telefon: '-',
            email: '-',
            faturaAdresi: '-',
            kullanimAmaci: '-',
            projeNo: '-',
          }}
          items={printingOrder.items.map((item) => ({
            code: item.productId,
            name: item.product?.name || `Product ID: ${item.productId}`,
            unitPrice: Number(item.priceAtPurchase),
            quantity: item.quantity,
            total: Number(item.priceAtPurchase) * item.quantity,
          }))}
          subtotal={Number(printingOrder.totalAmount) / 1.2}
          kdv={Number(printingOrder.totalAmount) * 0.2 / 1.2}
          total={Number(printingOrder.totalAmount)}
          onClose={() => setPrintingOrder(null)}
        />
      )}
      </div>
    </div>
  );
};
