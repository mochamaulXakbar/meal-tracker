// src/middleware/autentikasi.js — pos pemeriksa token

const supabase = require('../config/supabase');

const cekLogin = async (req, res, next) => {
  // Ambil token dari header "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', pesan: 'Token tidak ada, silakan login dulu' });
  }

  const token = authHeader.split(' ')[1];   // ambil bagian setelah "Bearer "

  // Tanya Supabase: token ini valid & punya siapa?
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ status: 'error', pesan: 'Token tidak valid atau kadaluarsa' });
  }

  // Tempelin id user ke request, biar endpoint di belakang bisa pakai
  req.userId = data.user.id;

  next();   // ← lolos! lanjut ke endpoint tujuan
};

// cek apakah user PERANnya admin
const cekAdmin = async (req, res, next) => {
  const { data: profil, error } = await supabase
    .from('pengguna')
    .select('peran')
    .eq('id', req.userId)   // req.userId udah diisi cekLogin sebelumnya
    .single();

  if (error || !profil) {
    return res.status(404).json({ status: 'error', pesan: 'Pengguna tidak ditemukan' });
  }

  if (profil.peran !== 'admin') {
    return res.status(403).json({ status: 'error', pesan: 'Akses ditolak. Khusus admin.' });
  }

  next();   // lolos, dia admin
};

module.exports = { cekLogin, cekAdmin };