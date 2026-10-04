import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { label: 'Ana Sayfa', icon: '🏠', path: '/dashboard' },
    { label: 'Yeni Analiz Talebi', icon: '📝', path: '/analysis/new' },
    { label: 'Mevcut Analiz Taleplerim', icon: '📋', path: '/analysis/my' },
    { label: 'Bütçe', icon: '💰', path: '/butce' },
    { label: 'Ödemelerim', icon: '💳', path: '/payments' },
    { label: 'Cihaz Randevuları', icon: '📅', path: '/randevular' },
    { label: 'Memnuniyet Anketi', icon: '⭐', path: '/survey' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-800 text-white flex flex-col shadow-xl">
      <Link to="/dashboard" className="p-6 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors">
        <h1 className="text-xl font-bold text-accent-500">BumLab LIMS</h1>
        <p className="text-sm text-slate-400 mt-1">Laboratuvar Otomasyonu</p>
      </Link>

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
          <li className="pt-4 border-t border-slate-700 mt-4">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors text-left"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Çıkış</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">version 2.0.1</p>
      </div>
    </div>
  );
};
