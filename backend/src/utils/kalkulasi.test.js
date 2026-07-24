const { hitungUmur, hitungBMI, kategoriBMI, hitungBMR, hitungTDEE } = require('./kalkulasi');

describe('hitungUmur', () => {
  test('umur pas kalau ulang tahun sudah lewat tahun ini', () => {
    const sekarang = new Date('2026-07-24');
    expect(hitungUmur('2000-01-01', sekarang)).toBe(26);
  });

  test('umur belum nambah kalau ulang tahun belum lewat tahun ini', () => {
    const sekarang = new Date('2026-07-24');
    expect(hitungUmur('2000-12-31', sekarang)).toBe(25);
  });

  test('umur pas kalau hari ini persis hari ulang tahun', () => {
    const sekarang = new Date('2026-07-24');
    expect(hitungUmur('2000-07-24', sekarang)).toBe(26);
  });
});

describe('hitungBMI', () => {
  test('hitung BMI dengan benar dan dibulatkan 1 desimal', () => {
    // 70kg / (1.70m)^2 = 24.221... -> 24.2
    expect(hitungBMI(70, 170)).toBe(24.2);
  });

  test('BMI orang tinggi & berat kecil', () => {
    // 45kg / (1.60m)^2 = 17.578... -> 17.6
    expect(hitungBMI(45, 160)).toBe(17.6);
  });
});

describe('kategoriBMI', () => {
  test('di bawah 18.5 -> Kurus', () => {
    expect(kategoriBMI(17.9)).toBe('Kurus');
  });
  test('18.5 sampai di bawah 25 -> Normal', () => {
    expect(kategoriBMI(18.5)).toBe('Normal');
    expect(kategoriBMI(24.9)).toBe('Normal');
  });
  test('25 sampai di bawah 30 -> Gemuk', () => {
    expect(kategoriBMI(25)).toBe('Gemuk');
    expect(kategoriBMI(29.9)).toBe('Gemuk');
  });
  test('30 ke atas -> Obesitas', () => {
    expect(kategoriBMI(30)).toBe('Obesitas');
    expect(kategoriBMI(40)).toBe('Obesitas');
  });
});

describe('hitungBMR', () => {
  test('pria: BMR pakai +5', () => {
    const bmr = hitungBMR({ beratKg: 70, tinggiCm: 170, umur: 26, jenisKelamin: 'pria' });
    // 10*70 + 6.25*170 - 5*26 + 5 = 700 + 1062.5 - 130 + 5 = 1637.5
    expect(bmr).toBe(1637.5);
  });

  test('wanita: BMR pakai -161', () => {
    const bmr = hitungBMR({ beratKg: 60, tinggiCm: 160, umur: 30, jenisKelamin: 'wanita' });
    // 10*60 + 6.25*160 - 5*30 - 161 = 600 + 1000 - 150 - 161 = 1289
    expect(bmr).toBe(1289);
  });
});

describe('hitungTDEE', () => {
  test('faktor aktivitas sedentary', () => {
    expect(hitungTDEE(1637.5, 'sedentary')).toBe(Math.round(1637.5 * 1.2));
  });

  test('faktor aktivitas very_active', () => {
    expect(hitungTDEE(1637.5, 'very_active')).toBe(Math.round(1637.5 * 1.9));
  });

  test('tingkat aktivitas tidak dikenal -> fallback ke faktor sedentary', () => {
    expect(hitungTDEE(1637.5, 'ngasal')).toBe(Math.round(1637.5 * 1.2));
  });
});
