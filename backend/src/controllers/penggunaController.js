// src/controllers/penggunaController.js — logika fitur pengguna/profil

const supabase = require('../config/supabase');

// --- Alat bantu kalkulasi ---

// Hitung umur dari tanggal lahir
const hitungUmur = (tanggalLahir) => {
  const lahir = new Date(tanggalLahir);
  const kini = new Date();
  let umur = kini.getFullYear() - lahir.getFullYear();
  const belumUltah =
    kini.getMonth() < lahir.getMonth() ||
    (kini.getMonth() === lahir.getMonth() && kini.getDate() < lahir.getDate());
  if (belumUltah) umur--;
  return umur;
};

// Faktor pengali sesuai tingkat aktivitas
const faktorAktivitas = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
};

// Kategori BMI (standar WHO)
const kategoriBMI = (bmi) => {
  if (bmi < 18.5) return 'Kurus';
  if (bmi < 25)   return 'Normal';
  if (bmi < 30)   return 'Gemuk';
  return 'Obesitas';
};

// Fungsi: Ambil profil pengguna yang login (buat load ulang dasbor tanpa login lagi)
const ambilProfil = async (req, res) => {
  const id = req.userId;

  const { data, error } = await supabase
    .from('pengguna')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ status: 'error', pesan: 'Profil tidak ditemukan' });
  }

  res.json({ status: 'success', data });
};

// Fungsi: Lengkapi / update profil pengguna
const lengkapiProfil = async (req, res) => {
 const id = req.userId;
  const {
    nama_lengkap, tanggal_lahir, jenis_kelamin,
    tinggi_cm, berat_kg, tingkat_aktivitas
  } = req.body;

  // Kumpulin cuma field yang dikirim (biar yang nggak diisi nggak ketimpa jadi kosong)
  const dataUpdate = {};
  if (nama_lengkap !== undefined)      dataUpdate.nama_lengkap = nama_lengkap;
  if (tanggal_lahir !== undefined)     dataUpdate.tanggal_lahir = tanggal_lahir;
  if (jenis_kelamin !== undefined)     dataUpdate.jenis_kelamin = jenis_kelamin;
  if (tinggi_cm !== undefined)         dataUpdate.tinggi_cm = tinggi_cm;
  if (berat_kg !== undefined)          dataUpdate.berat_kg = berat_kg;
  if (tingkat_aktivitas !== undefined) dataUpdate.tingkat_aktivitas = tingkat_aktivitas;

  // Kalau kosong semua, tolak
  if (Object.keys(dataUpdate).length === 0) {
    return res.status(400).json({ status: 'error', pesan: 'Tidak ada data yang dikirim' });
  }

  // Update baris di tabel pengguna yang id-nya cocok
  const { data, error } = await supabase
    .from('pengguna')
    .update(dataUpdate)
    .eq('id', id)      // ← cuma update baris dengan id ini
    .select();

  if (error) {
    return res.status(400).json({ status: 'error', pesan: error.message });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ status: 'error', pesan: 'Pengguna dengan id tersebut tidak ditemukan' });
  }

  res.json({ status: 'success', pesan: 'Profil berhasil dilengkapi', data: data[0] });
};

// Fungsi: Hitung BMI & TDEE user yang login
const hitungKalkulasi = async (req, res) => {
  const id = req.userId;   // dari token (aman)

  // Ambil profil
  const { data: profil, error } = await supabase
    .from('pengguna').select('*').eq('id', id).single();

  if (error || !profil) {
    return res.status(404).json({ status: 'error', pesan: 'Profil tidak ditemukan' });
  }

  const { berat_kg, tinggi_cm, tanggal_lahir, jenis_kelamin, tingkat_aktivitas } = profil;

  // Pastikan data fisik lengkap dulu
  if (!berat_kg || !tinggi_cm || !tanggal_lahir || !jenis_kelamin || !tingkat_aktivitas) {
    return res.status(400).json({
      status: 'error',
      pesan: 'Profil belum lengkap. Lengkapi berat, tinggi, tanggal lahir, jenis kelamin, dan tingkat aktivitas dulu.'
    });
  }

  const umur = hitungUmur(tanggal_lahir);

  // BMI
  const tinggiM = tinggi_cm / 100;
  const bmi = Math.round((berat_kg / (tinggiM * tinggiM)) * 10) / 10;

  // BMR (Mifflin-St Jeor)
  let bmr = 10 * berat_kg + 6.25 * tinggi_cm - 5 * umur;
  bmr += (jenis_kelamin === 'pria') ? 5 : -161;

  // TDEE
  const faktor = faktorAktivitas[tingkat_aktivitas] || 1.2;
  const tdee = Math.round(bmr * faktor);

  res.json({
    status: 'success',
    pesan: 'Kalkulasi berhasil',
    data: {
      umur,
      bmi,
      kategori_bmi: kategoriBMI(bmi),
      bmr: Math.round(bmr),
      tdee,
      tingkat_aktivitas
    }
  });
};
// Fungsi: Upload/ganti foto profil — terima 1 file (field "foto"), simpan ke Supabase Storage
const uploadFotoProfil = async (req, res) => {
  const id = req.userId;

  if (!req.file) {
    return res.status(400).json({ status: 'error', pesan: 'File foto wajib dikirim (field "foto")' });
  }

  const ekstensi = req.file.originalname.split('.').pop();
  const namaFile = `${id}-${Date.now()}.${ekstensi}`;

  const { error: uploadError } = await supabase.storage
    .from('foto-profil')
    .upload(namaFile, req.file.buffer, { contentType: req.file.mimetype });

  if (uploadError) {
    return res.status(500).json({ status: 'error', pesan: uploadError.message });
  }

  const { data: publicData } = supabase.storage.from('foto-profil').getPublicUrl(namaFile);

  const { data, error } = await supabase
    .from('pengguna')
    .update({ foto_profil: publicData.publicUrl })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json({ status: 'error', pesan: error.message });
  res.json({ status: 'success', pesan: 'Foto profil berhasil diperbarui', data });
};

module.exports = { ambilProfil, lengkapiProfil, hitungKalkulasi, uploadFotoProfil };