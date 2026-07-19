import { useEffect, useState } from 'react';
import { Users, TrendingUp, Search, Trash2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

export default function PanelAdminPage() {
  const [statistik, setStatistik] = useState(null);
  const [pengguna, setPengguna] = useState([]);
  const [pencarian, setPencarian] = useState('');
  const [memuat, setMemuat] = useState(true);
   const [penggunaDihapus, setPenggunaDihapus] = useState(null);
  const [menghapus, setMenghapus] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/admin/statistik'), api.get('/admin/pengguna')])
      .then(([resStat, resPengguna]) => {
        setStatistik(resStat.data);
        setPengguna(resPengguna.data);
      })
      .finally(() => setMemuat(false));
  }, []);

  const penggunaTersaring = pengguna.filter(
    (p) =>
      p.nama_pengguna?.toLowerCase().includes(pencarian.toLowerCase()) ||
      p.email?.toLowerCase().includes(pencarian.toLowerCase())
  );
   async function hapusPengguna() {
    if (!penggunaDihapus) return;
    setMenghapus(true);
    try {
      await api.delete(`/admin/pengguna/${penggunaDihapus.id}`);
      setPengguna((prev) => prev.filter((p) => p.id !== penggunaDihapus.id));
      setPenggunaDihapus(null);
    } catch (err) {
      alert(err.message || 'Gagal menghapus pengguna.');
    } finally {
      setMenghapus(false);
    }
  }

  if (memuat) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel Admin</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{statistik.total_pengguna}</p>
            <p className="text-xs text-gray-400">Semua pengguna terdaftar</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{statistik.baru_7_hari_terakhir}</p>
            <p className="text-xs text-gray-400">Pendaftaran 7 hari terakhir</p>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Pertumbuhan Pengguna — 30 Hari</h3>
          <span className="text-xs text-gray-400">Pendaftaran per hari</span>
        </div>
        {statistik.pertumbuhan_harian.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statistik.pertumbuhan_harian}>
              <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#2a7a3b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-16">Belum ada data pendaftaran.</p>
        )}
      </Card>

      <Card className="!p-0">
        <div className="flex items-center justify-between p-5 pb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Daftar Pengguna</h3>
            <p className="text-xs text-gray-400">{penggunaTersaring.length} dari {pengguna.length} pengguna</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="h-9 rounded-lg border border-gray-300 pl-8 pr-3 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Cari nama / email..."
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
            />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-y border-gray-100">
              <th className="px-5 py-2 font-medium">Nama</th>
              <th className="px-5 py-2 font-medium">Email</th>
              <th className="px-5 py-2 font-medium">Peran</th>
              <th className="px-5 py-2 font-medium">Tanggal Daftar</th>
              <th className="px-5 py-2 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
             {penggunaTersaring.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{p.nama_lengkap || p.nama_pengguna}</td>
                <td className="px-5 py-3 text-gray-500">{p.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                      p.peran === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p.peran}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{new Date(p.dibuat_pada).toLocaleDateString('id-ID')}</td>
                <td className="px-5 py-3 text-right">
                  {p.peran !== 'admin' && (
                    <button
                      onClick={() => setPenggunaDihapus(p)}
                      className="text-gray-300 hover:text-red-600 transition"
                      title="Hapus pengguna"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
       {penggunaDihapus && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Hapus Pengguna</h3>
              <button onClick={() => setPenggunaDihapus(null)}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Yakin ingin menghapus <span className="font-medium text-gray-900">{penggunaDihapus.nama_lengkap || penggunaDihapus.nama_pengguna}</span> ({penggunaDihapus.email})? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPenggunaDihapus(null)}
                className="flex-1 h-10 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={hapusPengguna}
                disabled={menghapus}
                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {menghapus ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
