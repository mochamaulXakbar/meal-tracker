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

// Endpoint tes server hidup
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Server Meal Tracker jalan!', tim: 'DB13-G003' });
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});