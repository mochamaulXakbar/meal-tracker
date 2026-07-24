// src/middleware/validasi.js — pos pemeriksa bentuk data (pakai Joi)

// Bungkus skema Joi jadi middleware Express. Kalau data nggak sesuai skema,
// langsung ditolak dengan pesan yang jelas, sebelum nyampe ke controller.
const validasi = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body || {}, {
    abortEarly: false,   // kumpulin semua error, jangan cuma yang pertama
    stripUnknown: true,  // buang field yang nggak dikenal skema
  });

  if (error) {
    const pesan = error.details.map((d) => d.message).join('; ');
    return res.status(400).json({ status: 'error', pesan });
  }

  req.body = value;   // pakai versi yang udah dibersihin/di-cast Joi
  next();
};

module.exports = validasi;
