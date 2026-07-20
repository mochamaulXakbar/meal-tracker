import { useState, useEffect  } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { api } from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';

const kategoriPopuler = ['Sarapan', 'Nasi & Lauk', 'Sayuran', 'Protein', 'Buah-buahan', 'Minuman', 'Mie & Pasta'];

export default function CariMakananPage() {
  const [kataKunci, setKataKunci] = useState('');
  const [hasil, setHasil] = useState([]);
  const [memuat, setMemuat] = useState(false);
  const [error, setError] = useState('');
  const [modalMakanan, setModalMakanan] = useState(null);
  const [jenisMakan, setJenisMakan] = useState('sarapan');
    const [jumlahGram, setJumlahGram] = useState(100);
  const [pesanSukses, setPesanSukses] = useState('');
  

  async function cari(kata) {
    if (!kata.trim()) return;
    setMemuat(true);
    setError('');
    try {
      const res = await api.get(`/makanan/cari?q=${encodeURIComponent(kata)}`);
      setHasil(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setMemuat(false);
    }
  }
useEffect(() => {
    cari('Nasi & Lauk');
  }, []);


  function handleSubmit(e) {
    e.preventDefault();
    cari(kataKunci);
  }

  function klikKategori(kategori) {
    setKataKunci(kategori);
    cari(kategori);
  }

  async function tambahKeRiwayat() {
    if (!modalMakanan) return;
    const faktor = jumlahGram / 100;
    try {
      await api.post('/riwayat', {
        nama_makanan: `${modalMakanan.nama} (${jumlahGram}g)`,
        kalori: Math.round(modalMakanan.kalori * faktor),
        protein_g: +(modalMakanan.protein * faktor).toFixed(1),
        karbohidrat_g: +(modalMakanan.karbohidrat * faktor).toFixed(1),
        lemak_g: +(modalMakanan.lemak * faktor).toFixed(1),
        jenis_makan: jenisMakan,
      });
      setPesanSukses(`${modalMakanan.nama} ditambahkan ke riwayat.`);
      setModalMakanan(null);
      setTimeout(() => setPesanSukses(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Cari Makanan</h1>
      <p className="text-gray-500 mt-1 mb-6">Cari dan tambahkan makanan ke riwayat konsumsi Anda</p>

      <form onSubmit={handleSubmit} className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full h-12 rounded-xl border border-gray-300 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Cari makanan... (contoh: nasi goreng, ayam bakar)"
          value={kataKunci}
          onChange={(e) => setKataKunci(e.target.value)}
        />
      </form>

      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 tracking-wide mb-3">KATEGORI POPULER</p>
        <div className="flex flex-wrap gap-2">
          {kategoriPopuler.map((k) => (
            <button
              key={k}
              onClick={() => klikKategori(k)}
              className="text-sm px-3 py-1.5 rounded-full border border-gray-300 hover:border-primary hover:text-primary transition"
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {pesanSukses && (
        <div className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3 mb-6">{pesanSukses}</div>
      )}
      {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>}

      {memuat ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : hasil.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {hasil.map((m) => (
            <Card key={m.id_makanan} className="flex flex-col sm:flex-row sm:items-center gap-4 overflow-hidden">
  {m.gambar ? (
    <img src={m.gambar} alt={m.nama} className="w-14 h-14 rounded-xl object-cover shrink-0" />
  ) : (
    <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0" />
  )}
  <div className="flex-1 min-w-0">
    <p className="font-medium text-gray-900 truncate">{m.nama}</p>
    <div className="flex gap-2 mt-1 flex-wrap">
      <span className="text-xs bg-amber-100 text-amber-800 rounded-lg px-2 py-0.5">Kal: {m.kalori}</span>
      <span className="text-xs bg-blue-100 text-blue-800 rounded-lg px-2 py-0.5">P: {m.protein}g</span>
      <span className="text-xs bg-green-100 text-green-800 rounded-lg px-2 py-0.5">K: {m.karbohidrat}g</span>
      <span className="text-xs bg-pink-100 text-pink-800 rounded-lg px-2 py-0.5">L: {m.lemak}g</span>
    </div>
  </div>
  <Button
    className="h-9 px-3 text-xs shrink-0 w-full sm:w-auto justify-center"
    onClick={() => { setModalMakanan(m); setJumlahGram(100); }}
  >
    <Plus size={14} /> Tambah
  </Button>
</Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Cari makanan favorit Anda</p>
          <p className="text-sm text-gray-400">Ketik nama makanan di atas untuk memulai pencarian</p>
        </div>
      )}

      {modalMakanan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tambah ke Riwayat</h3>
              <button onClick={() => setModalMakanan(null)}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-1">{modalMakanan.nama}</p>
            <p className="text-xs text-gray-400 mb-4">Nilai gizi per 100 gram: {modalMakanan.kalori} kkal</p>

            <label className="text-sm font-medium text-gray-700 block mb-1">Jumlah (gram)</label>
            <input
              type="number"
              min="1"
              step="10"
              value={jumlahGram}
              onChange={(e) => setJumlahGram(Number(e.target.value) || 0)}
              className="w-full h-11 rounded-xl border border-gray-300 px-4 mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="text-xs bg-amber-100 text-amber-800 rounded-lg px-2 py-0.5">
                Kal: {Math.round(modalMakanan.kalori * (jumlahGram / 100))}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 rounded-lg px-2 py-0.5">
                P: {(modalMakanan.protein * (jumlahGram / 100)).toFixed(1)}g
              </span>
              <span className="text-xs bg-green-100 text-green-800 rounded-lg px-2 py-0.5">
                K: {(modalMakanan.karbohidrat * (jumlahGram / 100)).toFixed(1)}g
              </span>
              <span className="text-xs bg-pink-100 text-pink-800 rounded-lg px-2 py-0.5">
                L: {(modalMakanan.lemak * (jumlahGram / 100)).toFixed(1)}g
              </span>
            </div>

            <Select label="Jenis Makan" value={jenisMakan} onChange={(e) => setJenisMakan(e.target.value)}>
              <option value="sarapan">Sarapan</option>
              <option value="siang">Makan Siang</option>
              <option value="malam">Makan Malam</option>
              <option value="camilan">Camilan</option>
            </Select>
            <Button onClick={tambahKeRiwayat} className="w-full mt-4">Simpan ke Riwayat</Button>
          </div>
        </div>
      )}
    </div>
  );
}
