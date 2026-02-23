export default function DesignDecisionsPanel({ designDecisions, accessibility, interactivity }) {
  if (!designDecisions) return null;
  const { color_palette, scale, annotations, sorting, aspect_ratio, data_density_strategy } = designDecisions;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-5">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200">Design Decisions</h3>

      {color_palette && (
        <Section label="Color Palette">
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{color_palette.recommendation}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{color_palette.rationale}</p>
        </Section>
      )}

      {scale && (
        <Section label="Scales">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {scale.x && <KV label="X-axis" value={scale.x} />}
            {scale.y && <KV label="Y-axis" value={scale.y} />}
            <KV label="Zero baseline" value={scale.zero_baseline ? 'Yes' : 'No'} />
          </div>
        </Section>
      )}

      {annotations && <Section label="Annotations"><p className="text-sm text-slate-700 dark:text-slate-300">{annotations}</p></Section>}
      {sorting      && <Section label="Sort Order"><p className="text-sm text-slate-700 dark:text-slate-300">{sorting}</p></Section>}
      {aspect_ratio && <Section label="Aspect Ratio"><p className="text-sm text-slate-700 dark:text-slate-300">{aspect_ratio}</p></Section>}
      {data_density_strategy && <Section label="Data Density"><p className="text-sm text-slate-700 dark:text-slate-300">{data_density_strategy}</p></Section>}

      {accessibility && (
        <Section label="Accessibility">
          <div className="flex flex-wrap gap-2 text-xs">
            <StatusChip ok={accessibility.color_blind_safe} label="Colorblind safe" />
            <StatusChip ok={accessibility.wcag_level && accessibility.wcag_level !== 'not_applicable'} label={`WCAG ${accessibility.wcag_level || 'N/A'}`} />
          </div>
          {accessibility.redundant_encoding && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{accessibility.redundant_encoding}</p>
          )}
          {accessibility.aria_recommendations && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{accessibility.aria_recommendations}</p>
          )}
        </Section>
      )}

      {interactivity?.interactions?.length > 0 && (
        <Section label="Interactivity">
          <div className="flex flex-wrap gap-1.5">
            {interactivity.interactions.map((i) => (
              <span key={i} className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">{i}</span>
            ))}
          </div>
          {interactivity.rationale && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{interactivity.rationale}</p>
          )}
        </Section>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</h4>
      {children}
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-700/50 rounded px-2 py-1.5">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  );
}

function StatusChip({ ok, label }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
      ok ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
    }`}>
      {ok ? '✓' : '–'} {label}
    </span>
  );
}
