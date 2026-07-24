// src/routes/mealPlanRoutes.js — daftar alamat AI Meal Planner

const express = require('express');
const router = express.Router();
const { generateMenu, ambilRiwayatMenu, hapusRencanaMenu } = require('../controllers/mealPlanController');
const { cekLogin } = require('../middleware/autentikasi');

router.post('/generate', cekLogin, generateMenu);
router.get('/riwayat', cekLogin, ambilRiwayatMenu);
router.delete('/riwayat/:id', cekLogin, hapusRencanaMenu);

module.exports = router;