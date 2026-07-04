// src/controllers/penggunaController.js — logika fitur pengguna/profil

const supabase = require('../config/supabase');

// Fungsi: Lengkapi / update profil pengguna
const lengkapiProfil = async (req, res) => {
  const { id } = req.params;   // ← SEMENTARA: id dari URL. Nanti diganti dari token.
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

module.exports = { lengkapiProfil };