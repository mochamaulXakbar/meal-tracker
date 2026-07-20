import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Leaf, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const menu = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Cari Makanan', to: '/cari-makanan' },
  { label: 'Riwayat', to: '/riwayat' },
  { label: 'Meal Planner', to: '/meal-planner' },
  { label: 'Diet Buddy', to: '/diet-buddy' },
  { label: 'Artikel', to: '/artikel' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [dropdownTerbuka, setDropdownTerbuka] = useState(false);
  const [menuMobileTerbuka, setMenuMobileTerbuka] = useState(false);
  const navigate = useNavigate();

  const inisial = (user?.nama_lengkap || user?.nama_pengguna || '?').charAt(0).toUpperCase();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function tutupMenuMobile() {
    setMenuMobileTerbuka(false);
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => setMenuMobileTerbuka((v) => !v)}
              className="md:hidden -ml-1 p-1.5 text-gray-600 hover:text-gray-900"
            >
              {menuMobileTerbuka ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
          <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center">
            <Leaf size={16} className="text-primary" />
          </div>
          <span className="font-semibold text-gray-900">NutriTrack</span>
        </div>

        {user ? (
          <nav className="hidden md:flex items-center gap-6">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm pb-1 border-b-2 transition ${
                    isActive
                      ? 'text-primary border-primary font-medium'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin/artikel"
                className="text-xs font-medium bg-amber-100 text-amber-800 rounded-lg px-2.5 py-1"
              >
                Admin Panel
              </NavLink>
            )}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/artikel"
              className={({ isActive }) =>
                `text-sm pb-1 border-b-2 transition ${
                  isActive ? 'text-primary border-primary font-medium' : 'text-gray-600 border-transparent'
                }`
              }
            >
              Artikel
            </NavLink>
          </nav>
        )}

        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownTerbuka((v) => !v)}
              className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-medium text-sm"
            >
              {inisial}
            </button>
            {dropdownTerbuka && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownTerbuka(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-md z-20 py-2">
                  <div className="px-4 py-2 text-sm text-gray-500 truncate">{user?.email}</div>
                  <div className="border-t border-gray-100 my-1" />
                  <Link
                    to="/profil"
                    onClick={() => setDropdownTerbuka(false)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={15} /> Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                  >
                    <LogOut size={15} /> Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700">Masuk</Link>
            <Link to="/register">
              <Button className="h-9 px-3 text-sm">Daftar Gratis</Button>
            </Link>
          </div>
        )}
      </div>

      {user && menuMobileTerbuka && (
        <nav className="md:hidden border-t border-gray-100 px-4 py-2 flex flex-col">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={tutupMenuMobile}
              className={({ isActive }) =>
                `text-sm px-2 py-2.5 rounded-lg transition ${
                  isActive ? 'text-primary bg-primary-light font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin/artikel"
              onClick={tutupMenuMobile}
              className="text-sm px-2 py-2.5 rounded-lg text-amber-800 bg-amber-50 font-medium mt-1"
            >
              Admin Panel
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}