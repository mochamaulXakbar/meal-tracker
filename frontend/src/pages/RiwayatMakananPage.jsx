import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';

const labelJenis = { sarapan: 'Sarapan', siang: 'Makan Siang', malam: 'Makan Malam', camilan: 'Camilan' };
const urutanJenis = ['sarapan', 'siang', 'malam', 'camilan'];

const formKosong = {
  nama_makanan: '', kalori: '', protein_g: '', karbohidrat_g: '', lemak_g: '', jenis_makan: 'sarapan',
};

function ModalForm({ awal, tanggalDefault, onClose, onSukses }) {
  const { showError } = useToast();
  const [form, setForm] = useState(
    awal
      ? {
          nama_makanan: awal.nama_makanan,
          kalori: awal.kalori,
          protein_g: awal.protein_g,
          karbohidrat_g: awal.karbohidrat_g,
          lemak_g: awal.lemak_g,
          jenis_makan: awal.jenis_makan,
          tanggal_konsumsi: awal.tanggal_konsumsi,
        }
      : { ...formKosong, tanggal_konsumsi: tanggalDefault }
  );
  const [menyimpan, setMenyimpan] = useState(false);

  function ubah(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function simpan(e) {
    e.preventDefault();
    if (!form.nama_makanan.trim() || form.kalori === '') {
      showError('Nama makanan dan kalori wajib diisi');
      return;
    }
    setMenyimpan(true);
    const payload = {
      nama_makanan: form.nama_makanan.trim(),
      kalori: Number(form.kalori) || 0,
      protein_g: Number(form.protein_g) || 0,
      karbohidrat_g: Number(form.karbohidrat_g) || 0,
      lemak_g: Number(form.lemak_g) || 0,
      jenis_makan: form.jenis_makan,
      tanggal_konsumsi: form.tanggal_konsumsi,
    };
    try {
      if (awal) {
        await api.put(`/riwayat/${awal.id}`, payload);
      } else {
        await api.post('/riwayat', payload);
      }
      onSukses();
    } catch (err) {
      showError(err.message);
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{awal ? 'Edit Riwayat' : 'Tambah Makanan Manual'}</h3>
          <button onClick={onClose}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={simpan} className="flex flex-col gap-4">
          <Input
            label="Nama Makanan"
            placeholder="Contoh: Nasi goreng buatan rumah"
            value={form.nama_makanan}
            onChange={(e) => ubah('nama_makanan', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Kalori (kkal)"
              min="0"
              value={form.kalori}
              onChange={(e) => ubah('kalori', e.target.value)}
            />
            <Select
              label="Jenis Makan"
              value={form.jenis_makan}
              onChange={(e) => ubah('jenis_makan', e.target.value)}
            >
              {urutanJenis.map((j) => (
                <option key={j} value={j}>{labelJenis[j]}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              type="number" min="0" label="Protein (g)"
              value={form.protein_g}
              onChange={(e) => ubah('protein_g', e.target.value)}
            />
            <Input
              type="number" min="0" label="Karbo (g)"
              value={form.karbohidrat_g}
              onChange={(e) => ubah('karbohidrat_g', e.target.value)}
            />
            <Input
              type="number" min="0" label="Lemak (g)"
              value={form.lemak_g}
              onChange={(e) => ubah('lemak_g', e.target.value)}
            />
          </div>

          <Input
            type="date"
            label="Tanggal Konsumsi"
            value={form.tanggal_konsumsi}
            onChange={(e) => ubah('tanggal_konsumsi', e.target.value)}
          />

          <Button type="submit" disabled={menyimpan} className="w-full mt-1">
            {menyimpan ? 'Menyimpan...' : awal ? 'Simpan Perubahan' : 'Tambah ke Riwayat'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function RiwayatMakananPage() {
  const { showSuccess, showError } = useToast();
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState([]);
  const [totalKalori, setTotalKalori] = useState(0);
  const [memuat, setMemuat] = useState(true);
  const [modalEdit, setModalEdit] = useState(null); // item yang lagi diedit
  const [modalTambah, setModalTambah] = useState(false);

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
    try {
      await api.delete(`/riwayat/${id}`);
      showSuccess('Makanan berhasil dihapus dari riwayat.');
      muat();
    } catch (err) {
      showError(err.message);
    }
  }

  function tutupModalDanMuatUlang(pesan) {
    setModalEdit(null);
    setModalTambah(false);
    showSuccess(pesan);
    muat();
  }

  const dikelompokkan = urutanJenis
    .map((jenis) => ({ jenis, item: data.filter((d) => d.jenis_makan === jenis) }))
    .filter((g) => g.item.length > 0);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Makanan</h1>
          <p className="text-gray-500 mt-1">Catatan makanan yang sudah Anda konsumsi</p>
        </div>
        <Button onClick={() => setModalTambah(true)}>
          <Plus size={16} /> Tambah Manual
        </Button>
      </div>

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
                      <button onClick={() => setModalEdit(r)} className="text-gray-400 hover:text-gray-700">
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
          <div className="flex items-center justify-center gap-3">
            <Link to="/cari-makanan">
              <Button variant="secondary">Cari Makanan</Button>
            </Link>
            <Button onClick={() => setModalTambah(true)}>
              <Plus size={16} /> Tambah Manual
            </Button>
          </div>
        </div>
      )}

      {modalEdit && (
        <ModalForm
          awal={modalEdit}
          onClose={() => setModalEdit(null)}
          onSukses={() => tutupModalDanMuatUlang('Riwayat berhasil diperbarui.')}
        />
      )}
      {modalTambah && (
        <ModalForm
          tanggalDefault={tanggal}
          onClose={() => setModalTambah(false)}
          onSukses={() => tutupModalDanMuatUlang('Makanan berhasil ditambahkan.')}
        />
      )}
    </div>
  );
}
