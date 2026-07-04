// src/routes/makananRoutes.js — daftar alamat Pencarian Makanan

const express = require('express');
const router = express.Router();
const { cariMakanan } = require('../controllers/makananController');
const { cekLogin } = require('../middleware/autentikasi');

// Pakai cekLogin biar cuma user yang login yang bisa search (jaga kuota API)
router.get('/cari', cekLogin, cariMakanan);   // GET /api/makanan/cari?q=apple

module.exports = router;