// src/controllers/artikelController.js — logika Artikel (CRUD + role)

const supabase = require('../config/supabase');

// READ semua — publik (bisa filter ?kategori=resep)
const ambilSemua = async (req, res) => {
  const { kategori } = req.query;
  let query = supabase.from('artikel').select('*').order('dibuat_pada', { ascending: false });
  if (kategori) query = query.eq('kategori', kategori);

  const { data, error } = await query;
  if (error) return res.status(500).json({ status: 'error', pesan: error.message });
  res.json({ status: 'success', jumlah: data.length, data });
};

// READ satu — publik
const ambilSatu = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('artikel').select('*').eq('id', id).single();
  if (error || !data) return res.status(404).json({ status: 'error', pesan: 'Artikel tidak ditemukan' });
  res.json({ status: 'success', data });
};

// CREATE — admin only
const tambahArtikel = async (req, res) => {
  const id_penulis = req.userId;
  const { judul, kategori, konten, url_sumber, url_gambar } = req.body || {};

  if (!judul || !konten) {
    return res.status(400).json({ status: 'error', pesan: 'judul dan konten wajib diisi' });
  }

  const { data, error } = await supabase
    .from('artikel')
    .insert({ id_penulis, judul, kategori, konten, url_sumber, url_gambar })
    .select().single();

  if (error) return res.status(400).json({ status: 'error', pesan: error.message });
  res.status(201).json({ status: 'success', pesan: 'Artikel berhasil dibuat', data });
};

// UPDATE — admin only
const editArtikel = async (req, res) => {
  const { id } = req.params;
  const { judul, kategori, konten, url_sumber, url_gambar } = req.body || {};

  const dataUpdate = {};
  if (judul !== undefined)      dataUpdate.judul = judul;
  if (kategori !== undefined)   dataUpdate.kategori = kategori;
  if (konten !== undefined)     dataUpdate.konten = konten;
  if (url_sumber !== undefined) dataUpdate.url_sumber = url_sumber;
  if (url_gambar !== undefined) dataUpdate.url_gambar = url_gambar;

  if (Object.keys(dataUpdate).length === 0) {
    return res.status(400).json({ status: 'error', pesan: 'Tidak ada data yang dikirim' });
  }

  const { data, error } = await supabase.from('artikel').update(dataUpdate).eq('id', id).select();
  if (error) return res.status(400).json({ status: 'error', pesan: error.message });
  if (!data || data.length === 0) return res.status(404).json({ status: 'error', pesan: 'Artikel tidak ditemukan' });
  res.json({ status: 'success', pesan: 'Artikel berhasil diperbarui', data: data[0] });
};

// DELETE — admin only
const hapusArtikel = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('artikel').delete().eq('id', id).select();
  if (error) return res.status(400).json({ status: 'error', pesan: error.message });
  if (!data || data.length === 0) return res.status(404).json({ status: 'error', pesan: 'Artikel tidak ditemukan' });
  res.json({ status: 'success', pesan: 'Artikel berhasil dihapus' });
};

module.exports = { ambilSemua, ambilSatu, tambahArtikel, editArtikel, hapusArtikel };