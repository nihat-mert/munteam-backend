import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { api } from '../lib/axios';

export const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, totalAmount, removeFromCart, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error(t('cartEmpty') || 'Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };
      await api.post('/orders', payload);
      clearCart();
      toast.success(t('orderSuccess') || 'Order placed successfully');
      navigate('/my-orders');
    } catch (error) {
      toast.error(t('orderError') || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-8">{t('cart')}</h1>
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">{t('cartEmpty') || 'Your cart is empty'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-accent-600 hover:bg-accent-700 rounded transition-colors"
          >
            {t('back') || 'Back to Catalog'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">{t('cart')}</h1>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-slate-400">{t('price')}: ${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-xl font-bold text-accent-500 w-32 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-bold">{t('total')}</span>
            <span className="text-3xl font-bold text-accent-500">${totalAmount.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-slate-700 disabled:text-slate-500 rounded font-semibold transition-colors"
          >
            {loading ? t('loading') : t('checkout')}
          </button>
        </div>
      </div>
    </div>
  );
};
