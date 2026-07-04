// server.js — sakelar utama: nyalain server & pasang rute

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Pasang rute auth → semua alamatnya diawali /api/auth
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Pasang rute pengguna → semua alamatnya diawali /api/pengguna
const penggunaRoutes = require('./src/routes/penggunaRoutes');
app.use('/api/pengguna', penggunaRoutes);

// Pasang rute AI Meal Planner → semua alamatnya diawali /api/meal-plan
const mealPlanRoutes = require('./src/routes/mealPlanRoutes');
app.use('/api/meal-plan', mealPlanRoutes);

// Pasang rute chatbot Diet Buddy → semua alamatnya diawali /api/chat
const chatRoutes = require('./src/routes/chatRoutes');
app.use('/api/chat', chatRoutes);

// Pasang rute riwayat makanan → semua alamatnya diawali /api/riwayat
const riwayatRoutes = require('./src/routes/riwayatRoutes');
app.use('/api/riwayat', riwayatRoutes);

// Pasang rute pencarian makanan → semua alamatnya diawali /api/makanan
const makananRoutes = require('./src/routes/makananRoutes');
app.use('/api/makanan', makananRoutes);

// Pasang rute artikel → semua alamatnya diawali /api/artikel
const artikelRoutes = require('./src/routes/artikelRoutes');
app.use('/api/artikel', artikelRoutes);

// Pasang rute riwayat berat → semua alamatnya diawali /api/berat
const beratRoutes = require('./src/routes/beratRoutes');
app.use('/api/berat', beratRoutes);

// Endpoint tes server hidup
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Server Meal Tracker jalan!', tim: 'DB13-G003' });
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});