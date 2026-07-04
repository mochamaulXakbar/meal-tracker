// src/routes/authRoutes.js — daftar alamat fitur autentikasi

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// POST /register → jalanin fungsi register
router.post('/register', register);
router.post('/login', login); 

module.exports = router;