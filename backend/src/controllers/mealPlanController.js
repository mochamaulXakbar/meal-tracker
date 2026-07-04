// src/controllers/mealPlanController.js — logika AI Meal Planner

const supabase = require('../config/supabase');
const model = require('../config/gemini');

const generateMenu = async (req, res) => {
  const id = req.userId;   // dari token

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

  // 2. Bikin perintah (prompt) buat Gemini — minta jawaban JSON aja
  const prompt = `
Kamu ahli gizi. Buatkan rekomendasi menu makan untuk SATU HARI (sarapan, makan siang, makan malam)
untuk orang Indonesia dengan total kalori sekitar ${tdee} kkal.
Gunakan makanan Indonesia yang umum & terjangkau.
Jawab HANYA dalam format JSON valid (tanpa teks lain, tanpa markdown), struktur persis seperti ini:
{
  "total_target_kalori": ${tdee},
  "menu": {
    "sarapan": { "nama": "...", "kalori": 0, "deskripsi": "..." },
    "makan_siang": { "nama": "...", "kalori": 0, "deskripsi": "..." },
    "makan_malam": { "nama": "...", "kalori": 0, "deskripsi": "..." }
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

    res.json({ status: 'success', pesan: 'Menu berhasil dibuat', data: menu });
  } catch (err) {
    return res.status(500).json({ status: 'error', pesan: 'Gagal membuat menu', detail: err.message });
  }
};

module.exports = { generateMenu };