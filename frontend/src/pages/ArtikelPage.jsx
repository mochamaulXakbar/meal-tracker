import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import Spinner from '../components/ui/Spinner';

const kategoriList = ['Semua', 'tips', 'kesehatan', 'resep'];
const labelKategori = { tips: 'Tips', kesehatan: 'Kesehatan', resep: 'Resep' };

export default function ArtikelPage() {
  const [artikel, setArtikel] = useState([]);
  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    setMemuat(true);
    const path = kategoriAktif === 'Semua' ? '/artikel' : `/artikel?kategori=${kategoriAktif}`;
    api
      .get(path)
      .then((res) => setArtikel(res.data))
      .finally(() => setMemuat(false));
  }, [kategoriAktif]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Artikel Edukasi</h1>
      <p className="text-gray-500 mt-1 mb-6">Tips dan informasi seputar nutrisi dan gaya hidup sehat</p>

      <div className="flex gap-2 mb-8">
        {kategoriList.map((k) => (
          <button
            key={k}
            onClick={() => setKategoriAktif(k)}
            className={`text-sm px-3 py-1.5 rounded-full border transition ${
              kategoriAktif === k
                ? 'bg-primary text-white border-primary'
                : 'border-gray-300 hover:border-primary hover:text-primary'
            }`}
          >
            {labelKategori[k] || k}
          </button>
        ))}
      </div>

      {memuat ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : artikel.length === 0 ? (
        <p className="text-gray-400 text-center py-16">Belum ada artikel di kategori ini.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {artikel.map((a) => (
            <Link key={a.id} to={`/artikel/${a.id}`} className="group">
              <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-video relative">
                {a.url_gambar && (
                  <img src={a.url_gambar} alt={a.judul} className="w-full h-full object-cover" />
                )}
                <span className="absolute top-3 left-3 text-xs font-medium bg-white/90 text-gray-700 rounded-lg px-2 py-1">
                  {labelKategori[a.kategori] || a.kategori}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mt-3 line-clamp-2 group-hover:text-primary transition">
                {a.judul}
              </h3>
              <p className="text-sm text-primary mt-1">Baca selengkapnya →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
