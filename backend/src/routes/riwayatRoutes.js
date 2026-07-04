// src/routes/riwayatRoutes.js — daftar alamat Riwayat Makanan

const express = require('express');
const router = express.Router();
const { tambahRiwayat, ambilRiwayat, editRiwayat, hapusRiwayat } = require('../controllers/riwayatController');
const { cekLogin } = require('../middleware/autentikasi');

router.post('/', cekLogin, tambahRiwayat);       // POST   /api/riwayat
router.get('/', cekLogin, ambilRiwayat);         // GET    /api/riwayat
router.put('/:id', cekLogin, editRiwayat);       // PUT    /api/riwayat/:id
router.delete('/:id', cekLogin, hapusRiwayat);   // DELETE /api/riwayat/:id

module.exports = router;