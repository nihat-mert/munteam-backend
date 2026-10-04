import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { api } from '../lib/axios';
import toast from 'react-hot-toast';

interface Payment {
  id: string;
  teklifNo: string;
  tarih: string;
  tutar: number;
  durum: string;
}

export const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/payments/my');
        setPayments(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
        setError('Ödemeler yüklenirken bir hata oluştu.');
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const formatMoney = (amount: number | string | null) => {
    const value = Number(amount ?? 0);
    return `${value.toFixed(2)} TL`;
  };

  const handlePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPayment || !cardData.cardNumber || !cardData.expiry || !cardData.cvv) {
      toast.error('Lütfen tüm kart bilgilerini doldurun');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/payments/${selectedPayment.id}/pay`, cardData);
      toast.success('Ödeme başarıyla tamamlandı');
      setShowPaymentModal(false);
      setCardData({ cardNumber: '', expiry: '', cvv: '' });
      const response = await api.get('/payments/my');
      setPayments(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      toast.error('Ödeme işlemi başarısız');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <Topbar />
      
      <div className="ml-64 pt-16 p-8">
        <h1 className="text-4xl font-bold mb-8">Ödemeleriniz</h1>
        
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center">
              <p className="text-xl">Yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center">
              <p className="text-red-400 text-xl">{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">💳</div>
              <h2 className="text-2xl font-bold mb-4">Henüz ödeme kaydı yok</h2>
              <p className="text-slate-400">Analiz talepleriniz oluşturuldukça ödemeleriniz burada görünecek.</p>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-700">
                    <th className="text-left py-4 px-6 font-semibold text-slate-300">Talep No</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-300">Tarih</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-300">Tutar</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-300">Durum</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-300">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-700 hover:bg-slate-700/60 transition-colors">
                      <td className="py-4 px-6">{payment.teklifNo}</td>
                      <td className="py-4 px-6">{formatDate(payment.tarih)}</td>
                      <td className="py-4 px-6">{formatMoney(payment.tutar)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          payment.durum === 'Ödendi'
                            ? 'bg-green-600 text-white'
                            : 'bg-yellow-600 text-white'
                        }`}>
                          {payment.durum}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {payment.durum === 'Bekliyor' && (
                          <button
                            onClick={() => handlePayment(payment)}
                            className="px-4 py-2 bg-accent-600 hover:bg-accent-700 rounded-lg font-semibold transition-colors"
                          >
                            Öde
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Kredi Kartı Ödeme</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                  setCardData({ cardNumber: '', expiry: '', cvv: '' });
                }}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <p className="text-slate-400 text-sm">Ödenecek Tutar</p>
                <p className="text-2xl font-bold text-white">{formatMoney(selectedPayment.tutar)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Kart Numarası</label>
                <input
                  type="text"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">SKT (AA/YY)</label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    placeholder="12/25"
                    maxLength={5}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">CVV</label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handlePaymentSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors"
                >
                  {submitting ? 'İşleniyor...' : 'Öde'}
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPayment(null);
                    setCardData({ cardNumber: '', expiry: '', cvv: '' });
                  }}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-white transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
