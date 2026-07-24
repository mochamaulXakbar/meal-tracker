const request = require('supertest');
const app = require('../app');
const supabase = require('../src/config/supabase');

// Email unik tiap kali test dijalankan, biar nggak tabrakan sama akun sebelumnya
const emailTest = `jest.${Date.now()}@example.com`;
const passwordTest = 'testjest123';

let token;
let userId;
let riwayatId;

afterAll(async () => {
  // Beres-beres: hapus akun test dari Supabase Auth (ikut hapus baris tabel pengguna)
  if (userId) {
    await supabase.auth.admin.deleteUser(userId);
  }
});

describe('POST /api/auth/register', () => {
  test('tolak kalau email tidak dikirim', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: passwordTest, nama_pengguna: 'jestuser' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  test('tolak kalau password kurang dari 6 karakter', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: emailTest, password: '123', nama_pengguna: 'jestuser' });
    expect(res.status).toBe(400);
  });

  test('berhasil daftar dengan data valid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: emailTest, password: passwordTest, nama_pengguna: 'jestuser' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    userId = res.body.data.id;
  });
});

describe('POST /api/auth/login', () => {
  test('tolak password salah', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: emailTest, password: 'salahpassword' });
    expect(res.status).toBe(401);
  });

  test('berhasil login dan dapat token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: emailTest, password: passwordTest });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });
});

describe('Akses endpoint terproteksi', () => {
  test('tanpa token -> 401', async () => {
    const res = await request(app).get('/api/riwayat');
    expect(res.status).toBe(401);
  });

  test('token asal-asalan -> 401', async () => {
    const res = await request(app)
      .get('/api/riwayat')
      .set('Authorization', 'Bearer token-ngasal');
    expect(res.status).toBe(401);
  });
});

describe('CRUD /api/riwayat (butuh token valid)', () => {
  test('tolak jenis_makan yang tidak dikenal', async () => {
    const res = await request(app)
      .post('/api/riwayat')
      .set('Authorization', `Bearer ${token}`)
      .send({ nama_makanan: 'Nasi', kalori: 300, jenis_makan: 'ngemil' });
    expect(res.status).toBe(400);
  });

  test('tolak kalori negatif', async () => {
    const res = await request(app)
      .post('/api/riwayat')
      .set('Authorization', `Bearer ${token}`)
      .send({ nama_makanan: 'Nasi', kalori: -10, jenis_makan: 'sarapan' });
    expect(res.status).toBe(400);
  });

  test('berhasil tambah riwayat dengan jenis_makan "camilan"', async () => {
    const res = await request(app)
      .post('/api/riwayat')
      .set('Authorization', `Bearer ${token}`)
      .send({ nama_makanan: 'Keripik Jest', kalori: 150, jenis_makan: 'camilan' });
    expect(res.status).toBe(201);
    expect(res.body.data.jenis_makan).toBe('camilan');
    riwayatId = res.body.data.id;
  });

  test('berhasil ambil daftar riwayat', async () => {
    const res = await request(app)
      .get('/api/riwayat')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('berhasil edit riwayat', async () => {
    const res = await request(app)
      .put(`/api/riwayat/${riwayatId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ kalori: 200 });
    expect(res.status).toBe(200);
    expect(res.body.data.kalori).toBe(200);
  });

  test('berhasil hapus riwayat', async () => {
    const res = await request(app)
      .delete(`/api/riwayat/${riwayatId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
