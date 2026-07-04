// src/routes/authRoutes.js — daftar alamat fitur autentikasi

const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');

// POST /register → jalanin fungsi register
router.post('/register', register);

module.exports = router;