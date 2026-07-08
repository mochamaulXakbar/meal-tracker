import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, Flame, Calendar, Search, Sparkles, MessageCircle, Plus, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

const badgeKategori = {
  Kurus: 'bg-blue-100 text-blue-700',
  Normal: 'bg-green-100 text-green-700',
  Gemuk: 'bg-amber-100 text-amber-700',
  Obesitas: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [kalkulasi, setKalkulasi] = useState(null);
  const [profilBelumLengkap, setProfilBelumLengkap] = useState(false);
  const [grafikBerat, setGrafikBerat] = useState([]);
  const [riwayatHariIni, setRiwayatHariIni] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [modalBeratTerbuka, setModalBeratTerbuka] = useState(false);
  const [beratBaru, setBeratBaru] = useState('');

  async function muatData() {
    setMemuat(true);
    try {
      const [resKalkulasi, resGrafik, resRiwayat] = await Promise.allSettled([
        api.get('/pengguna/kalkulasi'),
        api.get('/berat/grafik'),
        api.get(`/riwayat?tanggal=${new Date().toISOString().split('T')[0]}`),
      ]);

      if (resKalkulasi.status === 'fulfilled') {
        setKalkulasi(resKalkulasi.value.data);
        setProfilBelumLengkap(false);
      } else {
        setProfilBelumLengkap(true);
      }

      if (resGrafik.status === 'fulfilled') {
        setGrafikBerat(resGrafik.value.data);
      }
      if (resRiwayat.status === 'fulfilled') {
        setRiwayatHariIni(resRiwayat.value.data.slice(0, 4));
      }
    } finally {
      setMemuat(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  async function handleCatatBerat(e) {
    e.preventDefault();
    if (!beratBaru) return;
    await api.post('/berat', { berat_kg: parseFloat(beratBaru) });
    setBeratBaru('');
    setModalBeratTerbuka(false);
    muatData();
  }

  const totalKaloriHariIni = riwayatHariIni.reduce((sum, r) => sum + Number(r.kalori || 0), 0);

  if (memuat) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-500 mt-1 mb-8">Ringkasan aktivitas dan progres kesehatanmu</p>

      {profilBelumLengkap ? (
        <Card className="flex flex-col items-center text-center py-12 mb-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <User size={22} className="text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Lengkapi Profil Anda</h3>
          <p className="text-gray-500 text-sm mb-4">
            Isi data profil untuk mendapatkan rekomendasi kalori dan nutrisi yang tepat.
          </p>
          <Link to="/profil">
            <Button>Lengkapi Profil</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Scale size={16} /> BMI
            </div>
            <div className="text-2xl font-bold text-gray-900">{kalkulasi.bmi}</div>
            <span className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-lg ${badgeKategori[kalkulasi.kategori_bmi] || 'bg-gray-100 text-gray-700'}`}>
              {kalkulasi.kategori_bmi}
            </span>
          </Card>
          <Card>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Flame size={16} /> TDEE
            </div>
            <div className="text-2xl font-bold text-gray-900">{kalkulasi.tdee.toLocaleString()}</div>
            <span className="text-xs text-gray-400">kkal/hari</span>
          </Card>
          <Card>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Calendar size={16} /> Kalori Hari Ini
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalKaloriHariIni.toLocaleString()}</div>
            <span className="text-xs text-gray-400">dari target {kalkulasi.tdee.toLocaleString()} kkal</span>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-[65%_35%] gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Progres Berat Badan</h3>
            <Button variant="secondary" onClick={() => setModalBeratTerbuka(true)} className="h-9 px-3 text-xs">
              <Plus size={14} /> Catat Berat
            </Button>
          </div>
          {grafikBerat.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={grafikBerat}>
                <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Line type="monotone" dataKey="berat_kg" stroke="#2a7a3b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-16 text-center">Belum ada data berat badan.</p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Makan Hari Ini</h3>
          {riwayatHariIni.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {riwayatHariIni.map((r) => (
                <li key={r.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{r.nama_makanan}</span>
                  <span className="text-gray-400">{r.kalori} kkal</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 mb-3">Belum ada makanan dicatat hari ini.</p>
              <Link to="/cari-makanan">
                <Button variant="secondary" className="text-xs h-9 px-3">Cari Makanan</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/cari-makanan">
          <Card className="flex flex-col items-center text-center py-6 hover:border-primary transition">
            <Search size={20} className="text-primary mb-2" />
            <span className="font-medium text-gray-900 text-sm">Cari Makanan</span>
          </Card>
        </Link>
        <Link to="/meal-planner">
          <Card className="flex flex-col items-center text-center py-6 hover:border-primary transition">
            <Sparkles size={20} className="text-primary mb-2" />
            <span className="font-medium text-gray-900 text-sm">Generate Menu AI</span>
          </Card>
        </Link>
        <Link to="/diet-buddy">
          <Card className="flex flex-col items-center text-center py-6 hover:border-primary transition">
            <MessageCircle size={20} className="text-primary mb-2" />
            <span className="font-medium text-gray-900 text-sm">Chat Diet Buddy</span>
          </Card>
        </Link>
      </div>

      {modalBeratTerbuka && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Catat Berat Badan</h3>
              <button onClick={() => setModalBeratTerbuka(false)}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCatatBerat} className="flex flex-col gap-4">
              <Input
                type="number"
                step="0.1"
                label="Berat (kg)"
                value={beratBaru}
                onChange={(e) => setBeratBaru(e.target.value)}
                autoFocus
                required
              />
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
