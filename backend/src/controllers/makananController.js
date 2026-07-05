// src/controllers/makananController.js — Pencarian data makanan (Edamam API)

const { ambilCache, simpanCache } = require('../utils/cache');

// Cache hasil pencarian 1 jam — nutrisi makanan nggak sering berubah,
// sekalian hemat kuota Edamam kalau kata yang sama dicari ulang
const TTL_CACHE_DETIK = 60 * 60;

// Helper kecil: bulatin angka ke 1 desimal (biar 0.267 jadi 0.3, rapi)
const bulat1 = (n) => Math.round((n || 0) * 10) / 10;

// GET /api/makanan/cari?q=apple — cari makanan, balikin info gizinya
const cariMakanan = async (req, res) => {
  const kata = req.query.q;   // kata yang dicari, contoh: ?q=apple

  // Validasi: kalau kosong, jangan buang-buang kuota API
  if (!kata || kata.trim() === '') {
    return res.status(400).json({ status: 'error', pesan: 'Kata pencarian tidak boleh kosong' });
  }

  const kunciCache = `makanan:${kata.trim().toLowerCase()}`;
  const hasilCache = ambilCache(kunciCache);
  if (hasilCache) {
    return res.json({ ...hasilCache, dari_cache: true });
  }

  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_APP_KEY;

  // PENGECEKAN 1: kunci kebaca nggak dari .env?
  // Kalau salah satu undefined = .env belum ke-load → restart server dulu
  if (!appId || !appKey) {
    return res.status(500).json({
      status: 'error',
      pesan: 'Kunci Edamam tidak terbaca dari .env. Coba restart server.',
      debug: { appId_kebaca: !!appId, appKey_kebaca: !!appKey }
    });
  }

  try {
    // Rakit alamat API Edamam
    // encodeURIComponent → biar kata berspasi (mis. "nasi goreng") nggak error
    const url = `https://api.edamam.com/api/food-database/v2/parser`
      + `?ingr=${encodeURIComponent(kata)}`
      + `&app_id=${appId}`
      + `&app_key=${appKey}`;

    const respon = await fetch(url);

    // PENGECEKAN 2: kalau Edamam nolak, INTIP alasan aslinya
    if (!respon.ok) {
      const teksAsli = await respon.text();               // pesan mentah dari Edamam
      console.error('❌ Edamam nolak:', respon.status, teksAsli);   // muncul di TERMINAL server
      return res.status(502).json({
        status: 'error',
        pesan: 'Gagal mengambil data dari Edamam',
        kode_status: respon.status,          // 401=kunci salah, 403=plan, 429=kuota habis
        detail_edamam: teksAsli.slice(0, 300)  // dipotong biar nggak kepanjangan
      });
    }

    const dataEdamam = await respon.json();

    // Data mentah ada di 'hints'. Kita saring & rapiin jadi bentuk sederhana.
    const hasil = (dataEdamam.hints || []).map((item) => {
      const f = item.food;
      const gizi = f.nutrients || {};
      return {
        id_makanan: f.foodId,
        nama: f.label,
        per_takaran: '100 gram',        // angka gizi Edamam per 100 gram
        kalori: Math.round(gizi.ENERC_KCAL || 0),
        protein: bulat1(gizi.PROCNT),
        karbohidrat: bulat1(gizi.CHOCDF),
        lemak: bulat1(gizi.FAT),
        gambar: f.image || null
      };
    });

    const responBody = {
      status: 'success',
      kata_dicari: kata,
      jumlah: hasil.length,
      data: hasil
    };

    simpanCache(kunciCache, responBody, TTL_CACHE_DETIK);
    res.json(responBody);
  } catch (err) {
    return res.status(500).json({ status: 'error', pesan: 'Terjadi kesalahan saat mencari makanan', detail: err.message });
  }
};

module.exports = { cariMakanan };