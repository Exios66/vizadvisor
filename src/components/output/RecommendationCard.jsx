import MetaBadges from './MetaBadges';

export default function RecommendationCard({ recommendation, meta }) {
  if (!recommendation) return null;
  const { chart_type, rationale, data_mapping } = recommendation;

  const mappings = Object.entries(data_mapping ?? {})
    .filter(([, v]) => v && (typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.length : false));

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 space-y-4">
      <div className="space-y-2">
        <MetaBadges meta={meta} />
        <h2 className="text-xl font-bold text-slate-100">{chart_type}</h2>
        <p className="text-sm text-slate-300 leading-relaxed">{rationale}</p>
      </div>

      {mappings.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Data Mapping</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {mappings.map(([channel, value]) => (
              <div key={channel} className="flex items-start gap-2 bg-slate-800/60 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-500 capitalize min-w-[48px] pt-0.5">{channel.replace('_', ' ')}</span>
                <span className="text-xs text-slate-200 font-mono break-words">
                  {Array.isArray(value) ? value.join(', ') : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
