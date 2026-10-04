import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { api } from '../lib/axios';
import toast from 'react-hot-toast';

interface AnalysisRequest {
  id: string;
  status: string;
  createdAt: string;
}

export const Survey = () => {
  const [requests, setRequests] = useState<AnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchCompletedRequests();
  }, []);

  const fetchCompletedRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get<AnalysisRequest[]>('/analysis/my');
      const completed = response.data.filter((req) => req.status === 'TAMAMLANDI');
      setRequests(completed);
    } catch (err) {
      toast.error('Talepler yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRequestId || rating === 0) {
      toast.error('Lütfen bir talep seçin ve puan verin');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/surveys', {
        requestId: selectedRequestId,
        rating,
        comment: comment || undefined,
      });
      toast.success('Anketiniz başarıyla gönderildi');
      setSelectedRequestId('');
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error('Anket gönderilirken hata oluştu');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Sidebar />
        <Topbar />
        <div className="ml-64 pt-16 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800 rounded-xl p-12 text-center">
              <div className="animate-pulse text-slate-400">Yükleniyor...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <Topbar />
      
      <div className="ml-64 pt-16 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Memnuniyet Anketi</h1>

          <div className="bg-slate-800 rounded-xl p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Talep Seçin</label>
                <select
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
                >
                  <option value="">Tamamlanan talep seçin...</option>
                  {requests.map((req) => (
                    <option key={req.id} value={req.id}>
                      #{req.id.slice(0, 8).toUpperCase()} - {new Date(req.createdAt).toLocaleDateString('tr-TR')}
                    </option>
                  ))}
                </select>
              </div>

              {requests.length === 0 && (
                <p className="text-slate-400 text-center py-4">
                  Henüz tamamlanan talep bulunmuyor.
                </p>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Puanınız (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        rating === star
                          ? 'bg-accent-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {star} ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Yorumunuz (İsteğe Bağlı)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white resize-none"
                  placeholder="Geri bildiriminizi buraya yazın..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedRequestId || rating === 0}
                className="w-full py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors"
              >
                {submitting ? 'Gönderiliyor...' : 'Anketi Gönder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
