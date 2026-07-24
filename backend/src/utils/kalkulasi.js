// src/utils/kalkulasi.js — fungsi murni buat hitung umur, BMI, BMR, TDEE
// Dipisah dari controller biar gampang di-unit-test tanpa perlu database

const faktorAktivitas = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
};

// Hitung umur dari tanggal lahir. Parameter `sekarang` opsional (default: waktu asli)
// biar hasilnya bisa dites deterministik tanpa tanggal ikut berubah tiap hari.
function hitungUmur(tanggalLahir, sekarang = new Date()) {
  const lahir = new Date(tanggalLahir);
  let umur = sekarang.getFullYear() - lahir.getFullYear();
  const belumUltah =
    sekarang.getMonth() < lahir.getMonth() ||
    (sekarang.getMonth() === lahir.getMonth() && sekarang.getDate() < lahir.getDate());
  if (belumUltah) umur--;
  return umur;
}

// BMI = berat(kg) / tinggi(m)^2, dibulatkan 1 desimal
function hitungBMI(beratKg, tinggiCm) {
  const tinggiM = tinggiCm / 100;
  return Math.round((beratKg / (tinggiM * tinggiM)) * 10) / 10;
}

// Kategori BMI standar WHO
function kategoriBMI(bmi) {
  if (bmi < 18.5) return 'Kurus';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Gemuk';
  return 'Obesitas';
}

// BMR pakai rumus Mifflin-St Jeor
function hitungBMR({ beratKg, tinggiCm, umur, jenisKelamin }) {
  let bmr = 10 * beratKg + 6.25 * tinggiCm - 5 * umur;
  bmr += jenisKelamin === 'pria' ? 5 : -161;
  return bmr;
}

// TDEE = BMR x faktor aktivitas
function hitungTDEE(bmr, tingkatAktivitas) {
  const faktor = faktorAktivitas[tingkatAktivitas] || 1.2;
  return Math.round(bmr * faktor);
}

module.exports = { hitungUmur, hitungBMI, kategoriBMI, hitungBMR, hitungTDEE, faktorAktivitas };
