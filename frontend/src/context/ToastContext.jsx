import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const gaya = {
  success: { bg: 'bg-white border-green-200', ikon: CheckCircle2, warnaIkon: 'text-green-600' },
  error: { bg: 'bg-white border-red-200', ikon: XCircle, warnaIkon: 'text-red-600' },
};

export function ToastProvider({ children }) {
  const [daftar, setDaftar] = useState([]);

  const tutup = useCallback((id) => {
    setDaftar((d) => d.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((pesan, tipe = 'success', durasi = 4000) => {
    const id = Date.now() + Math.random();
    setDaftar((d) => [...d, { id, pesan, tipe }]);
    if (durasi > 0) {
      setTimeout(() => tutup(id), durasi);
    }
    return id;
  }, [tutup]);

  const value = {
    showToast,
    showSuccess: (pesan, durasi) => showToast(pesan, 'success', durasi),
    showError: (pesan, durasi) => showToast(pesan, 'error', durasi),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
        {daftar.map((t) => {
          const g = gaya[t.tipe] || gaya.success;
          const Ikon = g.ikon;
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 ${g.bg} animate-[slide-top_0.3s_ease]`}
            >
              <Ikon size={18} className={`shrink-0 mt-0.5 ${g.warnaIkon}`} />
              <p className="text-sm text-gray-800 flex-1">{t.pesan}</p>
              <button onClick={() => tutup(t.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider');
  return ctx;
}
