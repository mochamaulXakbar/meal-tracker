// src/utils/cache.js — cache sederhana in-memory pakai Map + TTL
// Dipakai buat nge-cache respons API pihak ketiga (Edamam, Gemini) biar hemat kuota

const cacheStore = new Map();

// Ambil nilai dari cache. Balikin undefined kalau nggak ada / udah kadaluarsa.
const ambilCache = (kunci) => {
  const item = cacheStore.get(kunci);
  if (!item) return undefined;

  if (Date.now() > item.kadaluarsa) {
    cacheStore.delete(kunci);
    return undefined;
  }
  return item.nilai;
};

// Simpen nilai ke cache. ttlDetik = umur cache dalam detik.
const simpanCache = (kunci, nilai, ttlDetik) => {
  cacheStore.set(kunci, { nilai, kadaluarsa: Date.now() + ttlDetik * 1000 });
};

module.exports = { ambilCache, simpanCache };
