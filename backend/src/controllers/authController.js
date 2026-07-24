// src/controllers/authController.js — logika (otak) fitur autentikasi

const supabase = require('../config/supabase');
const { createClient } = require('@supabase/supabase-js');

// Fungsi: Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validasi field wajib
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      pesan: 'Email dan password wajib diisi'
    });
  }

  // Client sekali-pakai khusus login (biar sesi user nggak nulari client utama)
  const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email, password
  });

  if (error) {
    return res.status(401).json({ status: 'error', pesan: 'Email atau password salah' });
  }

  // Ambil juga profil dari tabel pengguna (biar frontend langsung dapet data user)
  const { data: profil } = await supabase
    .from('pengguna')
    .select('*')
    .eq('id', data.user.id)
    .single();

  res.json({
    status: 'success',
    pesan: 'Login berhasil',
    token: data.session.access_token,   // ← ini "gelang"-nya
    data: profil
  });
};

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
  // Pakai upsert, bukan insert — soalnya trigger on_auth_user_created di Supabase
  // udah otomatis bikin baris kosong pas createUser() di atas, jadi ini nyusul isi datanya
  const { data: profil, error: profilError } = await supabase
    .from('pengguna')
    .upsert({
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

// Fungsi: Kirim email lupa password (link reset dari Supabase)
const lupaPassword = async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ status: 'error', pesan: 'Email wajib diisi' });
  }

  const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  // Selalu jawab sukses walau email nggak terdaftar — biar orang lain nggak bisa
  // nebak-nebak email siapa aja yang punya akun (privasi user)
  if (error) {
    console.error('Gagal kirim email reset password:', error.message);
  }

  res.json({
    status: 'success',
    pesan: 'Kalau email tersebut terdaftar, link reset password sudah dikirim. Cek inbox/folder spam kamu.'
  });
};

// Fungsi: Set password baru pakai token dari link email reset
const resetPassword = async (req, res) => {
  const { access_token, password_baru } = req.body || {};

  if (!access_token || !password_baru) {
    return res.status(400).json({ status: 'error', pesan: 'Token dan password baru wajib diisi' });
  }
  if (password_baru.length < 6) {
    return res.status(400).json({ status: 'error', pesan: 'Password minimal 6 karakter' });
  }

  // Validasi token & cari tau ini punya siapa
  const { data: userData, error: userError } = await supabase.auth.getUser(access_token);
  if (userError || !userData?.user) {
    return res.status(401).json({ status: 'error', pesan: 'Link reset password tidak valid atau sudah kedaluwarsa' });
  }

  // Update password lewat Admin API
  const { error: updateError } = await supabase.auth.admin.updateUserById(userData.user.id, {
    password: password_baru
  });

  if (updateError) {
    return res.status(400).json({ status: 'error', pesan: updateError.message });
  }

  res.json({ status: 'success', pesan: 'Password berhasil diubah, silakan login dengan password baru.' });
};

module.exports = { register, login, lupaPassword, resetPassword };