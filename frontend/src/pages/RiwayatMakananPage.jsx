import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const labelJenis = { sarapan: 'Sarapan', siang: 'Makan Siang', malam: 'Makan Malam', camilan: 'Camilan' };
const urutanJenis = ['sarapan', 'siang', 'malam', 'camilan'];

export default function RiwayatMakananPage() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState([]);
  const [totalKalori, setTotalKalori] = useState(0);
  const [memuat, setMemuat] = useState(true);

  async function muat() {
    setMemuat(true);
    try {
      const res = await api.get(`/riwayat?tanggal=${tanggal}`);
      setData(res.data);
      setTotalKalori(res.total_kalori);
    } finally {
      setMemuat(false);
    }
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanggal]);

  async function hapus(id) {
    await api.delete(`/riwayat/${id}`);
    muat();
  }

  const dikelompokkan = urutanJenis
    .map((jenis) => ({ jenis, item: data.filter((d) => d.jenis_makan === jenis) }))
    .filter((g) => g.item.length > 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Riwayat Makanan</h1>
      <p className="text-gray-500 mt-1 mb-6">Catatan makanan yang sudah Anda konsumsi</p>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="h-11 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Card className="!py-2 !px-4">
          <span className="text-sm text-gray-500">Total Kalori: </span>
          <span className="font-semibold text-gray-900">{totalKalori} kkal</span>
        </Card>
      </div>

      {memuat ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : dikelompokkan.length > 0 ? (
        <div className="flex flex-col gap-6">
          {dikelompokkan.map((g) => (
            <div key={g.jenis}>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">{labelJenis[g.jenis]}</h3>
              <Card className="!p-0 divide-y divide-gray-100">
                {g.item.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{r.nama_makanan}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-gray-400">P: {r.protein_g}g</span>
                        <span className="text-xs text-gray-400">K: {r.karbohidrat_g}g</span>
                        <span className="text-xs text-gray-400">L: {r.lemak_g}g</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{r.kalori} kkal</span>
                      <button className="text-gray-400 hover:text-gray-700">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => hapus(r.id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Belum ada makanan dicatat pada tanggal ini.</p>
          <Link to="/cari-makanan">
            <Button variant="secondary">Cari Makanan</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
