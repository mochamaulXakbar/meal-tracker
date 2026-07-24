import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { api } from '../lib/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import logoIcon from '../assets/logo-icon.png';

function ambilTokenDariHash() {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [error, setError] = useState('');
  const [berhasil, setBerhasil] = useState(false);
  const [memuat, setMemuat] = useState(false);

  useEffect(() => {
    setToken(ambilTokenDariHash());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== konfirmasi) {
      setError('Konfirmasi password tidak cocok');
      return;
    }
    setMemuat(true);
    try {
      await api.post('/auth/reset-password', { access_token: token, password_baru: password });
      setBerhasil(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-light/40 p-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <img src={logoIcon} alt="Meal Tracker" className="w-7 h-7" />
          <span className="font-semibold text-gray-900">Meal Tracker</span>
        </div>

        {!token ? (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Link tidak valid</h2>
            <p className="text-sm text-gray-500 mb-4">
              Link reset password ini tidak valid atau sudah kedaluwarsa. Minta link baru dari halaman lupa password.
            </p>
            <Link to="/lupa-password">
              <Button className="w-full">Minta Link Baru</Button>
            </Link>
          </div>
        ) : berhasil ? (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Password berhasil diubah</h2>
            <p className="text-sm text-gray-500">Mengarahkan ke halaman login...</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Buat Password Baru</h2>
            <p className="text-gray-500 mb-6 text-sm">Minimal 6 karakter.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password baru"
                  className="pl-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Ulangi password baru"
                  className="pl-11"
                  value={konfirmasi}
                  onChange={(e) => setKonfirmasi(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={memuat} className="w-full mt-2">
                {memuat ? 'Menyimpan...' : 'Simpan Password Baru'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
