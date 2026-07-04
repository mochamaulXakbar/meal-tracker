// src/config/gemini.js — jembatan penghubung ke Gemini AI

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pilih model gemini-2.5-flash
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

module.exports = model;