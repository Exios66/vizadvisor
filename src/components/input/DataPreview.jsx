import { TYPE_LABELS, formatCardinality, truncate } from '../../utils/formatters';

const TYPE_OPTIONS = ['quantitative','ordinal','nominal','temporal','geographic','boolean'];

export default function DataPreview({ schema, sampleRows, rowCount, onTypeOverride }) {
  if (!schema || !sampleRows) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Schema Preview</h3>
        <span className="text-xs text-slate-500">{rowCount?.toLocaleString()} rows · {schema.length} columns</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-left">
              <th className="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium">Column</th>
              <th className="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium">Type</th>
              <th className="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium">Cardinality</th>
              <th className="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium">Range</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {schema.map((col) => (
              <tr key={col.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-3 py-2 font-mono text-slate-800 dark:text-slate-200 max-w-[160px] truncate"
                    title={col.name}>{col.name}</td>
                <td className="px-3 py-2">
                  <select
                    value={col.type}
                    onChange={(e) => onTypeOverride?.(col.name, e.target.value)}
                    aria-label={`Column type for ${col.name}`}
                    className="text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs">{formatCardinality(col.cardinality)}</td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs font-mono">{col.range ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors select-none">
          ▸ Show sample rows ({sampleRows.length})
        </summary>
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="text-xs w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                {schema.map((col) => (
                  <th key={col.name} className="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium text-left whitespace-nowrap">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {sampleRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  {schema.map((col) => (
                    <td key={col.name} className="px-3 py-1.5 text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap">
                      {truncate(String(row[col.name] ?? '—'), 40)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
