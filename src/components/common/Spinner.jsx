export default function Spinner({ size = 'md', label = 'Loading…', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10', xl: 'h-16 w-16' };
  return (
    <div role="status" className={`flex flex-col items-center gap-3 ${className}`}>
      <svg
        className={`animate-spin text-indigo-400 ${sizes[size]}`}
        viewBox="0 0 24 24" fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label && <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>}
      <span className="sr-only">{label}</span>
    </div>
  );
}
