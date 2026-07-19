import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLoadingPage from '../components/ui/AuthLoadingPage';
import salad from '../assets/salad.jpg';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [error, setError] = useState('');
  const [memuat, setMemuat] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== konfirmasi) {
      setError('Konfirmasi password tidak sama.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setMemuat(true);
    try {
      const nama_pengguna = email.split('@')[0];
      await register(email, password, nama_pengguna);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setMemuat(false);
    }
  }

  if (memuat) {
    return <AuthLoadingPage title="Membuat akun..." />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-[55%] bg-primary text-white p-10 flex flex-col justify-center relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${salad})` }}
        />
        <div className="absolute inset-0 bg-black/45" />
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-white/90 hover:text-white">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
        <div className="relative z-10 max-w-md mx-auto slide-top">
          <div className="flex items-center gap-2 mb-8">
            <Leaf size={20} />
            <span className="font-semibold">NutriTrack</span>
          </div>
          <h1 className="font-indonesia text-4xl font-bold leading-[1.75] mb-6">
            Mulai Perjalanan Sehat Anda
          </h1>
          <p className="text-white/80">
            Bergabunglah dan mulai tracking nutrisimu hari ini juga.
          </p>
        </div>
      </div>

      <div className="lg:w-[45%] flex items-center justify-center bg-primary-light/40 p-8">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Buat Akun Baru</h2>
          <p className="text-gray-500 mb-6">Daftar gratis dan mulai tracking nutrisimu</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="nama@email.com"
                className="pl-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                className="pl-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                placeholder="Ulangi password"
                className="pl-11"
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={memuat} className="w-full mt-2">
              {memuat ? 'Memproses...' : 'Daftar Sekarang'}
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
