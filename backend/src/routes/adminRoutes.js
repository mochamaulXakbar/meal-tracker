// src/routes/adminRoutes.js — daftar alamat khusus admin

const express = require('express');
const router = express.Router();
const { ambilSemuaPengguna, ambilStatistik } = require('../controllers/adminController');
const { cekLogin, cekAdmin } = require('../middleware/autentikasi');

router.get('/pengguna', cekLogin, cekAdmin, ambilSemuaPengguna);
router.get('/statistik', cekLogin, cekAdmin, ambilStatistik);

module.exports = router;
