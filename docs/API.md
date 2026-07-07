# Kontrak API — Meal Tracker and Planner (DB13-G003)

Base URL (lokal): `http://localhost:3000/api`

Semua endpoint yang butuh login mengharuskan header:
```
Authorization: Bearer <token>
```
`<token>` didapat dari response `login`.

Format response selalu JSON dengan minimal field `status` (`success` / `error`).

---

## Auth — `/api/auth`

### POST /auth/register
Body:
```json
{ "email": "a@mail.com", "password": "rahasia123", "nama_pengguna": "akbar", "nama_lengkap": "Akbar" }
```
Response 201:
```json
{ "status": "success", "pesan": "Registrasi berhasil", "data": { "id": "...", "email": "...", "nama_pengguna": "...", "peran": "pengguna" } }
```

### POST /auth/login
Body: `{ "email": "...", "password": "..." }`
Response 200:
```json
{ "status": "success", "pesan": "Login berhasil", "token": "eyJ...", "data": { "id": "...", "email": "...", "nama_lengkap": "...", "berat_kg": null, "tinggi_cm": null, ... } }
```
Rate limit: maks 10 percobaan / 15 menit per IP (berlaku juga untuk register).

---

## Pengguna & Profil — `/api/pengguna` (butuh login)

### GET /pengguna/profil
Ambil data profil user yang sedang login (dipakai untuk load ulang dasbor).
Response: `{ "status": "success", "data": { ...kolom tabel pengguna } }`

### PUT /pengguna/profil
Body (semua field opsional, kirim yang mau diubah saja):
```json
{ "nama_lengkap": "...", "tanggal_lahir": "2000-01-01", "jenis_kelamin": "pria|wanita", "tinggi_cm": 170, "berat_kg": 65, "tingkat_aktivitas": "sedentary|light|moderate|active|very_active" }
```
Response: `{ "status": "success", "pesan": "...", "data": { ...profil terbaru } }`

### GET /pengguna/kalkulasi
Hitung BMI & TDEE dari data profil (profil harus lengkap dulu: berat, tinggi, tanggal_lahir, jenis_kelamin, tingkat_aktivitas).
Response:
```json
{
  "status": "success",
  "data": { "umur": 25, "bmi": 22.5, "kategori_bmi": "Normal", "bmr": 1600, "tdee": 2480, "tingkat_aktivitas": "moderate" }
}
```
Error 400 kalau profil belum lengkap.

---

## Pencarian Makanan — `/api/makanan` (butuh login)

### GET /makanan/cari?q=nasi goreng
Response:
```json
{
  "status": "success",
  "kata_dicari": "nasi goreng",
  "jumlah": 5,
  "data": [
    { "id_makanan": "...", "nama": "Nasi Goreng", "per_takaran": "100 gram", "kalori": 190, "protein": 4.2, "karbohidrat": 25.1, "lemak": 7.8, "gambar": "https://..." }
  ]
}
```
Response ikut menyertakan `"dari_cache": true` kalau kata kunci sama pernah dicari dalam 1 jam terakhir (di-cache di server, bukan dari Edamam langsung).

---

## Riwayat Makanan — `/api/riwayat` (butuh login, CRUD milik sendiri)

### POST /riwayat
Body:
```json
{ "nama_makanan": "Nasi Goreng", "kalori": 190, "protein_g": 4.2, "karbohidrat_g": 25.1, "lemak_g": 7.8, "jenis_makan": "sarapan|siang|malam|camilan", "tanggal_konsumsi": "2026-07-06" }
```
`tanggal_konsumsi` opsional, default hari ini.

### GET /riwayat?tanggal=2026-07-06
Query `tanggal` opsional (filter). Response: `{ status, jumlah, total_kalori, data: [...] }`

### PUT /riwayat/:id — update field yang dikirim saja
### DELETE /riwayat/:id — hapus 1 entri milik sendiri

---

## Riwayat Berat Badan — `/api/berat` (butuh login)

### POST /berat
Body: `{ "berat_kg": 64.5, "tanggal": "2026-07-06" }` (`tanggal` opsional, default hari ini). Otomatis update `berat_kg` di profil juga.

### GET /berat/grafik
Data untuk chart — 1 titik per hari (entri terakhir kalau input >1x sehari).
Response: `{ status, jumlah, data: [{ tanggal, berat_kg }, ...] }` urut lama → baru.

### GET /berat
Semua data mentah (log detail), urut baru → lama.

---

