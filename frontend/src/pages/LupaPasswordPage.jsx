import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [terkirim, setTerkirim] = useState(false);
  const [memuat, setMemuat] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMemuat(true);
    try {
      await api.post('/auth/lupa-password', { email });
      setTerkirim(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-light/40 p-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <Link to="/login" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft size={16} /> Kembali ke login
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center">
            <Leaf size={16} className="text-primary" />
          </div>
          <span className="font-semibold text-gray-900">NutriTrack</span>
        </div>

        {terkirim ? (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cek email kamu</h2>
            <p className="text-sm text-gray-500">
              Kalau <span className="font-medium text-gray-700">{email}</span> terdaftar, kami sudah kirim link
              reset password ke email tersebut. Cek juga folder spam kalau belum muncul dalam beberapa menit.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Lupa Password?</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Masukkan email akunmu, kami kirim link buat bikin password baru.
            </p>

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

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={memuat} className="w-full mt-2">
                {memuat ? 'Mengirim...' : 'Kirim Link Reset'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
