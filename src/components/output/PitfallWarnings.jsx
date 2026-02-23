export default function PitfallWarnings({ pitfalls }) {
  if (!pitfalls?.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200">Pitfalls to Avoid</h3>
      <div className="space-y-2">
        {pitfalls.map((p, i) => (
          <div key={i} className="rounded-lg border border-amber-500/30 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-4 space-y-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <span aria-hidden="true">⚠</span>{p.risk}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{p.description}</p>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Fix: </span>{p.mitigation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
