export function formatNumber(n, opts = {}) {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', opts).format(n);
}

export function formatFileSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 ** 2)   return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3)   return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export function formatRowCount(n) {
  if (n == null) return '—';
  return formatNumber(n);
}

export function formatCardinality(n) {
  if (n == null) return '—';
  if (n > 1000) return `${formatNumber(n)} unique values`;
  return `${n} unique`;
}

export function truncate(str, max = 60) {
  if (!str) return '';
  return str.length <= max ? str : `${str.slice(0, max)}…`;
}

export const TYPE_LABELS = {
  quantitative: 'Numeric',
  ordinal:      'Ordinal',
  nominal:      'Categorical',
  temporal:     'Date/Time',
  geographic:   'Geographic',
  boolean:      'Boolean',
  unknown:      'Unknown',
};

export const TYPE_COLORS = {
  quantitative: 'text-sky-400',
  ordinal:      'text-violet-400',
  nominal:      'text-amber-400',
  temporal:     'text-emerald-400',
  geographic:   'text-rose-400',
  boolean:      'text-teal-400',
  unknown:      'text-slate-400',
};
