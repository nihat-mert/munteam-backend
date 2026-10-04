import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Eye, FlaskConical, Printer, Download, Search } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { api } from '../lib/axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SampleAnalysis {
  id?: string;
  analysisType?: {
    id?: string;
    name?: string;
    price?: number;
  } | null;
}

interface Sample {
  id?: string;
  numuneAdi?: string | null;
  ambalajSekli?: string | null;
  sampleAnalyses?: SampleAnalysis[] | null;
}

interface AnalysisRequest {
  id?: string;
  requestType?: string | null;
  status?: string | null;
  toplamTutar?: number | string | null;
  kullanimAmaci?: string | null;
  projeNo?: string | null;
  createdAt?: string | null;
  samples?: Sample[] | null;
  user?: {
    adSoyad?: string | null;
    unvan?: string | null;
    kurumTipi?: string | null;
    tcKimlik?: string | null;
    vergiNo?: string | null;
    telefon?: string | null;
    email?: string | null;
    faturaAdresi?: string | null;
  } | null;
}

const PAGE_SIZE = 100;

function toRequestList(payload: unknown): AnalysisRequest[] {
  if (Array.isArray(payload)) {
    return payload.filter(Boolean);
  }
  if (payload && typeof payload === 'object') {
    const nested = (payload as { data?: unknown }).data;
    if (Array.isArray(nested)) {
      return nested.filter(Boolean);
    }
  }
  return [];
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('tr-TR');
}

function formatMoney(value?: number | string | null) {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return '0.00 TL';
  return `${amount.toFixed(2)} TL`;
}

function statusLabel(status?: string | null) {
  switch (status) {
    case 'ONAYLANDI':
      return 'Onaylandı';
    case 'ONAY_BEKLIYOR':
      return 'Onay Bekliyor';
    case 'TASLAK':
      return 'Taslak';
    default:
      return status || '-';
  }
}

function customerGroup(kurumTipi?: string | null) {
  if (kurumTipi === 'KURUMSAL') return 'Kurumsal';
  if (kurumTipi === 'BIREYSEL') return 'Bireysel';
  return kurumTipi || '-';
}

function teklifNo(request: AnalysisRequest, index: number) {
  if (request.projeNo) return request.projeNo;
  if (request.id) return request.id.slice(0, 8).toUpperCase();
  return `TKL-${String(index + 1).padStart(3, '0')}`;
}

