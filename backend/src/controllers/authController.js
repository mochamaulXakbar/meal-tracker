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

module.exports = { register, login };