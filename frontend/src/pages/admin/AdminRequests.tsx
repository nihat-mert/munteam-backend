import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/axios';
import toast from 'react-hot-toast';

interface SampleAnalysis {
  id: string;
  analysisType: {
    name: string;
    price: number;
  };
}

interface Sample {
  id: string;
  numuneAdi: string;
  ambalajSekli: string;
  kartonBoyutu: string | null;
  numuneHazirlik: string | null;
  sampleAnalyses: SampleAnalysis[];
}

interface AnalysisRequest {
  id: string;
  requestType: string;
  status: string;
  toplamTutar: number | null;
  kullanimAmaci: string | null;
  projeNo: string | null;
  destekAlanKurulus: string | null;
  teslimYontemi: string | null;
  sonucUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    adSoyad: string | null;
  };
  samples: Sample[];
}

type StatusFilter = 'ALL' | 'BEKLIYOR' | 'ISLEMDE' | 'TAMAMLANDI' | 'REDDEDILDI';

export const AdminRequests = () => {
  const [requests, setRequests] = useState<AnalysisRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<AnalysisRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultUrl, setResultUrl] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [statusFilter, requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<AnalysisRequest[]>('/admin/requests');
      setRequests(response.data);
    } catch (err) {
      setError('Talepler yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/requests/${requestId}/status`, { status: newStatus });
      toast.success('Durum başarıyla güncellendi');
      fetchRequests();
    } catch (err) {
      toast.error('Durum güncellenirken hata oluştu');
      console.error(err);
    }
  };

  const handleUploadResult = async () => {
    if (!selectedRequest || !resultUrl) {
      toast.error('Sonuç URL\'si gerekli');
      return;
    }

    try {
      await api.post(`/admin/requests/${selectedRequest.id}/result`, { sonucUrl: resultUrl });
      toast.success('Sonuç başarıyla yüklendi');
      setShowResultModal(false);
      setResultUrl('');
      fetchRequests();
    } catch (err) {
      toast.error('Sonuç yüklenirken hata oluştu');
      console.error(err);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'BEKLIYOR':
        return 'bg-yellow-600 text-white';
      case 'ISLEMDE':
        return 'bg-blue-600 text-white';
      case 'TAMAMLANDI':
        return 'bg-green-600 text-white';
      case 'REDDEDILDI':
        return 'bg-red-600 text-white';
      case 'TASLAK':
        return 'bg-slate-600 text-white';
      case 'ONAY_BEKLIYOR':
        return 'bg-orange-600 text-white';
      case 'ONAYLANDI':
        return 'bg-teal-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      TASLAK: 'Taslak',
      ONAY_BEKLIYOR: 'Onay Bekliyor',
      ONAYLANDI: 'Onaylandı',
      BEKLIYOR: 'Bekliyor',
      ISLEMDE: 'İşlemde',
      TAMAMLANDI: 'Tamamlandı',
      REDDEDILDI: 'Reddedildi',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Tüm Analiz Talepleri</h1>
          <div className="bg-slate-800 rounded-xl p-12 text-center">
            <div className="animate-pulse text-slate-400">Yükleniyor...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Tüm Analiz Talepleri</h1>
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-12 text-center">
            <div className="text-red-400 text-lg">{error}</div>
            <button
              onClick={fetchRequests}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Tüm Analiz Talepleri</h1>

        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'BEKLIYOR', 'ISLEMDE', 'TAMAMLANDI', 'REDDEDILDI'] as StatusFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  statusFilter === filter
                    ? 'bg-accent-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {filter === 'ALL' ? 'Tümü' : getStatusLabel(filter)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Talep No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Müşteri</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tarih</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tutar</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Durum</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Talep bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-white font-mono text-sm">
                        #{request.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {request.user.adSoyad || request.user.email}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        {request.toplamTutar ? `${Number(request.toplamTutar).toFixed(2)} TL` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(request.status)}`}
                        >
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailModal(true);
                            }}
                            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm text-white transition-colors"
                            title="Detayları İncele"
                          >
                            👁️
                          </button>
                          <select
                            value={request.status}
                            onChange={(e) => handleStatusChange(request.id, e.target.value)}
                            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm text-white focus:outline-none transition-colors"
                          >
                            <option value="BEKLIYOR">Bekliyor</option>
                            <option value="ISLEMDE">İşlemde</option>
                            <option value="TAMAMLANDI">Tamamlandı</option>
                            <option value="REDDEDILDI">Reddedildi</option>
                          </select>
                          {request.status === 'TAMAMLANDI' && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowResultModal(true);
                              }}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white transition-colors"
                              title="Sonuç Yükle"
                            >
                              📎
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-slate-400 text-sm">
          Toplam {filteredRequests.length} talep gösteriliyor
        </div>
      </div>

      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Talep Detayları</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-sm">Talep No:</span>
                  <p className="text-white font-mono">#{selectedRequest.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Durum:</span>
                  <p className="text-white">{getStatusLabel(selectedRequest.status)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Müşteri:</span>
                  <p className="text-white">{selectedRequest.user.adSoyad || selectedRequest.user.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">E-posta:</span>
                  <p className="text-white">{selectedRequest.user.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Tarih:</span>
                  <p className="text-white">{new Date(selectedRequest.createdAt).toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Toplam Tutar:</span>
                  <p className="text-white font-semibold">
                    {selectedRequest.toplamTutar ? `${Number(selectedRequest.toplamTutar).toFixed(2)} TL` : '-'}
                  </p>
                </div>
              </div>

              {selectedRequest.kullanimAmaci && (
                <div>
                  <span className="text-slate-400 text-sm">Kullanım Amacı:</span>
                  <p className="text-white">{selectedRequest.kullanimAmaci}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedRequest.projeNo && (
                  <div>
                    <span className="text-slate-400 text-sm">Proje No:</span>
                    <p className="text-white">{selectedRequest.projeNo}</p>
                  </div>
                )}
                {selectedRequest.destekAlanKurulus && (
                  <div>
                    <span className="text-slate-400 text-sm">Destek Alan Kuruluş:</span>
                    <p className="text-white">{selectedRequest.destekAlanKurulus}</p>
                  </div>
                )}
                {selectedRequest.teslimYontemi && (
                  <div>
                    <span className="text-slate-400 text-sm">Teslim Yöntemi:</span>
                    <p className="text-white">{selectedRequest.teslimYontemi}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Numuneler</h3>
                <div className="space-y-4">
                  {selectedRequest.samples.map((sample) => (
                    <div key={sample.id} className="bg-slate-800 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">{sample.numuneAdi}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-400">Ambalaj:</span>
                          <span className="text-white ml-2">{sample.ambalajSekli}</span>
                        </div>
                        {sample.kartonBoyutu && (
                          <div>
                            <span className="text-slate-400">Karton Boyutu:</span>
                            <span className="text-white ml-2">{sample.kartonBoyutu}</span>
                          </div>
                        )}
                        {sample.numuneHazirlik && (
                          <div>
                            <span className="text-slate-400">Hazırlık:</span>
                            <span className="text-white ml-2">{sample.numuneHazirlik}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <span className="text-slate-400 text-sm">İstenen Analizler:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {sample.sampleAnalyses.map((sa) => (
                            <span
                              key={sa.id}
                              className="px-2 py-1 bg-slate-700 rounded text-xs text-white"
                            >
                              {sa.analysisType.name} ({Number(sa.analysisType.price).toFixed(2)} TL)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequest.sonucUrl && (
                <div>
                  <span className="text-slate-400 text-sm">Sonuç URL:</span>
                  <a
                    href={selectedRequest.sonucUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-500 hover:underline ml-2"
                  >
                    {selectedRequest.sonucUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showResultModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Sonuç Yükle</h2>
              <button
                onClick={() => setShowResultModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium mb-2 text-white">Sonuç URL</label>
              <input
                type="text"
                value={resultUrl}
                onChange={(e) => setResultUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleUploadResult}
                  className="flex-1 py-2 bg-accent-600 hover:bg-accent-700 rounded-lg font-semibold text-white transition-colors"
                >
                  Yükle
                </button>
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setResultUrl('');
                  }}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-white transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
