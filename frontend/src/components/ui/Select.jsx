export default function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={`h-12 rounded-xl border border-gray-300 px-4 text-base bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
