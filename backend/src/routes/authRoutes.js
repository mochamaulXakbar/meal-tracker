// src/routes/authRoutes.js — daftar alamat fitur autentikasi

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Batasi percobaan login/register — cegah brute force tebak password
const batasAuth = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 menit
  max: 10,                    // maksimal 10 percobaan per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', pesan: 'Terlalu banyak percobaan, coba lagi beberapa menit lagi' }
});

// POST /register → jalanin fungsi register
router.post('/register', batasAuth, register);
router.post('/login', batasAuth, login);


module.exports = router;

