import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Topbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="fixed left-64 right-0 top-0 h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-8 shadow-md">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-white">
          Hoş Geldiniz, {user?.adSoyad || user?.email || 'Kullanıcı'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 hover:bg-slate-800 rounded-lg p-2 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 bg-accent-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.adSoyad?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user?.adSoyad || 'Kullanıcı'}</p>
            <p className="text-xs text-slate-400">{user?.role === 'ADMIN' ? 'Yönetici' : user?.role === 'CUSTOMER' ? 'Müşteri' : 'Personel'}</p>
          </div>
        </button>
      </div>
    </div>
  );
};
