import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, X, ImagePlus } from 'lucide-react';
import { api } from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';

const kosong = { id: null, judul: '', kategori: 'tips', konten: '', url_sumber: '', url_gambar: '' };

export default function KelolaArtikelPage() {
  const [artikel, setArtikel] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [form, setForm] = useState(kosong);
  const [mengupload, setMengupload] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const fileRef = useRef(null);

  async function muat() {
    setMemuat(true);
    try {
      const res = await api.get('/artikel');
      setArtikel(res.data);
    } finally {
      setMemuat(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  function bukaTambah() {
    setForm(kosong);
    setModalTerbuka(true);
  }

  function bukaEdit(a) {
    setForm(a);
    setModalTerbuka(true);
  }

  async function handleUploadGambar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMengupload(true);
    try {
      const fd = new FormData();
      fd.append('gambar', file);
      const res = await api.post('/artikel/upload-gambar', fd);
      setForm((f) => ({ ...f, url_gambar: res.data.url }));
    } finally {
      setMengupload(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMenyimpan(true);
    try {
      if (form.id) {
        await api.put(`/artikel/${form.id}`, form);
      } else {
        await api.post('/artikel', form);
      }
      setModalTerbuka(false);
      muat();
    } finally {
      setMenyimpan(false);
    }
  }

  async function hapus(id) {
    await api.delete(`/artikel/${id}`);
    muat();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
          <p className="text-gray-500 text-sm mt-1">{artikel.length} artikel tersimpan</p>
        </div>
        <Button onClick={bukaTambah}>
          <Plus size={16} /> Artikel Baru
        </Button>
      </div>

      <Card className="!p-0">
        {memuat ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Judul</th>
                <th className="px-5 py-3 font-medium">Kategori</th>
                <th className="px-5 py-3 font-medium">Tanggal</th>
                <th className="px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {artikel.map((a) => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {a.url_gambar && <img src={a.url_gambar} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-medium text-gray-900">{a.judul}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{a.kategori}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(a.dibuat_pada).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => bukaEdit(a)} className="text-gray-400 hover:text-gray-700">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => hapus(a.id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modalTerbuka && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{form.id ? 'Edit Artikel' : 'Artikel Baru'}</h3>
              <button onClick={() => setModalTerbuka(false)}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Judul"
                value={form.judul}
                onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
                required
              />
              <Select
                label="Kategori"
                value={form.kategori}
                onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))}
              >
                <option value="tips">Tips</option>
                <option value="kesehatan">Kesehatan</option>
                <option value="resep">Resep</option>
              </Select>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Gambar</label>
                {form.url_gambar && (
                  <img src={form.url_gambar} alt="" className="w-full aspect-video object-cover rounded-xl mb-1" />
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadGambar}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileRef.current?.click()}
                  disabled={mengupload}
                >
                  <ImagePlus size={16} /> {mengupload ? 'Mengupload...' : form.url_gambar ? 'Ganti Gambar' : 'Pilih Gambar'}
                </Button>
              </div>

              <Input
                label="URL Sumber (opsional)"
                value={form.url_sumber || ''}
                onChange={(e) => setForm((f) => ({ ...f, url_sumber: e.target.value }))}
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Konten</label>
                <textarea
                  className="rounded-xl border border-gray-300 px-4 py-3 text-sm min-h-32 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.konten}
                  onChange={(e) => setForm((f) => ({ ...f, konten: e.target.value }))}
                  required
                />
              </div>

              <Button type="submit" disabled={menyimpan} className="w-full mt-2">
                {menyimpan ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
