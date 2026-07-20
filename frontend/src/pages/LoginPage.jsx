import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthLoadingPage from '../components/ui/AuthLoadingPage';
import salad from '../assets/salad.jpg';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [memuat, setMemuat] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMemuat(true);
    try {
      const data = await login(email, password);
      if (data.peran === 'admin') {
        navigate('/admin/panel');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setMemuat(false);
    }
  }

  if (memuat) {
    return <AuthLoadingPage title="Masuk ke dashboard..." />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-[55%] text-white p-10 pt-20 lg:pt-10 flex flex-col justify-center relative bg-cover bg-center">
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
            Hidup Sehat, Dimulai dari Piring
          </h1>
          <p className="text-white/80">
            Lacak nutrisi, rencanakan diet, dan capai tujuan kesehatanmu bersama NutriTrack.
          </p>
        </div>
      </div>

      <div className="lg:w-[45%] flex items-center justify-center bg-primary-light/40 p-8">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Selamat Datang Kembali</h2>
          <p className="text-gray-500 mb-6">Masuk ke akun NutriTrack Anda</p>

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
                placeholder="Password"
                className="pl-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={memuat} className="w-full mt-2">
              {memuat ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary font-medium">
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
