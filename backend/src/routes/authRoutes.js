// src/routes/authRoutes.js — daftar alamat fitur autentikasi

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, lupaPassword, resetPassword } = require('../controllers/authController');
const validasi = require('../middleware/validasi');
const {
  registerSkema, loginSkema, lupaPasswordSkema, resetPasswordSkema
} = require('../middleware/skema');

// Batasi percobaan login/register — cegah brute force tebak password
const batasAuth = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 menit
  max: 10,                    // maksimal 10 percobaan per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', pesan: 'Terlalu banyak percobaan, coba lagi beberapa menit lagi' }
});

// POST /register → jalanin fungsi register
router.post('/register', batasAuth, validasi(registerSkema), register);
router.post('/login', batasAuth, validasi(loginSkema), login);
router.post('/lupa-password', batasAuth, validasi(lupaPasswordSkema), lupaPassword);
router.post('/reset-password', batasAuth, validasi(resetPasswordSkema), resetPassword);


module.exports = router;

