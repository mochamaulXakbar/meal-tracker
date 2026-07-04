// src/controllers/riwayatController.js — logika Riwayat Makanan (CRUD)

const supabase = require('../config/supabase');

// CREATE — tambah makanan yang dimakan
const tambahRiwayat = async (req, res) => {
  const id_pengguna = req.userId;
  const { nama_makanan, kalori, protein_g, karbohidrat_g, lemak_g, jenis_makan, tanggal_konsumsi } = req.body || {};

  if (!nama_makanan || kalori === undefined || !jenis_makan) {
    return res.status(400).json({ status: 'error', pesan: 'nama_makanan, kalori, dan jenis_makan wajib diisi' });
  }

  const { data, error } = await supabase
    .from('riwayat_makanan')
    .insert({
      id_pengguna,
      nama_makanan,
      kalori,
      protein_g: protein_g ?? 0,
      karbohidrat_g: karbohidrat_g ?? 0,
      lemak_g: lemak_g ?? 0,
      jenis_makan,
      tanggal_konsumsi: tanggal_konsumsi || new Date().toISOString().split('T')[0]  // default: hari ini
    })
    .select()
    .single();

  if (error) return res.status(400).json({ status: 'error', pesan: error.message });
  res.status(201).json({ status: 'success', pesan: 'Makanan berhasil ditambahkan', data });
};

// READ — lihat riwayat (bisa filter per tanggal via query ?tanggal=YYYY-MM-DD)
const ambilRiwayat = async (req, res) => {
  const id_pengguna = req.userId;
  const { tanggal } = req.query;

  let query = supabase
    .from('riwayat_makanan')
    .select('*')
    .eq('id_pengguna', id_pengguna)
    .order('tanggal_konsumsi', { ascending: false });

  if (tanggal) query = query.eq('tanggal_konsumsi', tanggal);   // filter kalau ada

  const { data, error } = await query;
  if (error) return res.status(500).json({ status: 'error', pesan: error.message });

  // Hitung total kalori (bonus, berguna buat dashboard)
  const total_kalori = data.reduce((sum, item) => sum + Number(item.kalori), 0);

  res.json({ status: 'success', jumlah: data.length, total_kalori, data });
};

// UPDATE — edit entri
const editRiwayat = async (req, res) => {
  const id_pengguna = req.userId;
  const { id } = req.params;
  const { nama_makanan, kalori, protein_g, karbohidrat_g, lemak_g, jenis_makan, tanggal_konsumsi } = req.body || {};

  // Kumpulin cuma field yang dikirim (biar yg lain nggak ketimpa)
  const dataUpdate = {};
  if (nama_makanan !== undefined)     dataUpdate.nama_makanan = nama_makanan;
  if (kalori !== undefined)           dataUpdate.kalori = kalori;
  if (protein_g !== undefined)        dataUpdate.protein_g = protein_g;
  if (karbohidrat_g !== undefined)    dataUpdate.karbohidrat_g = karbohidrat_g;
  if (lemak_g !== undefined)          dataUpdate.lemak_g = lemak_g;
  if (jenis_makan !== undefined)      dataUpdate.jenis_makan = jenis_makan;
  if (tanggal_konsumsi !== undefined) dataUpdate.tanggal_konsumsi = tanggal_konsumsi;

  if (Object.keys(dataUpdate).length === 0) {
    return res.status(400).json({ status: 'error', pesan: 'Tidak ada data yang dikirim' });
  }

  const { data, error } = await supabase
    .from('riwayat_makanan')
    .update(dataUpdate)
    .eq('id', id)
    .eq('id_pengguna', id_pengguna)   // ← pastiin cuma bisa edit MILIK SENDIRI
    .select();

  if (error) return res.status(400).json({ status: 'error', pesan: error.message });
  if (!data || data.length === 0) {
    return res.status(404).json({ status: 'error', pesan: 'Data tidak ditemukan atau bukan milik kamu' });
  }
  res.json({ status: 'success', pesan: 'Riwayat berhasil diperbarui', data: data[0] });
};

// DELETE — hapus entri
const hapusRiwayat = async (req, res) => {
  const id_pengguna = req.userId;
  const { id } = req.params;

  const { data, error } = await supabase
    .from('riwayat_makanan')
    .delete()
    .eq('id', id)
    .eq('id_pengguna', id_pengguna)   // ← cuma bisa hapus MILIK SENDIRI
    .select();

  if (error) return res.status(400).json({ status: 'error', pesan: error.message });
  if (!data || data.length === 0) {
    return res.status(404).json({ status: 'error', pesan: 'Data tidak ditemukan atau bukan milik kamu' });
  }
  res.json({ status: 'success', pesan: 'Riwayat berhasil dihapus' });
};

module.exports = { tambahRiwayat, ambilRiwayat, editRiwayat, hapusRiwayat };