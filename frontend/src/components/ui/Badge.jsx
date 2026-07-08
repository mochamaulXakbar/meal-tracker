const warna = {
  hijau: 'bg-green-100 text-green-800',
  kuning: 'bg-amber-100 text-amber-800',
  merah: 'bg-red-100 text-red-800',
  biru: 'bg-blue-100 text-blue-800',
  abu: 'bg-gray-100 text-gray-700',
};

export default function Badge({ children, color = 'abu', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${warna[color]} ${className}`}
    >
      {children}
    </span>
  );
}
