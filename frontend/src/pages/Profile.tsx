import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'password'>('personal');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Şifre en az 8 karakter olmalı');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement password change API call
      toast.success('Şifre başarıyla değiştirildi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Şifre değiştirme başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <Topbar />
      
      <div className="ml-64 pt-16 p-8">
        <h1 className="text-4xl font-bold mb-8">Profilim</h1>

        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'personal'
                  ? 'bg-accent-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Kişisel Bilgiler
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'password'
                  ? 'bg-accent-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Şifre Güncelleme
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-slate-800 rounded-xl p-6">
            {activeTab === 'personal' ? (
              <div>
                <h2 className="text-2xl font-bold mb-6">Kişisel Bilgiler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-400">E-posta</label>
                    <p className="text-lg">{user?.email || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-400">Ad Soyad</label>
                    <p className="text-lg">{user?.adSoyad || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-400">Rol</label>
                    <p className="text-lg">
                      {user?.role === 'ADMIN' ? 'Yönetici' : user?.role === 'CUSTOMER' ? 'Müşteri' : 'Personel'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-6">Şifre Güncelleme</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mevcut Şifre</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                      placeholder="Mevcut şifreniz"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Yeni Şifre</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                      placeholder="Yeni şifreniz"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Yeni Şifre Tekrar</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                      placeholder="Yeni şifrenizi tekrar girin"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg font-semibold transition-colors"
                  >
                    {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
