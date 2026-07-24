import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

const opsiAktivitas = [
  { value: 'sedentary', label: 'Sangat jarang berolahraga' },
  { value: 'light', label: 'Jarang (1-3x/minggu)' },
  { value: 'moderate', label: 'Sedang (3-5x/minggu)' },
  { value: 'active', label: 'Aktif (6-7x/minggu)' },
  { value: 'very_active', label: 'Sangat aktif/atlet' },
];

function hitungEstimasiBmi(tinggi, berat) {
  const t = parseFloat(tinggi);
  const b = parseFloat(berat);
  if (!t || !b) return null;
  const tm = t / 100;
  return (b / (tm * tm)).toFixed(1);
}

export default function ProfilPage() {
  const { user, refreshProfil } = useAuth();
  const { showSuccess, showError } = useToast();
  const inputFotoRef = useRef(null);
  const [mengupload, setMengupload] = useState(false);
  const [form, setForm] = useState({
    nama_lengkap: user?.nama_lengkap || '',
    tanggal_lahir: user?.tanggal_lahir || '',
    jenis_kelamin: user?.jenis_kelamin || '',
    tinggi_cm: user?.tinggi_cm ?? '',
    berat_kg: user?.berat_kg ?? '',
    tingkat_aktivitas: user?.tingkat_aktivitas || '',
  });
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      nama_lengkap: user?.nama_lengkap || '',
      tanggal_lahir: user?.tanggal_lahir || '',
      jenis_kelamin: user?.jenis_kelamin || '',
      tinggi_cm: user?.tinggi_cm ?? '',
      berat_kg: user?.berat_kg ?? '',
      tingkat_aktivitas: user?.tingkat_aktivitas || '',
    });
  }, [user]);

  function ubah(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function pilihFoto(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // biar bisa pilih file yang sama lagi kalau mau ganti ulang
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showError('File harus berupa gambar');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Ukuran gambar maksimal 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('foto', file);

    setMengupload(true);
    try {
      await api.post('/pengguna/foto', formData);
      await refreshProfil();
      showSuccess('Foto profil berhasil diperbarui.');
    } catch (err) {
      showError(err.message);
    } finally {
      setMengupload(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMenyimpan(true);
    try {
      await api.put('/pengguna/profil', form);
      await refreshProfil();
      showSuccess('Profil berhasil disimpan.');
    } catch (err) {
      showError(err.message);
    } finally {
      setMenyimpan(false);
    }
  }

  const estimasiBmi = hitungEstimasiBmi(form.tinggi_cm, form.berat_kg);

  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Profil & Pengaturan</h1>
        <p className="text-gray-500 mt-1 mb-6">Data ini digunakan untuk menghitung kebutuhan kalori Anda</p>

        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-3xl overflow-hidden mx-auto">
            {user?.foto_profil ? (
              <img src={user.foto_profil} alt="Foto profil" className="w-full h-full object-cover" />
            ) : (
              (user?.nama_lengkap || user?.nama_pengguna || '?').charAt(0).toUpperCase()
            )}
          </div>
          <button
            type="button"
            onClick={() => inputFotoRef.current?.click()}
            disabled={mengupload}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600 hover:text-primary disabled:opacity-50"
            title="Ganti foto profil"
          >
            <Camera size={14} />
          </button>
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={pilihFoto}
          />
          {mengupload && <p className="text-xs text-gray-400 mt-2">Mengunggah foto...</p>}
        </div>
      </div>

      <Card>
        <h2 className="text-xs font-semibold text-gray-400 tracking-wide mb-4">DATA PRIBADI</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nama Lengkap"
            placeholder="Nama lengkap Anda"
            value={form.nama_lengkap}
            onChange={(e) => ubah('nama_lengkap', e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              type="date"
              label="Tanggal Lahir"
              value={form.tanggal_lahir || ''}
              onChange={(e) => ubah('tanggal_lahir', e.target.value)}
            />
            <Select
              label="Jenis Kelamin"
              value={form.jenis_kelamin}
              onChange={(e) => ubah('jenis_kelamin', e.target.value)}
            >
              <option value="">Pilih...</option>
              <option value="pria">Laki-laki</option>
              <option value="wanita">Perempuan</option>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              type="number"
              label="Tinggi Badan (cm)"
              value={form.tinggi_cm}
              onChange={(e) => ubah('tinggi_cm', e.target.value)}
            />
            <Input
              type="number"
              label="Berat Badan (kg)"
              value={form.berat_kg}
              onChange={(e) => ubah('berat_kg', e.target.value)}
            />
          </div>

          <Select
            label="Tingkat Aktivitas"
            value={form.tingkat_aktivitas}
            onChange={(e) => ubah('tingkat_aktivitas', e.target.value)}
          >
            <option value="">Pilih...</option>
            {opsiAktivitas.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            Estimasi BMI: <span className="font-medium text-gray-900">{estimasiBmi || '-'}</span>
          </div>

          <Button type="submit" disabled={menyimpan} className="w-full mt-2">
            {menyimpan ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
