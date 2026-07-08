const varian = {
  primary: 'bg-primary hover:bg-primary-dark text-white',
  secondary: 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 h-11 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${varian[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
