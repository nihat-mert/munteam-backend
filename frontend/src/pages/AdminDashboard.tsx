import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { api } from '../lib/axios';

interface User {
  id: string;
  email: string;
  adSoyad: string | null;
  role: string;
  createdAt: string;
}

interface Request {
  id: string;
  status: string;
  toplamTutar: number | null;
  createdAt: string;
  user: {
    email: string;
    adSoyad: string | null;
  };
}

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'users') {
        const response = await api.get('/admin/users');
        setUsers(Array.isArray(response?.data) ? response.data : []);
      } else {
        const response = await api.get('/admin/all-requests');
        setRequests(Array.isArray(response?.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Veriler yüklenirken bir hata oluştu.');
      if (activeTab === 'users') setUsers([]);
      else setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      await api.post('/admin/update-request-status', { requestId, status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Durum güncellenirken bir hata oluştu.');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const formatMoney = (amount: number | string | null) => {
    const value = Number(amount ?? 0);
    return `${value.toFixed(2)} TL`;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Paneli</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'users'
                ? 'bg-accent-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Kullanıcı Yönetimi
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'requests'
                ? 'bg-accent-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Tüm Talepler
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center">
            <p className="text-xl">Yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center">
            <p className="text-red-400 text-xl">{error}</p>
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-700">
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Ad Soyad</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">E-posta</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Rol</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 px-6 text-center text-slate-400">
                      Henüz kullanıcı yok.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/60 transition-colors">
                      <td className="py-4 px-6">{user.adSoyad || '-'}</td>
                      <td className="py-4 px-6">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user.role === 'ADMIN' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-700">
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Talep No</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Kullanıcı</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Tarih</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Tutar</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Durum</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center text-slate-400">
                      Henüz talep yok.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="border-b border-slate-700 hover:bg-slate-700/60 transition-colors">
                      <td className="py-4 px-6">{request.id.slice(0, 8).toUpperCase()}</td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium">{request.user.adSoyad || '-'}</p>
                          <p className="text-sm text-slate-400">{request.user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">{formatDate(request.createdAt)}</td>
                      <td className="py-4 px-6">{formatMoney(request.toplamTutar)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          request.status === 'ONAYLANDI' ? 'bg-green-600 text-white' :
                          request.status === 'ONAY_BEKLIYOR' ? 'bg-yellow-600 text-white' :
                          'bg-slate-600 text-white'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={request.status}
                          onChange={(e) => handleUpdateStatus(request.id, e.target.value)}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                        >
                          <option value="TASLAK">Taslak</option>
                          <option value="ONAY_BEKLIYOR">Onay Bekliyor</option>
                          <option value="ONAYLANDI">Onaylandı</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
