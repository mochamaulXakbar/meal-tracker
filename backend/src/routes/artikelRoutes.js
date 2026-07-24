// src/routes/artikelRoutes.js — daftar alamat Artikel

const express = require('express');
const multer = require('multer');
const router = express.Router();
const { ambilSemua, ambilSatu, tambahArtikel, editArtikel, hapusArtikel, uploadGambar } = require('../controllers/artikelController');
const { cekLogin, cekAdmin } = require('../middleware/autentikasi');
const validasi = require('../middleware/validasi');
const { tambahArtikelSkema, editArtikelSkema } = require('../middleware/skema');

// Simpen file di memori dulu (bukan disk) — langsung diteruskan ke Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // maks 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('File harus berupa gambar'));
    cb(null, true);
  }
});

// Publik — siapa aja boleh baca
router.get('/', ambilSemua);
router.get('/:id', ambilSatu);

// Admin only — login dulu, lalu cek admin
router.post('/upload-gambar', cekLogin, cekAdmin, upload.single('gambar'), uploadGambar);
router.post('/', cekLogin, cekAdmin, validasi(tambahArtikelSkema), tambahArtikel);
router.put('/:id', cekLogin, cekAdmin, validasi(editArtikelSkema), editArtikel);
router.delete('/:id', cekLogin, cekAdmin, hapusArtikel);

module.exports = router;