export const MyAnalysisRequests = () => {
  const [requests, setRequests] = useState<AnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<AnalysisRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/analysis/my-requests');
        const parsedData = toRequestList(response?.data);
        setRequests(Array.isArray(parsedData) ? parsedData : []);
        setPage(0);
      } catch (error) {
        console.error('Failed to fetch analysis requests:', error);
        setError('Veriler yüklenirken bir hata oluştu.');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const safeRequests = Array.isArray(requests) ? requests : [];
  const rangeStart = page * PAGE_SIZE;
  const rangeEnd = rangeStart + PAGE_SIZE;
  const maxPage = Math.max(0, Math.ceil(safeRequests.length / PAGE_SIZE) - 1);

  const pageRows = useMemo(
    () => {
      try {
        return (safeRequests || []).slice(rangeStart, rangeEnd);
      } catch {
        return [];
      }
    },
    [safeRequests, rangeStart, rangeEnd],
  );

  const handlePrev = () => {
    setPage((current) => Math.max(0, current - 1));
  };

  const handleNext = () => {
    setPage((current) => Math.min(maxPage, current + 1));
  };

  const handleView = (request: AnalysisRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleLabDetail = (request: AnalysisRequest) => {
    setSelectedRequest(request);
    setIsLabModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async (request: AnalysisRequest) => {
    if (!request) return;

    const requestTeklifNo = teklifNo(request, 0);
    const pdfFileName = `Analiz_Talebi_${requestTeklifNo}.pdf`;

    // Create a hidden HTML element for PDF generation
    const pdfContent = document.createElement('div');
    pdfContent.style.position = 'absolute';
    pdfContent.style.left = '-9999px';
    pdfContent.style.top = '0';
    pdfContent.style.width = '800px';
    pdfContent.style.padding = '40px';
    pdfContent.style.backgroundColor = '#ffffff';
    pdfContent.style.color = '#000000';
    pdfContent.style.fontFamily = 'Arial, sans-serif';

    pdfContent.innerHTML = `
      <div style="border: 2px solid #1e40af; padding: 30px; border-radius: 8px;">
        <h1 style="color: #1e40af; margin-bottom: 20px; font-size: 24px; font-weight: bold;">Analiz Talebi Detayı</h1>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <p style="color: #666; font-size: 12px; margin-bottom: 5px;">Teklif No</p>
            <p style="font-size: 16px; font-weight: bold;">${requestTeklifNo}</p>
          </div>
          <div>
            <p style="color: #666; font-size: 12px; margin-bottom: 5px;">Tarih</p>
            <p style="font-size: 16px;">${formatDate(request?.createdAt)}</p>
          </div>
          <div>
            <p style="color: #666; font-size: 12px; margin-bottom: 5px;">Durum</p>
            <p style="font-size: 16px; font-weight: bold;">${statusLabel(request?.status)}</p>
          </div>
          <div>
            <p style="color: #666; font-size: 12px; margin-bottom: 5px;">Toplam Tutar</p>
            <p style="font-size: 16px; font-weight: bold; color: #059669;">${formatMoney(request?.toplamTutar)}</p>
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <p style="color: #666; font-size: 12px; margin-bottom: 5px;">Müşteri</p>
          <p style="font-size: 16px; font-weight: bold;">${request?.user?.adSoyad || '-'}</p>
          <p style="font-size: 14px; color: #666;">${request?.user?.unvan || '-'}</p>
        </div>
        ${request?.samples && request.samples.length > 0 ? `
          <div>
            <p style="color: #666; font-size: 12px; margin-bottom: 10px;">Numuneler</p>
            ${request.samples.map((sample) => `
              <div style="background-color: #f3f4f6; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
                <p style="font-weight: bold; margin-bottom: 5px;">${sample.numuneAdi || '-'}</p>
                <p style="font-size: 14px; color: #666;">${sample.sampleAnalyses?.length || 0} analiz</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(pdfContent);

    try {
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(pdfFileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF oluşturulurken bir hata oluştu.');
    } finally {
      document.body.removeChild(pdfContent);
    }
  };

  const handleSearch = () => {
    alert('Sonuç raporu özelliği yapım aşamasındadır.');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <Topbar />

      <div className="ml-64 pt-16 p-8">
        <h1 className="text-4xl font-bold mb-8">Mevcut Analiz Taleplerim</h1>

        {loading ? (
          <p className="text-xl">Yükleniyor...</p>
        ) : error ? (
          <div className="text-red-400 text-xl">{error}</div>
        ) : (
          <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm text-slate-300">
                Gösterilen kayıtlar {rangeStart}-{rangeEnd}
              </p>
              <button
                type="button"
                onClick={handlePrev}
                disabled={page === 0}
                aria-label="Geri"
                className="w-9 h-9 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={page >= maxPage}
                aria-label="İleri"
                className="w-9 h-9 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="w-full overflow-x-auto bg-slate-800 rounded-xl shadow-lg">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Teklif No</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Tarih</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Müşteri Grubu</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Müşteri Adı</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Birim</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Toplam</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Teklif Durumu</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {(pageRows || []).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 px-4 text-center text-slate-400">
                        Henüz analiz talebi yok.
                      </td>
                    </tr>
                  ) : (
                    (pageRows || []).map((request, index) => {
                      const rowKey = request?.id || `row-${rangeStart + index}`;
                      return (
                        <tr key={rowKey} className="border-b border-slate-700 hover:bg-slate-700/60 transition-colors">
                          <td className="py-3 px-4">{teklifNo(request, rangeStart + index)}</td>
                          <td className="py-3 px-4">{formatDate(request?.createdAt)}</td>
                          <td className="py-3 px-4">{customerGroup(request?.user?.kurumTipi)}</td>
                          <td className="py-3 px-4">{request?.user?.adSoyad || '-'}</td>
                          <td className="py-3 px-4">{request?.user?.unvan || '-'}</td>
                          <td className="py-3 px-4">{formatMoney(request?.toplamTutar)}</td>
                          <td className="py-3 px-4">{statusLabel(request?.status)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="Görüntüle"
                                onClick={() => handleView(request)}
                                className="w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded-md flex items-center justify-center"
                              >
                                <Eye className="w-4 h-4 text-white" />
                              </button>
                              <button
                                type="button"
                                title="Laboratuvar"
                                onClick={() => handleLabDetail(request)}
                                className="w-9 h-9 bg-[#0b1f4d] hover:bg-[#08163a] rounded-md flex items-center justify-center"
                              >
                                <FlaskConical className="w-4 h-4 text-white" />
                              </button>
                              <button
                                type="button"
                                title="Yazdır"
                                onClick={handlePrint}
                                className="w-9 h-9 bg-sky-400 hover:bg-sky-500 rounded-md flex items-center justify-center"
                              >
                                <Printer className="w-4 h-4 text-white" />
                              </button>
                              <button
                                type="button"
                                title="İndir"
                                onClick={() => handleDownload(request)}
                                className="w-9 h-9 bg-green-600 hover:bg-green-700 rounded-md flex items-center justify-center"
                              >
                                <Download className="w-4 h-4 text-white" />
                              </button>
                              <button
                                type="button"
                                title="Detay"
                                onClick={handleSearch}
                                className="w-9 h-9 bg-blue-800 hover:bg-blue-900 rounded-md flex items-center justify-center"
                              >
                                <Search className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Analiz Talebi Detayı</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
              >
                Kapat
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Teklif No</p>
                  <p className="font-semibold">{teklifNo(selectedRequest, 0)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Tarih</p>
                  <p className="font-semibold">{formatDate(selectedRequest?.createdAt)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Durum</p>
                  <p className="font-semibold">{statusLabel(selectedRequest?.status)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Toplam Tutar</p>
                  <p className="font-semibold">{formatMoney(selectedRequest?.toplamTutar)}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Müşteri</p>
                <p className="font-semibold">{selectedRequest?.user?.adSoyad || '-'}</p>
                <p className="text-sm text-slate-400">{selectedRequest?.user?.unvan || '-'}</p>
              </div>
              {selectedRequest?.samples && selectedRequest.samples.length > 0 && (
                <div>
                  <p className="text-slate-400 text-sm mb-2">Numuneler</p>
                  <div className="space-y-2">
                    {selectedRequest.samples.map((sample, idx) => (
                      <div key={sample.id || idx} className="bg-slate-700 rounded-lg p-3">
                        <p className="font-semibold">{sample.numuneAdi || '-'}</p>
                        <p className="text-sm text-slate-400">
                          {sample.sampleAnalyses?.length || 0} analiz
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lab Detail Modal */}
      {isLabModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Laboratuvar Durumu</h2>
              <button
                onClick={() => setIsLabModalOpen(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
              >
                Kapat
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">Analiz Durumu</p>
                <p className="font-semibold text-emerald-400">Laboratuvarda İşleniyor</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">Tahmini Teslim Tarihi</p>
                <p className="font-semibold">5-7 İş Günü</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">Sorumlu Teknisyen</p>
                <p className="font-semibold">Laboratuvar Ekibi</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
