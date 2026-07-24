import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ halaman, totalHalaman, onChange }) {
  if (totalHalaman <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onChange(halaman - 1)}
        disabled={halaman <= 1}
        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-gray-500">
        Halaman <span className="font-medium text-gray-900">{halaman}</span> dari{' '}
        <span className="font-medium text-gray-900">{totalHalaman}</span>
      </span>
      <button
        onClick={() => onChange(halaman + 1)}
        disabled={halaman >= totalHalaman}
        className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
