// src/routes/chatRoutes.js — daftar alamat AI Diet Buddy

const express = require('express');
const router = express.Router();
const { kirimPesan, ambilRiwayat } = require('../controllers/chatController');
const { cekLogin } = require('../middleware/autentikasi');

router.post('/', cekLogin, kirimPesan);   // POST /api/chat
router.get('/', cekLogin, ambilRiwayat);  // GET  /api/chat

module.exports = router;