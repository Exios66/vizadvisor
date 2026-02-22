export default function AlternativeOptions({ alternatives }) {
  if (!alternatives?.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-200">Alternative Options</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {alternatives.map((alt, i) => (
          <div key={i} className="rounded-lg border border-slate-700 bg-slate-800/30 p-4 space-y-2">
            <p className="font-medium text-slate-200 text-sm">{alt.chart_type}</p>
            <div className="space-y-1 text-xs text-slate-400">
              <p><span className="text-slate-500 font-medium">Use when: </span>{alt.use_when}</p>
              <p><span className="text-slate-500 font-medium">Tradeoff: </span>{alt.tradeoff}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
