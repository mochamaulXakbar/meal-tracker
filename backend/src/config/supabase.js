// src/config/supabase.js — jembatan penghubung ke database Supabase

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Ambil URL & Key dari file .env (rahasia, nggak ke-push)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Bikin "koneksi" ke Supabase — ini yang dipakai di seluruh backend
const supabase = createClient(supabaseUrl, supabaseKey);

// Ekspor biar bisa dipakai file lain
module.exports = supabase;

