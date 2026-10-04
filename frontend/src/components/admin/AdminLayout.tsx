import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Admin Dashboard', icon: '📊', path: '/admin/dashboard' },
    { label: 'Tüm Kullanıcılar', icon: '👥', path: '/admin/users' },
    { label: 'Tüm Analiz Talepleri', icon: '📋', path: '/admin/requests' },
    { label: 'Sistem Ayarları', icon: '⚙️', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Admin Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-700 bg-slate-800">
          <h1 className="text-xl font-bold text-red-500">Admin Panel</h1>
          <p className="text-sm text-slate-400 mt-1">BumLab LIMS</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors text-left mb-2"
          >
            <span className="text-xl">🏠</span>
            <span className="font-medium">Kullanıcı Paneli</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors text-left"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Çıkış</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">version 2.0.1</p>
        </div>
      </div>

      {/* Admin Topbar */}
      <div className="fixed left-64 right-0 top-0 h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-8 shadow-md">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">Yönetici Paneli</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.adSoyad?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.adSoyad || 'Admin'}</p>
              <p className="text-xs text-red-400">Yönetici</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 pt-16 p-8">
        {children}
      </div>
    </div>
  );
};
