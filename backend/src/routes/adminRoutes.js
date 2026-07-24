// src/routes/adminRoutes.js — daftar alamat khusus admin

const express = require('express');
const router = express.Router();
const { ambilSemuaPengguna, ambilStatistik, hapusPengguna } = require('../controllers/adminController');
const { cekLogin, cekAdmin } = require('../middleware/autentikasi');

router.get('/pengguna', cekLogin, cekAdmin, ambilSemuaPengguna);
router.get('/statistik', cekLogin, cekAdmin, ambilStatistik);
router.delete('/pengguna/:id', cekLogin, cekAdmin, hapusPengguna);

module.exports = router;
