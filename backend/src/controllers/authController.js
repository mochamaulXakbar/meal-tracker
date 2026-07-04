// src/controllers/authController.js — logika (otak) fitur autentikasi

const supabase = require('../config/supabase');

// Fungsi: Register user baru
const register = async (req, res) => {
  const { email, password, nama_pengguna, nama_lengkap } = req.body;

  // Validasi field wajib
  if (!email || !password || !nama_pengguna) {
    return res.status(400).json({
      status: 'error',
      pesan: 'Email, password, dan nama_pengguna wajib diisi'
    });
  }

  // Bikin user di Auth Supabase (password otomatis di-hash)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true
  });

  if (authError) {
    return res.status(400).json({ status: 'error', pesan: authError.message });
  }

  // Simpen profil ke tabel pengguna (id sama = "jahitan")
  const { data: profil, error: profilError } = await supabase
    .from('pengguna')
    .insert({
      id: authData.user.id,
      email,
      nama_pengguna,
      nama_lengkap: nama_lengkap || null,
      peran: 'pengguna'
    })
    .select()
    .single();

  if (profilError) {
    return res.status(400).json({ status: 'error', pesan: profilError.message });
  }

  res.status(201).json({ status: 'success', pesan: 'Registrasi berhasil', data: profil });
};

module.exports = { register };