// src/controllers/adminController.js — logika khusus admin (daftar pengguna & statistik)

const supabase = require('../config/supabase');

// GET /api/admin/pengguna — daftar semua pengguna (admin only, pagination ?page=1&limit=10, cari ?cari=kata)
const ambilSemuaPengguna = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const dari = (page - 1) * limit;
  const sampai = dari + limit - 1;
  const cari = (req.query.cari || '').trim();

  let query = supabase
    .from('pengguna')
    .select('id, nama_pengguna, nama_lengkap, email, peran, dibuat_pada', { count: 'exact' })
    .order('dibuat_pada', { ascending: false });

  if (cari) {
    query = query.or(`nama_pengguna.ilike.%${cari}%,nama_lengkap.ilike.%${cari}%,email.ilike.%${cari}%`);
  }

  const { data, error, count } = await query.range(dari, sampai);

  if (error) return res.status(500).json({ status: 'error', pesan: error.message });
  res.json({
    status: 'success',
    jumlah: data.length,
    total: count || 0,
    halaman: page,
    total_halaman: Math.max(1, Math.ceil((count || 0) / limit)),
    data
  });
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

// DELETE /api/admin/pengguna/:id — hapus pengguna (admin only)
const hapusPengguna = async (req, res) => {
  const { id } = req.params;

  // Jangan biarkan akun admin terhapus lewat endpoint ini (jaga-jaga, jangan cuma andalin frontend)
  const { data: target } = await supabase.from('pengguna').select('peran').eq('id', id).single();
  if (target?.peran === 'admin') {
    return res.status(403).json({ status: 'error', pesan: 'Tidak bisa menghapus akun admin' });
  }

  // Hapus dari Supabase Auth (ini yang bikin user bener-bener nggak bisa login lagi)
  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError) {
    return res.status(400).json({ status: 'error', pesan: authError.message });
  }

  // Hapus juga baris profilnya (jaga-jaga kalau nggak ada cascade delete otomatis)
  await supabase.from('pengguna').delete().eq('id', id);

  res.json({ status: 'success', pesan: 'Pengguna berhasil dihapus' });
};

module.exports = { ambilSemuaPengguna, ambilStatistik, hapusPengguna };
