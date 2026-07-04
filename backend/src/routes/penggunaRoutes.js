// src/routes/penggunaRoutes.js — daftar alamat fitur pengguna

const express = require('express');
const router = express.Router();
const { lengkapiProfil, hitungKalkulasi } = require('../controllers/penggunaController');
const { cekLogin } = require('../middleware/autentikasi');

// PUT /profil → lewat satpam dulu (cekLogin), baru jalanin lengkapiProfil
router.put('/profil', cekLogin, lengkapiProfil);
router.get('/kalkulasi', cekLogin, hitungKalkulasi);

module.exports = router;