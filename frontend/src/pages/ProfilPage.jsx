import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  const [form, setForm] = useState({
    nama_lengkap: user?.nama_lengkap || '',
    tanggal_lahir: user?.tanggal_lahir || '',
    jenis_kelamin: user?.jenis_kelamin || '',
    tinggi_cm: user?.tinggi_cm ?? '',
    berat_kg: user?.berat_kg ?? '',
    tingkat_aktivitas: user?.tingkat_aktivitas || '',
  });
  const [pesan, setPesan] = useState('');
  const [error, setError] = useState('');
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

  async function handleSubmit(e) {
    e.preventDefault();
    setPesan('');
    setError('');
    setMenyimpan(true);
    try {
      await api.put('/pengguna/profil', form);
      await refreshProfil();
      setPesan('Profil berhasil disimpan.');
    } catch (err) {
      setError(err.message);
    } finally {
      setMenyimpan(false);
    }
  }

  const estimasiBmi = hitungEstimasiBmi(form.tinggi_cm, form.berat_kg);

  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Profil & Pengaturan</h1>
        <p className="text-gray-500 mt-1 mb-8">Data ini digunakan untuk menghitung kebutuhan kalori Anda</p>
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

          {pesan && <p className="text-sm text-green-700">{pesan}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={menyimpan} className="w-full mt-2">
            {menyimpan ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
