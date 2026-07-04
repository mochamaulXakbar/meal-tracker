// src/routes/penggunaRoutes.js — daftar alamat fitur pengguna

const express = require('express');
const router = express.Router();
const { lengkapiProfil } = require('../controllers/penggunaController');

// PUT /:id/profil → lengkapi profil (SEMENTARA pakai id di URL)
router.put('/:id/profil', lengkapiProfil);

module.exports = router;