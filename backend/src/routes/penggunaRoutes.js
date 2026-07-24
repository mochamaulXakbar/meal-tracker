// src/routes/penggunaRoutes.js — daftar alamat fitur pengguna

const express = require('express');
const multer = require('multer');
const router = express.Router();
const { ambilProfil, lengkapiProfil, hitungKalkulasi, uploadFotoProfil } = require('../controllers/penggunaController');
const { cekLogin } = require('../middleware/autentikasi');
const validasi = require('../middleware/validasi');
const { lengkapiProfilSkema } = require('../middleware/skema');

// Simpen file di memori dulu (bukan disk) — langsung diteruskan ke Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // maks 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('File harus berupa gambar'));
    cb(null, true);
  }
});

// GET /profil → ambil data profil pengguna yang login
router.get('/profil', cekLogin, ambilProfil);

// PUT /profil → lewat satpam dulu (cekLogin), baru jalanin lengkapiProfil
router.put('/profil', cekLogin, validasi(lengkapiProfilSkema), lengkapiProfil);
router.get('/kalkulasi', cekLogin, hitungKalkulasi);
router.post('/foto', cekLogin, upload.single('foto'), uploadFotoProfil);

module.exports = router;