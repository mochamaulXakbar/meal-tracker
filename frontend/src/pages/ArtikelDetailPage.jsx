import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import Spinner from '../components/ui/Spinner';

export default function ArtikelDetailPage() {
  const { id } = useParams();
  const [artikel, setArtikel] = useState(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    setMemuat(true);
    api
      .get(`/artikel/${id}`)
      .then((res) => setArtikel(res.data))
      .finally(() => setMemuat(false));
  }, [id]);

  if (memuat) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!artikel) {
    return <p className="text-center text-gray-400 py-24">Artikel tidak ditemukan.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/artikel" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6">
        <ArrowLeft size={16} /> Kembali ke Artikel
      </Link>

      {artikel.url_gambar && (
        <img src={artikel.url_gambar} alt={artikel.judul} className="w-full aspect-video object-cover rounded-2xl mb-6" />
      )}

      <span className="text-xs font-medium bg-primary-light text-primary rounded-lg px-2 py-1">
        {artikel.kategori}
      </span>
      <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-6">{artikel.judul}</h1>
      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{artikel.konten}</p>

      {artikel.url_sumber && (
        <a href={artikel.url_sumber} target="_blank" rel="noreferrer" className="inline-block mt-8 text-sm text-primary">
          Sumber referensi →
        </a>
      )}
    </div>
  );
}
