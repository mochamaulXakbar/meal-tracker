// src/routes/beratRoutes.js — daftar alamat Riwayat Berat

const express = require('express');
const router = express.Router();
const { tambahBerat, ambilGrafik, ambilSemua } = require('../controllers/beratController');
const { cekLogin } = require('../middleware/autentikasi');

router.post('/', cekLogin, tambahBerat);          // POST /api/berat
router.get('/grafik', cekLogin, ambilGrafik);     // GET  /api/berat/grafik
router.get('/', cekLogin, ambilSemua);            // GET  /api/berat

module.exports = router;