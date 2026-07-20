import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Trash2, User } from 'lucide-react';
import { api } from '../lib/api';
import Spinner from '../components/ui/Spinner';

const contohPertanyaan = [
  'Makanan tinggi protein rendah lemak?',
  'Cara menurunkan berat badan?',
  'Menu sarapan sehat?',
  'Berapa kalori untuk diet?',
];

export default function DietBuddyPage() {
  const [pesan, setPesan] = useState([]);
  const [input, setInput] = useState('');
  const [memuat, setMemuat] = useState(true);
  const [mengirim, setMengirim] = useState(false);
  const [error, setError] = useState('');
  const bawahRef = useRef(null);

  async function muatRiwayat() {
    setMemuat(true);
    try {
      const res = await api.get('/chat');
      setPesan(res.data);
    } finally {
      setMemuat(false);
    }
  }

  useEffect(() => {
    muatRiwayat();
  }, []);

  useEffect(() => {
    bawahRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pesan]);

  async function kirim(teks) {
    const isiPesan = teks ?? input;
    if (!isiPesan.trim()) return;
    setInput('');
    setError('');
    setMengirim(true);
    setPesan((p) => [...p, { id: `sementara-${Date.now()}`, pengirim: 'pengguna', isi_pesan: isiPesan }]);
    try {
      await api.post('/chat', { pesan: isiPesan });
      await muatRiwayat();
    } catch (err) {
      setError(err.message || 'Gagal mengirim pesan, AI Diet Buddy sedang sibuk. Coba lagi sebentar.');
      setPesan((p) => p.filter((m) => !String(m.id).startsWith('sementara-')));
    } finally {
      setMengirim(false);
    }
  }

  async function hapusPesan(id) {
    if (String(id).startsWith('sementara-')) return;
    try {
      await api.delete(`/chat/${id}`);
      muatRiwayat();
    } catch (err) {
      setError(err.message);
    }
  }

  async function hapusSemua() {
    try {
      await api.delete('/chat');
      setPesan([]);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
            <Bot size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">AI Diet Buddy</p>
            <p className="text-xs text-gray-400">Tanya apa saja tentang nutrisi & diet</p>
          </div>
        </div>
        {pesan.length > 0 && (
          <button onClick={hapusSemua} className="text-sm text-gray-400 hover:text-red-600 flex items-center gap-1">
            <Trash2 size={14} /> Hapus Semua
          </button>
        )}
      </div>

     <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
        { pesan.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mb-4">
              <Bot size={26} className="text-primary" />
            </div>
            <p className="font-medium text-gray-900 mb-1">Halo! Tanyakan apa saja seputar nutrisi, diet, kalori, atau kebiasaan makan sehat.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-md">
              {contohPertanyaan.map((q) => (
                <button
                  key={q}
                  onClick={() => kirim(q)}
                  className="text-sm px-3 py-1.5 rounded-full border border-gray-300 hover:border-primary hover:text-primary transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          pesan.map((p) => (
            <div key={p.id} className={`group flex gap-2 ${p.pengirim === 'pengguna' ? 'justify-end' : 'justify-start'}`}>
              {p.pengirim === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-primary" />
                </div>
              )}
              <div
                className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                  p.pengirim === 'pengguna' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {p.isi_pesan}
              </div>
              {p.pengirim === 'pengguna' ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <User size={14} className="text-gray-500" />
                </div>
              ) : (
                <button
                  onClick={() => hapusPesan(p.id)}
                  className="opacity-0 group-hover:opacity-100 transition text-gray-300 hover:text-red-600 self-center"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}

        {mengirim && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <Bot size={14} className="text-primary" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={bawahRef} />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2.5 mt-3">{error}</div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          kirim();
        }}
        className="flex gap-3 pt-4 border-t border-gray-200 mt-4"
      >
        <input
          className="flex-1 h-11 rounded-xl border border-gray-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Tanya tentang nutrisi, diet, atau makanan sehat..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={mengirim}
        />
        <button
          type="submit"
          disabled={mengirim}
          className="w-11 h-11 rounded-xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
