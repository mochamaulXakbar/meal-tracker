// src/routes/chatRoutes.js — daftar alamat AI Diet Buddy

const express = require('express');
const router = express.Router();
const {
  kirimPesan,
  ambilRiwayat,
  hapusPesan,
  hapusSemuaPesan
} = require('../controllers/chatController');
const { cekLogin } = require('../middleware/autentikasi');
const validasi = require('../middleware/validasi');
const { kirimPesanSkema } = require('../middleware/skema');

router.post('/', cekLogin, validasi(kirimPesanSkema), kirimPesan);          // POST   /api/chat        → kirim pesan
router.get('/', cekLogin, ambilRiwayat);         // GET    /api/chat        → ambil riwayat
router.delete('/', cekLogin, hapusSemuaPesan);   // DELETE /api/chat        → hapus SEMUA
router.delete('/:id', cekLogin, hapusPesan);     // DELETE /api/chat/:id    → hapus 1 pesan

module.exports = router;