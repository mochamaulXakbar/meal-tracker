// src/routes/artikelRoutes.js — daftar alamat Artikel

const express = require('express');
const router = express.Router();
const { ambilSemua, ambilSatu, tambahArtikel, editArtikel, hapusArtikel } = require('../controllers/artikelController');
const { cekLogin, cekAdmin } = require('../middleware/autentikasi');

// Publik — siapa aja boleh baca
router.get('/', ambilSemua);
router.get('/:id', ambilSatu);

// Admin only — login dulu, lalu cek admin
router.post('/', cekLogin, cekAdmin, tambahArtikel);
router.put('/:id', cekLogin, cekAdmin, editArtikel);
router.delete('/:id', cekLogin, cekAdmin, hapusArtikel);

module.exports = router;