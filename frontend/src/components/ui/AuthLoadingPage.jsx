import { Utensils } from 'lucide-react';

export default function AuthLoadingPage({ title = 'Memproses...' }) {
  return (
    <div className="min-h-screen bg-primary-light flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white/90 p-8 text-center shadow-xl backdrop-blur">
        <div className="mx-auto mb-5 flex h-20 w-20 animate-spin items-center justify-center rounded-full border-4 border-primary/20 border-t-primary bg-white text-primary">
          <Utensils size={30} />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
