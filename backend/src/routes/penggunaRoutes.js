// src/routes/penggunaRoutes.js — daftar alamat fitur pengguna

const express = require('express');
const router = express.Router();
const { ambilProfil, lengkapiProfil, hitungKalkulasi } = require('../controllers/penggunaController');
const { cekLogin } = require('../middleware/autentikasi');

// GET /profil → ambil data profil pengguna yang login
router.get('/profil', cekLogin, ambilProfil);

// PUT /profil → lewat satpam dulu (cekLogin), baru jalanin lengkapiProfil
router.put('/profil', cekLogin, lengkapiProfil);
router.get('/kalkulasi', cekLogin, hitungKalkulasi);

module.exports = router;