## AI Meal Planner — `/api/meal-plan` (butuh login)

### POST /meal-plan/generate
Body opsional: `{ "pantangan": "alergi kacang, tidak suka ikan" }` — kalau diisi, AI akan menghindari bahan tersebut. Boleh dikosongkan/dihilangkan. TDEE dihitung otomatis dari profil (profil harus lengkap).
Response:
```json
{
  "status": "success",
  "pesan": "Menu berhasil dibuat",
  "data": {
    "total_target_kalori": 2480,
    "menu": {
      "sarapan": { "nama": "...", "kalori": 500, "deskripsi": "..." },
      "makan_siang": { "nama": "...", "kalori": 900, "deskripsi": "..." },
      "makan_malam": { "nama": "...", "kalori": 700, "deskripsi": "..." }
    }
  }
}
```
Di-cache per user selama 5 menit (field `dari_cache: true` kalau hasil dari cache) supaya klik berulang nggak boros kuota Gemini. Tiap hasil generate (di luar cache hit) otomatis disimpan ke tabel `rencana_menu` sebagai riwayat.

### GET /meal-plan/riwayat
Ambil 30 riwayat menu yang pernah di-generate, urut baru → lama.
Response:
```json
{
  "status": "success",
  "jumlah": 2,
  "data": [
    { "id": "...", "id_pengguna": "...", "tanggal_rencana": "2026-07-06", "target_kalori": 2480, "total_kalori": 2100, "menu": { "sarapan": {...}, "makan_siang": {...}, "makan_malam": {...} }, "dibuat_pada": "..." }
  ]
}
```

---

## AI Diet Buddy (Chatbot) — `/api/chat` (butuh login)

### POST /chat
Body: `{ "pesan": "Apa itu defisit kalori?" }`
Response: `{ "status": "success", "data": { "pesan_user": "...", "balasan_bot": "..." } }`
Catatan: konteks yang dikirim ke Gemini dibatasi 20 pesan terakhir.

### GET /chat
Semua riwayat chat user, urut lama → baru.
Response: `{ status, jumlah, data: [{ id, pengirim: "pengguna"|"ai", isi_pesan, dibuat_pada }] }`

### DELETE /chat/:id — hapus 1 pesan milik sendiri
### DELETE /chat — hapus semua riwayat chat milik sendiri

---

## Artikel Edukasi — `/api/artikel`

### GET /artikel?kategori=resep — publik, tanpa login
### GET /artikel/:id — publik

### POST /artikel/upload-gambar — admin only
Body: `multipart/form-data`, field `gambar` (file, maks 5MB, harus image/*).
Response: `{ "status": "success", "data": { "url": "https://....supabase.co/storage/v1/object/public/artikel-gambar/..." } }`
Panggil ini dulu buat dapetin URL-nya, baru isi hasilnya ke field `url_gambar` pas POST/PUT artikel di bawah.

### POST /artikel — admin only (login + peran `admin`)
Body: `{ "judul": "...", "kategori": "...", "konten": "...", "url_sumber": "...", "url_gambar": "..." }`

### PUT /artikel/:id — admin only, field opsional
### DELETE /artikel/:id — admin only

---

## Admin — `/api/admin` (butuh login + peran `admin`)

### GET /admin/pengguna
Daftar semua pengguna terdaftar, urut baru → lama.
Response:
```json
{
  "status": "success",
  "jumlah": 42,
  "data": [
    { "id": "...", "nama_pengguna": "...", "nama_lengkap": "...", "email": "...", "peran": "pengguna", "dibuat_pada": "..." }
  ]
}
```

### GET /admin/statistik
Statistik pertumbuhan pengguna.
Response:
```json
{
  "status": "success",
  "data": {
    "total_pengguna": 42,
    "baru_7_hari_terakhir": 5,
    "pertumbuhan_harian": [
      { "tanggal": "2026-07-01", "jumlah": 2 },
      { "tanggal": "2026-07-02", "jumlah": 1 }
    ]
  }
}
```
`pertumbuhan_harian` mencakup 30 hari terakhir, urut lama → baru — cocok buat data grafik.

---

## Format Error Umum
```json
{ "status": "error", "pesan": "Penjelasan error" }
```
- `400` — validasi gagal / body kosong
- `401` — token tidak ada / tidak valid
- `403` — bukan admin (khusus endpoint artikel tulis)
- `404` — data tidak ditemukan / bukan milik user
- `429` — kena rate limit (auth)
- `500` — error server / gagal panggil API pihak ketiga
