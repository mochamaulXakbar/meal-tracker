// src/routes/penggunaRoutes.js — daftar alamat fitur pengguna

const express = require('express');
const router = express.Router();
const { lengkapiProfil } = require('../controllers/penggunaController');
const { cekLogin } = require('../middleware/autentikasi');   // ← import satpam

// PUT /profil → lewat satpam dulu (cekLogin), baru jalanin lengkapiProfil
router.put('/profil', cekLogin, lengkapiProfil);

module.exports = router;