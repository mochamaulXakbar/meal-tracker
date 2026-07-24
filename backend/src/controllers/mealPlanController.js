// src/controllers/mealPlanController.js — logika AI Meal Planner

const supabase = require('../config/supabase');
const model = require('../config/gemini');
const { ambilCache, simpanCache } = require('../utils/cache');

// Cache singkat (5 menit) — jaga-jaga kalau user klik generate berkali-kali
// dalam waktu dekat, nggak perlu panggil Gemini ulang & boros kuota
const TTL_CACHE_DETIK = 5 * 60;

const generateMenu = async (req, res) => {
  const id = req.userId;   // dari token
  const pantangan = (req.body?.pantangan || '').trim().slice(0, 200); // opsional, alergi/pantangan makanan

  // 1. Ambil profil + hitung TDEE (biar menu pas sama kebutuhan kalori)
  const { data: profil, error } = await supabase
    .from('pengguna').select('*').eq('id', id).single();

  if (error || !profil) {
    return res.status(404).json({ status: 'error', pesan: 'Profil tidak ditemukan' });
  }

  const { berat_kg, tinggi_cm, tanggal_lahir, jenis_kelamin, tingkat_aktivitas } = profil;
  if (!berat_kg || !tinggi_cm || !tanggal_lahir || !jenis_kelamin || !tingkat_aktivitas) {
    return res.status(400).json({ status: 'error', pesan: 'Profil belum lengkap, lengkapi dulu.' });
  }

  // Hitung umur & TDEE (ringkas)
  const umur = new Date().getFullYear() - new Date(tanggal_lahir).getFullYear();
  const faktor = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 }[tingkat_aktivitas] || 1.2;
  let bmr = 10*berat_kg + 6.25*tinggi_cm - 5*umur + (jenis_kelamin === 'pria' ? 5 : -161);
  const tdee = Math.round(bmr * faktor);

  // Pantangan ikut jadi bagian kunci cache — beda pantangan = jangan pakai cache yang lama
  const kunciCache = `mealplan:${id}:${tdee}:${pantangan.toLowerCase()}`;
  const hasilCache = ambilCache(kunciCache);
  if (hasilCache) {
    return res.json({ ...hasilCache, dari_cache: true });
  }

  // 2. Bikin perintah (prompt) buat Gemini — minta jawaban JSON aja
  const baginPantangan = pantangan
    ? `\nPENTING - user punya alergi/pantangan berikut, WAJIB dihindari sepenuhnya: ${pantangan}.`
    : '';

  const prompt = `
Kamu ahli gizi. Buatkan rekomendasi menu makan untuk SATU HARI (sarapan, makan siang, makan malam)
untuk orang Indonesia dengan total kalori sekitar ${tdee} kkal.
Gunakan makanan Indonesia yang umum & terjangkau.${baginPantangan}
Untuk tiap menu, sertakan juga daftar bahan (dengan takaran kira-kira, contoh "Nasi putih - 150 gram")
dan langkah memasak singkat yang jelas per tahap (3-6 langkah, tiap langkah 1 kalimat).
Jawab HANYA dalam format JSON valid (tanpa teks lain, tanpa markdown), struktur persis seperti ini:
{
  "total_target_kalori": ${tdee},
  "menu": {
    "sarapan": { "nama": "...", "kalori": 0, "deskripsi": "ringkasan singkat 1 kalimat", "bahan": ["...", "..."], "langkah": ["...", "..."] },
    "makan_siang": { "nama": "...", "kalori": 0, "deskripsi": "ringkasan singkat 1 kalimat", "bahan": ["...", "..."], "langkah": ["...", "..."] },
    "makan_malam": { "nama": "...", "kalori": 0, "deskripsi": "ringkasan singkat 1 kalimat", "bahan": ["...", "..."], "langkah": ["...", "..."] }
  }
}`;

  try {
    // 3. Kirim ke Gemini
    const result = await model.generateContent(prompt);
    let teks = result.response.text();

    // 4. Bersihin kalau Gemini bungkus pakai ```json ... ```
    teks = teks.replace(/```json/g, '').replace(/```/g, '').trim();

    // 5. Ubah teks JSON jadi objek
    const menu = JSON.parse(teks);

    // 6. Simpen ke riwayat rencana_menu (biar user bisa liat rekomendasi sebelumnya)
    const totalKalori =
      (menu.menu?.sarapan?.kalori || 0) +
      (menu.menu?.makan_siang?.kalori || 0) +
      (menu.menu?.makan_malam?.kalori || 0);

    await supabase.from('rencana_menu').insert({
      id_pengguna: id,
      target_kalori: tdee,
      total_kalori: totalKalori,
      menu: menu.menu
    });

    const responBody = { status: 'success', pesan: 'Menu berhasil dibuat', data: menu };
    simpanCache(kunciCache, responBody, TTL_CACHE_DETIK);
    res.json(responBody);
  } catch (err) {
    return res.status(500).json({ status: 'error', pesan: 'Gagal membuat menu', detail: err.message });
  }
};

// GET /api/meal-plan/riwayat — ambil riwayat menu yang pernah di-generate
const ambilRiwayatMenu = async (req, res) => {
  const id = req.userId;

  const { data, error } = await supabase
    .from('rencana_menu')
    .select('*')
    .eq('id_pengguna', id)
    .order('dibuat_pada', { ascending: false })
    .limit(30);

  if (error) return res.status(500).json({ status: 'error', pesan: error.message });
  res.json({ status: 'success', jumlah: data.length, data });
};

// DELETE /api/meal-plan/riwayat/:id — hapus 1 riwayat menu (1 baris aja)
const hapusRencanaMenu = async (req, res) => {
  const id_pengguna = req.userId;   // dari token
  const { id } = req.params;        // ID rencana menu dari alamat URL

  try {
    // .eq('id_pengguna', ...) → PENTING: cuma boleh hapus riwayat MILIK SENDIRI
    const { data, error } = await supabase
      .from('rencana_menu')
      .delete()
      .eq('id', id)
      .eq('id_pengguna', id_pengguna)
      .select();

    if (error) {
      return res.status(500).json({ status: 'error', pesan: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ status: 'error', pesan: 'Riwayat tidak ditemukan' });
    }

    res.json({ status: 'success', pesan: 'Riwayat menu berhasil dihapus', data: data[0] });
  } catch (err) {
    return res.status(500).json({ status: 'error', pesan: 'Gagal menghapus riwayat', detail: err.message });
  }
};

module.exports = { generateMenu, ambilRiwayatMenu, hapusRencanaMenu };