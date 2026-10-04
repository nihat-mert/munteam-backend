import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';

export const Dashboard = () => {
  const navigate = useNavigate();
  const quickActions = [
    { title: 'Yeni Analiz Talebi', icon: '📝', color: 'bg-green-600', path: '/analysis/new' },
    { title: 'Mevcut Analiz Taleplerim', icon: '📋', color: 'bg-orange-600', path: '/analysis/my' },
    { title: 'Bütçe', icon: '💰', color: 'bg-blue-600', path: '/butce' },
    { title: 'Bilgilerim & Şifre', icon: '👤', color: 'bg-red-600', path: '/profile' },
    { title: 'Memnuniyet Anketi', icon: '⭐', color: 'bg-blue-600', path: '/survey' },
  ];

  const pastRequests = [
    { id: 1, teklifNo: 'TKL-2024-001', tarih: '02.10.2024', adSoyad: 'Ahmet Yılmaz', numuneKodu: 'N-001', analiz: 'SEM Analizi', durum: 'Tamamlandı' },
    { id: 2, teklifNo: 'TKL-2024-002', tarih: '01.10.2024', adSoyad: 'Ayşe Demir', numuneKodu: 'N-002', analiz: 'XRD Analizi', durum: 'Devam Ediyor' },
    { id: 3, teklifNo: 'TKL-2024-003', tarih: '28.09.2024', adSoyad: 'Mehmet Kaya', numuneKodu: 'N-003', analiz: 'ICP-MS', durum: 'Tamamlandı' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <Topbar />
      
      <div className="ml-64 pt-16 p-8">
        <h1 className="text-3xl font-bold mb-8">Ana Sayfa</h1>
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`${action.color} hover:opacity-90 transition-opacity rounded-xl p-6 flex flex-col items-center justify-center gap-4 shadow-lg`}
            >
              <span className="text-5xl">{action.icon}</span>
              <span className="text-lg font-semibold">{action.title}</span>
            </button>
          ))}
        </div>

        {/* Past Requests Table */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Geçmiş Analiz Taleplerim ve Analiz Sonuçlarım</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Teklif No</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Tarih</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Adı Soyadı</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Numune Kodu</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Analiz</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Durum</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Bilgiler</th>
                </tr>
              </thead>
              <tbody>
                {pastRequests.map((request) => (
                  <tr key={request.id} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                    <td className="py-3 px-4">{request.id}</td>
                    <td className="py-3 px-4">{request.teklifNo}</td>
                    <td className="py-3 px-4">{request.tarih}</td>
                    <td className="py-3 px-4">{request.adSoyad}</td>
                    <td className="py-3 px-4">{request.numuneKodu}</td>
                    <td className="py-3 px-4">{request.analiz}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.durum === 'Tamamlandı'
                            ? 'bg-green-600'
                            : request.durum === 'Devam Ediyor'
                            ? 'bg-yellow-600'
                            : 'bg-slate-600'
                        }`}
                      >
                        {request.durum}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-accent-500 hover:text-accent-400 font-medium">
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
