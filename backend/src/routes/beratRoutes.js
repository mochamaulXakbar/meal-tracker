// src/routes/beratRoutes.js — daftar alamat Riwayat Berat

const express = require('express');
const router = express.Router();
const { tambahBerat, ambilGrafik, ambilSemua } = require('../controllers/beratController');
const { cekLogin } = require('../middleware/autentikasi');
const validasi = require('../middleware/validasi');
const { tambahBeratSkema } = require('../middleware/skema');

router.post('/', cekLogin, validasi(tambahBeratSkema), tambahBerat);          // POST /api/berat
router.get('/grafik', cekLogin, ambilGrafik);     // GET  /api/berat/grafik
router.get('/', cekLogin, ambilSemua);            // GET  /api/berat

module.exports = router;