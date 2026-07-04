// src/controllers/chatController.js — logika AI Diet Buddy (chatbot)

const supabase = require('../config/supabase');
const model = require('../config/gemini');

// POST /api/chat — kirim pesan, dapet balasan (inget riwayat)
const kirimPesan = async (req, res) => {
  const id_pengguna = req.userId;   // dari token
  const { pesan } = req.body || {};

  if (!pesan || pesan.trim() === '') {
    return res.status(400).json({ status: 'error', pesan: 'Pesan tidak boleh kosong' });
  }

  try {
    // Simpen pesan USER ke DB
    await supabase.from('pesan_chat').insert({
      id_pengguna, pengirim: 'pengguna', isi_pesan: pesan
    });

    // Ambil SEMUA riwayat chat user (buat konteks), urut dari lama ke baru
    const { data: riwayat } = await supabase
      .from('pesan_chat')
      .select('pengirim, isi_pesan')
      .eq('id_pengguna', id_pengguna)
      .order('dibuat_pada', { ascending: true });

    // Susun riwayat jadi format yang dimengerti Gemini
    //    Gemini pakai peran 'user' & 'model' → kita terjemahin dari pengguna/ai
    const history = riwayat.map((r) => ({
      role: r.pengirim === 'pengguna' ? 'user' : 'model',
      parts: [{ text: r.isi_pesan }]
    }));

    // Mulai chat dengan membawa riwayat (kecuali pesan terakhir = yg baru dikirim)
    const chat = model.startChat({
      history: history.slice(0, -1),   // semua kecuali pesan user terakhir
      systemInstruction: {
        parts: [{ text: 'Kamu adalah Diet Buddy, asisten gizi ramah untuk aplikasi Meal Tracker. Jawab dalam Bahasa Indonesia, singkat, dan hanya seputar gizi/diet/makanan sehat.' }]
      }
    });

    // Kirim pesan terbaru ke Gemini
    const result = await chat.sendMessage(pesan);
    const balasan = result.response.text();

    // Simpen balasan AI ke DB
    await supabase.from('pesan_chat').insert({
      id_pengguna, pengirim: 'ai', isi_pesan: balasan
    });

    // Kirim ke user
    res.json({
      status: 'success',
      data: { pesan_user: pesan, balasan_bot: balasan }
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', pesan: 'Gagal memproses chat', detail: err.message });
  }
};

// GET /api/chat — ambil semua riwayat chat user (buat ditampilin di layar)
const ambilRiwayat = async (req, res) => {
  const id_pengguna = req.userId;

  const { data, error } = await supabase
    .from('pesan_chat')
    .select('id, pengirim, isi_pesan, dibuat_pada')
    .eq('id_pengguna', id_pengguna)
    .order('dibuat_pada', { ascending: true });

  if (error) {
    return res.status(500).json({ status: 'error', pesan: error.message });
  }

  res.json({ status: 'success', jumlah: data.length, data });
};

// DELETE /api/chat/:id — hapus 1 pesan (1 baris aja)
const hapusPesan = async (req, res) => {
  const id_pengguna = req.userId;   // dari token
  const { id } = req.params;        // ID pesan dari alamat URL

  try {
    // .eq('id_pengguna', ...) → PENTING: cuma boleh hapus pesan MILIK SENDIRI
    // .select() → biar tau baris mana yang beneran kehapus
    const { data, error } = await supabase
      .from('pesan_chat')
      .delete()
      .eq('id', id)
      .eq('id_pengguna', id_pengguna)
      .select();

    if (error) {
      return res.status(500).json({ status: 'error', pesan: error.message });
    }

    // Kalau kosong = ID nggak ketemu ATAU itu bukan pesan punya dia
    if (!data || data.length === 0) {
      return res.status(404).json({ status: 'error', pesan: 'Pesan tidak ditemukan' });
    }

    res.json({ status: 'success', pesan: 'Pesan berhasil dihapus', data: data[0] });
  } catch (err) {
    return res.status(500).json({ status: 'error', pesan: 'Gagal menghapus pesan', detail: err.message });
  }
};

// DELETE /api/chat — hapus SEMUA riwayat chat user (bersihin obrolan)
const hapusSemuaPesan = async (req, res) => {
  const id_pengguna = req.userId;

  try {
    const { data, error } = await supabase
      .from('pesan_chat')
      .delete()
      .eq('id_pengguna', id_pengguna)   // sapu semua pesan punya user ini
      .select();

    if (error) {
      return res.status(500).json({ status: 'error', pesan: error.message });
    }

    res.json({
      status: 'success',
      pesan: 'Semua riwayat chat berhasil dihapus',
      jumlah_terhapus: data.length
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', pesan: 'Gagal menghapus riwayat', detail: err.message });
  }
};

module.exports = { kirimPesan, ambilRiwayat, hapusPesan, hapusSemuaPesan };