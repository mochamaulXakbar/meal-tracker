import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';
import logoIcon from '../assets/logo-icon.png';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2 mb-10">
        <img src={logoIcon} alt="Meal Tracker" className="w-7 h-7" />
        <span className="font-semibold text-gray-900">Meal Tracker</span>
      </div>

      <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-6">
        <Compass size={28} className="text-primary" />
      </div>

      <p className="text-6xl font-bold text-gray-900 mb-2">404</p>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Halaman tidak ditemukan</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        Halaman yang kamu cari mungkin sudah dipindahkan, dihapus, atau alamatnya salah ketik.
      </p>

      <div className="flex gap-3">
        <Link to="/">
          <Button variant="secondary">Ke Beranda</Button>
        </Link>
        <Link to="/dashboard">
          <Button>Ke Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
