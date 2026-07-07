// src/controllers/adminController.js — logika khusus admin (daftar pengguna & statistik)

const supabase = require('../config/supabase');

// GET /api/admin/pengguna — daftar semua pengguna (admin only)
const ambilSemuaPengguna = async (req, res) => {
  const { data, error } = await supabase
    .from('pengguna')
    .select('id, nama_pengguna, nama_lengkap, email, peran, dibuat_pada')
    .order('dibuat_pada', { ascending: false });

  if (error) return res.status(500).json({ status: 'error', pesan: error.message });
  res.json({ status: 'success', jumlah: data.length, data });
};

// GET /api/admin/statistik — total pengguna + pertumbuhan harian 30 hari terakhir (admin only)
const ambilStatistik = async (req, res) => {
  const { data, error } = await supabase
    .from('pengguna')
    .select('dibuat_pada')
    .order('dibuat_pada', { ascending: true });

  if (error) return res.status(500).json({ status: 'error', pesan: error.message });

  const totalPengguna = data.length;

  // Batas 7 hari & 30 hari terakhir (dihitung dari waktu sekarang)
  const sekarang = new Date();
  const tujuhHariLalu = new Date(sekarang);
  tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 7);
  const tigaPuluhHariLalu = new Date(sekarang);
  tigaPuluhHariLalu.setDate(tigaPuluhHariLalu.getDate() - 30);

  const baru7HariTerakhir = data.filter((p) => new Date(p.dibuat_pada) >= tujuhHariLalu).length;

  // Kelompokin pendaftaran per tanggal (cuma yang 30 hari terakhir) buat grafik pertumbuhan
  const perTanggal = {};
  data
    .filter((p) => new Date(p.dibuat_pada) >= tigaPuluhHariLalu)
    .forEach((p) => {
      const tanggal = p.dibuat_pada.split('T')[0];
      perTanggal[tanggal] = (perTanggal[tanggal] || 0) + 1;
    });

  const pertumbuhanHarian = Object.entries(perTanggal)
    .map(([tanggal, jumlah]) => ({ tanggal, jumlah }))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  res.json({
    status: 'success',
    data: {
      total_pengguna: totalPengguna,
      baru_7_hari_terakhir: baru7HariTerakhir,
      pertumbuhan_harian: pertumbuhanHarian
    }
  });
};

module.exports = { ambilSemuaPengguna, ambilStatistik };
