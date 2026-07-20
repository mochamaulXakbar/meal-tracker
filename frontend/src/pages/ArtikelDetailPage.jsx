import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
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

  const estimasiBaca = Math.max(1, Math.ceil((artikel.konten?.split(' ').length || 0) / 200));

  return (
    <div className="max-w-3xl mx-auto">
     <Link to="/artikel" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 w-fit">
        <ArrowLeft size={16} /> Kembali ke Artikel
      </Link>

      <span className="inline-block text-xs font-bold uppercase tracking-wide bg-primary text-white rounded px-2.5 py-1">
        {artikel.kategori}
      </span>
      <h1 className="text-3xl md:text-[2.6rem] font-bold text-gray-900 mt-4 mb-4 leading-[1.15]">
        {artikel.judul}
      </h1>

      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
        {artikel.dibuat_pada && (
          <span>
            {new Date(artikel.dibuat_pada).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        )}
        <span className="text-gray-300">•</span>
        <span className="flex items-center gap-1">
          <Clock size={13} /> {estimasiBaca} menit baca
        </span>
      </div>

      {artikel.url_gambar && (
        <figure className="mb-8">
          <img
            src={artikel.url_gambar}
            alt={artikel.judul}
            className="w-full aspect-video object-cover rounded-2xl"
          />
        </figure>
      )}

      <div className="max-w-2xl mx-auto">
        <p className="text-gray-800 whitespace-pre-line leading-loose text-[18px] font-serif">
          {artikel.konten}
        </p>

        {artikel.url_sumber && (
          <div className="mt-10 pt-6 border-t border-gray-100">
            
              <a href={artikel.url_sumber}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
            >
              Baca sumber referensi →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}