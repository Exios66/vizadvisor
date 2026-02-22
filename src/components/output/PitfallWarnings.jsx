export default function PitfallWarnings({ pitfalls }) {
  if (!pitfalls?.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-200">Pitfalls to Avoid</h3>
      <div className="space-y-2">
        {pitfalls.map((p, i) => (
          <div key={i} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
            <p className="text-sm font-medium text-amber-300 flex items-center gap-2">
              <span aria-hidden="true">⚠</span>{p.risk}
            </p>
            <p className="text-xs text-slate-400">{p.description}</p>
            <p className="text-xs text-slate-300">
              <span className="text-emerald-400 font-medium">Fix: </span>{p.mitigation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
