import { useEffect, useState } from 'react';
import { Sparkles, ChevronDown, Coffee, Sun, Moon, Trash2, X, ChefHat } from 'lucide-react';
import { api } from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const labelWaktu = { sarapan: 'Sarapan', makan_siang: 'Makan Siang', makan_malam: 'Makan Malam' };
const ikonWaktu = { sarapan: Coffee, makan_siang: Sun, makan_malam: Moon };

function KartuMenu({ waktu, menu }) {
  const Ikon = ikonWaktu[waktu];
  return (
    <Card>
      <div className="flex items-center gap-1.5 text-gray-400 mb-2">
        <Ikon size={14} />
        <p className="text-xs font-semibold tracking-wide">{labelWaktu[waktu].toUpperCase()}</p>
      </div>
      <p className="text-lg font-bold text-gray-900 leading-snug mb-1">{menu.nama}</p>
      <p className="text-sm font-medium text-primary mb-3">{menu.kalori} kkal</p>
      {menu.deskripsi && <p className="text-sm text-gray-500 leading-relaxed mb-4">{menu.deskripsi}</p>}

      {menu.bahan?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Bahan-bahan</p>
          <ul className="space-y-1">
            {menu.bahan.map((b, idx) => (
              <li key={idx} className="text-sm text-gray-600 flex gap-2">
                <span className="text-primary">•</span> {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {menu.langkah?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Cara Membuat</p>
          <ol className="space-y-1.5">
            {menu.langkah.map((l, idx) => (
              <li key={idx} className="text-sm text-gray-600 flex gap-2">
                <span className="font-semibold text-primary shrink-0">{idx + 1}.</span> {l}
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}

function ModalResep({ waktu, menu, onClose }) {
  const Ikon = ikonWaktu[waktu];
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Ikon size={14} />
            <p className="text-xs font-semibold tracking-wide">{labelWaktu[waktu].toUpperCase()}</p>
          </div>
          <button onClick={onClose}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <p className="text-lg font-bold text-gray-900 leading-snug mb-1">{menu?.nama}</p>
        <p className="text-sm font-medium text-primary mb-4">{menu?.kalori} kkal</p>
        {menu?.deskripsi && <p className="text-sm text-gray-500 leading-relaxed mb-4">{menu.deskripsi}</p>}

        {menu?.bahan?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Bahan-bahan</p>
            <ul className="space-y-1">
              {menu.bahan.map((b, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-primary">•</span> {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {menu?.langkah?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Cara Membuat</p>
            <ol className="space-y-1.5">
              {menu.langkah.map((l, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex gap-2">
                  <span className="font-semibold text-primary shrink-0">{idx + 1}.</span> {l}
                </li>
              ))}
            </ol>
          </div>
        )}

        {!menu?.bahan?.length && !menu?.langkah?.length && (
          <p className="text-xs text-gray-400 italic">Detail bahan & langkah tidak tersedia untuk menu lama ini.</p>
        )}
      </div>
    </div>
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
  const [resepDilihat, setResepDilihat] = useState(null); // { waktu, menu }

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

  async function hapusRiwayat(id) {
    try {
      await api.delete(`/meal-plan/riwayat/${id}`);
      setRiwayat((r) => r.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
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
              <Card key={r.id} className="!p-0 group">
                <div className="w-full flex items-center justify-between px-5 py-3">
                  <button
                    onClick={() => setRiwayatTerbuka(riwayatTerbuka === r.id ? null : r.id)}
                    className="flex-1 flex items-center justify-between text-left"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      Plan #{riwayat.length - i} — {new Date(r.dibuat_pada).toLocaleDateString('id-ID')}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">{r.total_kalori} kkal</span>
                      <ChevronDown size={16} className={`text-gray-400 transition ${riwayatTerbuka === r.id ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  <button
                    onClick={() => hapusRiwayat(r.id)}
                    className="ml-3 opacity-0 group-hover:opacity-100 transition text-gray-300 hover:text-red-600"
                    title="Hapus riwayat ini"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                {riwayatTerbuka === r.id && (
                  <div className="px-5 pb-4 grid md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                    {['sarapan', 'makan_siang', 'makan_malam'].map((w) => {
                      const Ikon = ikonWaktu[w];
                      return (
                        <div key={w}>
                          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <Ikon size={12} />
                            <p className="text-xs font-semibold tracking-wide">{labelWaktu[w].toUpperCase()}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 leading-snug">{r.menu[w]?.nama}</p>
                          <p className="text-xs font-medium text-primary mb-2">{r.menu[w]?.kalori} kkal</p>
                          <button
                            onClick={() => setResepDilihat({ waktu: w, menu: r.menu[w] })}
                            className="text-xs font-medium text-primary hover:text-primary-dark flex items-center gap-1"
                          >
                            <ChefHat size={12} /> Lihat Resep Detail
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {resepDilihat && (
        <ModalResep
          waktu={resepDilihat.waktu}
          menu={resepDilihat.menu}
          onClose={() => setResepDilihat(null)}
        />
      )}
    </div>
  );
}
