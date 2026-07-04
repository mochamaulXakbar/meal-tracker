// src/controllers/beratController.js
// Logika Riwayat Berat (Jalan C: simpan semua, grafik ambil 1 per hari)

const supabase = require('../config/supabase');

// CREATE — catat berat (selalu insert, data mentah aman)
const tambahBerat = async (req, res) => {
  const id_pengguna = req.userId;
  const { berat_kg, tanggal } = req.body || {};

  if (berat_kg === undefined) {
    return res.status(400).json({ status: 'error', pesan: 'berat_kg wajib diisi' });
  }

  const { data, error } = await supabase
    .from('riwayat_berat')
    .insert({
      id_pengguna,
      berat_kg,
      tanggal: tanggal || new Date().toISOString().split('T')[0]  // default hari ini
    })
    .select()
    .single();

  if (error) return res.status(400).json({ status: 'error', pesan: error.message });

  // Bonus: update berat terkini di profil pengguna
  await supabase.from('pengguna').update({ berat_kg }).eq('id', id_pengguna);

  res.status(201).json({ status: 'success', pesan: 'Berat berhasil dicatat', data });
};

// READ untuk GRAFIK — ambil 1 per tanggal (yang terakhir tiap hari)
const ambilGrafik = async (req, res) => {
  const id_pengguna = req.userId;

  const { data, error } = await supabase
    .from('riwayat_berat')
    .select('berat_kg, tanggal, dibuat_pada')
    .eq('id_pengguna', id_pengguna)
    .order('dibuat_pada', { ascending: true });   // urut lama → baru

  if (error) return res.status(500).json({ status: 'error', pesan: error.message });

  // Kelompokin per tanggal; karena udah urut, entri terakhir tiap tanggal yang menang
  const perHari = {};
  data.forEach((row) => { perHari[row.tanggal] = row; });

  const grafik = Object.values(perHari)
    .map((r) => ({ tanggal: r.tanggal, berat_kg: r.berat_kg }))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  res.json({ status: 'success', jumlah: grafik.length, data: grafik });
};

// READ semua data mentah — buat log detail
const ambilSemua = async (req, res) => {
  const id_pengguna = req.userId;
  const { data, error } = await supabase
    .from('riwayat_berat')
    .select('*')
    .eq('id_pengguna', id_pengguna)
    .order('dibuat_pada', { ascending: false });

  if (error) return res.status(500).json({ status: 'error', pesan: error.message });
  res.json({ status: 'success', jumlah: data.length, data });
};

module.exports = { tambahBerat, ambilGrafik, ambilSemua };