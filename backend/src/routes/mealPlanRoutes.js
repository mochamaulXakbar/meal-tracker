// src/routes/mealPlanRoutes.js — daftar alamat AI Meal Planner

const express = require('express');
const router = express.Router();
const { generateMenu } = require('../controllers/mealPlanController');
const { cekLogin } = require('../middleware/autentikasi');

router.post('/generate', cekLogin, generateMenu);

module.exports = router;