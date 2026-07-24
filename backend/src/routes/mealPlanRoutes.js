// src/routes/mealPlanRoutes.js — daftar alamat AI Meal Planner

const express = require('express');
const router = express.Router();
const { generateMenu, ambilRiwayatMenu, hapusRencanaMenu } = require('../controllers/mealPlanController');
const { cekLogin } = require('../middleware/autentikasi');
const validasi = require('../middleware/validasi');
const { generateMenuSkema } = require('../middleware/skema');

router.post('/generate', cekLogin, validasi(generateMenuSkema), generateMenu);
router.get('/riwayat', cekLogin, ambilRiwayatMenu);
router.delete('/riwayat/:id', cekLogin, hapusRencanaMenu);

module.exports = router;