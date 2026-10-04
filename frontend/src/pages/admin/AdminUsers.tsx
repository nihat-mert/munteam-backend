import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  adSoyad: string | null;
  role: 'ADMIN' | 'CUSTOMER' | 'PERSONNEL';
  isActive: boolean;
  createdAt: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'CUSTOMER' | 'PERSONNEL'>('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.adSoyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<User[]>('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError('Kullanıcılar yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Rol başarıyla güncellendi');
      fetchUsers();
    } catch (err) {
      toast.error('Rol güncellenirken hata oluştu');
      console.error(err);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Hesap askıya alındı' : 'Hesap aktifleştirildi');
      fetchUsers();
    } catch (err) {
      toast.error('Durum güncellenirken hata oluştu');
      console.error(err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-600 text-white';
      case 'CUSTOMER':
        return 'bg-blue-600 text-white';
      case 'PERSONNEL':
        return 'bg-green-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Tüm Kullanıcılar</h1>
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
          <h1 className="text-4xl font-bold mb-8">Tüm Kullanıcılar</h1>
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-12 text-center">
            <div className="text-red-400 text-lg">{error}</div>
            <button
              onClick={fetchUsers}
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
        <h1 className="text-4xl font-bold mb-8">Tüm Kullanıcılar</h1>

        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="İsim veya E-posta ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
            >
              <option value="ALL">Tüm Rolleri</option>
              <option value="ADMIN">Adminler</option>
              <option value="CUSTOMER">Müşteriler</option>
              <option value="PERSONNEL">Personel</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Ad Soyad</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">E-posta</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Rol</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Kayıt Tarihi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Durum</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Kullanıcı bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-white">{user.adSoyad || '-'}</td>
                      <td className="px-6 py-4 text-white">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}
                        >
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm text-white focus:outline-none transition-colors"
                          >
                            <option value="CUSTOMER">Müşteri</option>
                            <option value="ADMIN">Admin</option>
                            <option value="PERSONNEL">Personel</option>
                          </select>
                          <button
                            onClick={() => handleStatusToggle(user.id, user.isActive)}
                            className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                              user.isActive
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {user.isActive ? 'Askıya Al' : 'Aktifleştir'}
                          </button>
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
          Toplam {filteredUsers.length} kullanıcı gösteriliyor
        </div>
      </div>
    </AdminLayout>
  );
};
