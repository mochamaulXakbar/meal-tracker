import { useEffect, useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const labelWaktu = { sarapan: 'Sarapan', makan_siang: 'Makan Siang', makan_malam: 'Makan Malam' };

function KartuMenu({ waktu, menu }) {
  return (
    <Card>
      <p className="text-xs font-semibold text-gray-400 tracking-wide mb-1">{labelWaktu[waktu].toUpperCase()}</p>
      <p className="text-sm font-medium text-primary mb-2">{menu.kalori} kkal</p>
      <p className="font-semibold text-gray-900 mb-2">{menu.nama}</p>
      <p className="text-sm text-gray-500 line-clamp-3">{menu.deskripsi}</p>
    </Card>
  );
}

export default function MealPlannerPage() {
  const [pantangan, setPantangan] = useState('');
  const [menuTerbaru, setMenuTerbaru] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [memuatGenerate, setMemuatGenerate] = useState(false);
  const [memuatRiwayat, setMemuatRiwayat] = useState(true);
  const [error, setError] = useState('');
  const [riwayatTerbuka, setRiwayatTerbuka] = useState(null);

  async function muatRiwayat() {
    setMemuatRiwayat(true);
    try {
      const res = await api.get('/meal-plan/riwayat');
      setRiwayat(res.data);
    } finally {
      setMemuatRiwayat(false);
    }
  }

  useEffect(() => {
    muatRiwayat();
  }, []);

  async function generate() {
    setMemuatGenerate(true);
    setError('');
    try {
      const res = await api.post('/meal-plan/generate', pantangan ? { pantangan } : {});
      setMenuTerbaru(res.data);
      muatRiwayat();
    } catch (err) {
      setError(err.message);
    } finally {
      setMemuatGenerate(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Meal Planner</h1>
          <p className="text-gray-500 mt-1">Biarkan AI merancang menu harian sesuai kebutuhan kalorimu</p>
        </div>
        <Button onClick={generate} disabled={memuatGenerate}>
          <Sparkles size={16} /> {memuatGenerate ? 'Meracik menu...' : 'Generate Menu'}
        </Button>
      </div>

      <div className="max-w-md mb-8">
        <input
          className="w-full h-11 rounded-xl border border-gray-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Ada alergi atau pantangan makanan? (opsional)"
          value={pantangan}
          onChange={(e) => setPantangan(e.target.value)}
        />
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>}

      {memuatGenerate ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner />
          <p className="text-sm text-gray-500">AI sedang meracik menu, tunggu sebentar...</p>
        </div>
      ) : menuTerbaru ? (
        <div className="mb-10">
          <p className="text-sm text-gray-500 mb-4">
            Target: <span className="font-medium text-gray-900">{menuTerbaru.total_target_kalori} kkal/hari</span>
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <KartuMenu waktu="sarapan" menu={menuTerbaru.menu.sarapan} />
            <KartuMenu waktu="makan_siang" menu={menuTerbaru.menu.makan_siang} />
            <KartuMenu waktu="makan_malam" menu={menuTerbaru.menu.makan_malam} />
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center text-center py-12 mb-10">
          <Sparkles size={28} className="text-gray-300 mb-3" />
          <p className="font-medium text-gray-900">Belum ada meal plan</p>
          <p className="text-sm text-gray-400">Klik "Generate Plan" untuk membuat menu diet yang dipersonalisasi</p>
        </Card>
      )}

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Riwayat Menu Sebelumnya</h3>
        {memuatRiwayat ? (
          <Spinner />
        ) : riwayat.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada riwayat menu.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {riwayat.map((r, i) => (
              <Card key={r.id} className="!p-0">
                <button
                  onClick={() => setRiwayatTerbuka(riwayatTerbuka === r.id ? null : r.id)}
                  className="w-full flex items-center justify-between px-5 py-3"
                >
                  <span className="text-sm font-medium text-gray-900">
                    Plan #{riwayat.length - i} — {new Date(r.dibuat_pada).toLocaleDateString('id-ID')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{r.total_kalori} kkal</span>
                    <ChevronDown size={16} className={`text-gray-400 transition ${riwayatTerbuka === r.id ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {riwayatTerbuka === r.id && (
                  <div className="px-5 pb-4 grid md:grid-cols-3 gap-3 border-t border-gray-100 pt-3">
                    {['sarapan', 'makan_siang', 'makan_malam'].map((w) => (
                      <div key={w}>
                        <p className="text-xs text-gray-400">{labelWaktu[w]}</p>
                        <p className="text-sm font-medium text-gray-900">{r.menu[w]?.nama}</p>
                        <p className="text-xs text-gray-400">{r.menu[w]?.kalori} kkal</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
