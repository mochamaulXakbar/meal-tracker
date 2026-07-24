// src/middleware/skema.js — kumpulan skema Joi buat validasi tiap endpoint

const Joi = require('joi');

// Pesan error dalam Bahasa Indonesia — biar konsisten sama seluruh aplikasi
// (Joi defaultnya bahasa Inggris)
const pesanUmum = {
  'any.required': '{{#label}} wajib diisi',
  'any.only': '{{#label}} harus salah satu dari: {{#valids}}',
  'string.empty': '{{#label}} tidak boleh kosong',
  'string.email': '{{#label}} harus berupa email yang valid',
  'string.min': '{{#label}} minimal {{#limit}} karakter',
  'string.max': '{{#label}} maksimal {{#limit}} karakter',
  'string.uri': '{{#label}} harus berupa URL yang valid',
  'number.base': '{{#label}} harus berupa angka',
  'number.min': '{{#label}} minimal {{#limit}}',
  'number.max': '{{#label}} maksimal {{#limit}}',
  'number.positive': '{{#label}} harus lebih dari 0',
  'date.base': '{{#label}} harus berupa tanggal yang valid (format YYYY-MM-DD)',
  'date.format': '{{#label}} harus berupa tanggal yang valid (format YYYY-MM-DD)',
  'object.min': 'Minimal harus ada 1 data yang dikirim',
};

// --- Auth ---
const registerSkema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nama_pengguna: Joi.string().min(3).max(50).required(),
  nama_lengkap: Joi.string().max(100).allow('', null),
}).messages(pesanUmum);

const loginSkema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).messages(pesanUmum);

const lupaPasswordSkema = Joi.object({
  email: Joi.string().email().required(),
}).messages(pesanUmum);

const resetPasswordSkema = Joi.object({
  access_token: Joi.string().required(),
  password_baru: Joi.string().min(6).required(),
}).messages(pesanUmum);

// --- Pengguna / Profil ---
const lengkapiProfilSkema = Joi.object({
  nama_lengkap: Joi.string().max(100),
  tanggal_lahir: Joi.date().iso(),
  jenis_kelamin: Joi.string().valid('pria', 'wanita'),
  tinggi_cm: Joi.number().positive().max(300),
  berat_kg: Joi.number().positive().max(500),
  tingkat_aktivitas: Joi.string().valid('sedentary', 'light', 'moderate', 'active', 'very_active'),
}).min(1).messages(pesanUmum);

// --- Riwayat Makanan ---
const tambahRiwayatSkema = Joi.object({
  nama_makanan: Joi.string().min(1).max(150).required(),
  kalori: Joi.number().min(0).required(),
  protein_g: Joi.number().min(0).default(0),
  karbohidrat_g: Joi.number().min(0).default(0),
  lemak_g: Joi.number().min(0).default(0),
  jenis_makan: Joi.string().valid('sarapan', 'siang', 'malam', 'camilan').required(),
  tanggal_konsumsi: Joi.date().iso(),
}).messages(pesanUmum);

const editRiwayatSkema = Joi.object({
  nama_makanan: Joi.string().min(1).max(150),
  kalori: Joi.number().min(0),
  protein_g: Joi.number().min(0),
  karbohidrat_g: Joi.number().min(0),
  lemak_g: Joi.number().min(0),
  jenis_makan: Joi.string().valid('sarapan', 'siang', 'malam', 'camilan'),
  tanggal_konsumsi: Joi.date().iso(),
}).min(1).messages(pesanUmum);

// --- Riwayat Berat ---
const tambahBeratSkema = Joi.object({
  berat_kg: Joi.number().positive().max(500).required(),
  tanggal: Joi.date().iso(),
}).messages(pesanUmum);

// --- Meal Plan (AI) ---
const generateMenuSkema = Joi.object({
  pantangan: Joi.string().max(200).allow('', null),
}).messages(pesanUmum);

// --- Chat (AI Diet Buddy) ---
const kirimPesanSkema = Joi.object({
  pesan: Joi.string().min(1).max(1000).required(),
}).messages(pesanUmum);

// --- Artikel ---
const tambahArtikelSkema = Joi.object({
  judul: Joi.string().min(1).max(200).required(),
  kategori: Joi.string().valid('tips', 'kesehatan', 'resep').allow('', null),
  konten: Joi.string().min(1).required(),
  url_sumber: Joi.string().uri().allow('', null),
  url_gambar: Joi.string().uri().allow('', null),
}).messages(pesanUmum);

const editArtikelSkema = Joi.object({
  judul: Joi.string().min(1).max(200),
  kategori: Joi.string().valid('tips', 'kesehatan', 'resep').allow('', null),
  konten: Joi.string().min(1),
  url_sumber: Joi.string().uri().allow('', null),
  url_gambar: Joi.string().uri().allow('', null),
}).min(1).messages(pesanUmum);

module.exports = {
  registerSkema,
  loginSkema,
  lupaPasswordSkema,
  resetPasswordSkema,
  lengkapiProfilSkema,
  tambahRiwayatSkema,
  editRiwayatSkema,
  tambahBeratSkema,
  generateMenuSkema,
  kirimPesanSkema,
  tambahArtikelSkema,
  editArtikelSkema,
};
