import { NavLink, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { Leaf, PenLine, BarChart3, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

export default function AdminLayout() {
  const { user, memuat, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (memuat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-[#123a1a] text-white flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <Leaf size={18} />
            <span className="font-semibold">NutriTrack</span>
          </div>
          <span className="text-xs font-medium text-amber-400 mt-1 block">ADMIN</span>
        </div>

        <nav className="flex-1 px-3 flex flex-col gap-1">
          <NavLink
            to="/admin/artikel"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                isActive ? 'bg-white/15 font-medium' : 'text-white/70 hover:bg-white/10'
              }`
            }
          >
            <PenLine size={16} /> Kelola Artikel
          </NavLink>
          <NavLink
            to="/admin/panel"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                isActive ? 'bg-white/15 font-medium' : 'text-white/70 hover:bg-white/10'
              }`
            }
          >
            <BarChart3 size={16} /> Panel Admin
          </NavLink>
        </nav>

        <div className="p-3 border-t border-white/10">
          <p className="text-xs text-white/50 px-3 mb-2">Masuk sebagai</p>
          <p className="text-sm px-3 mb-3 truncate">{user.email}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-xl"
          >
            <ArrowLeft size={16} /> Kembali ke App
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-white/10 rounded-xl"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
