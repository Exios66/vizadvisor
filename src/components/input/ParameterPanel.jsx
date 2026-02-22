import { SUPPORTED_LIBRARIES } from '../../services/promptTemplates';

const AUDIENCE_OPTIONS    = ['General public','Business stakeholders','Executive leadership','Data analysts','Data scientists','Domain experts','Developers'];
const INTERACTIVITY_OPTIONS = ['None — static image/PDF','Tooltips only','Basic interactive (zoom, pan)','Fully interactive (filter, drill-down, cross-filter)'];
const ACCESSIBILITY_OPTIONS = ['Standard (no special requirements)','WCAG AA — color-blind safe palettes','WCAG AA — full (color + keyboard + ARIA)','WCAG AAA'];

export default function ParameterPanel({ parameters, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="audience" className="block text-sm font-medium text-slate-300 mb-1.5">Audience</label>
          <select
            id="audience"
            value={parameters.audience ?? ''}
            onChange={(e) => onChange({ audience: e.target.value || null })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Not specified</option>
            {AUDIENCE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="library" className="block text-sm font-medium text-slate-300 mb-1.5">Chart Library</label>
          <select
            id="library"
            value={parameters.library ?? ''}
            onChange={(e) => {
              const lib = SUPPORTED_LIBRARIES.find((l) => l.value === e.target.value);
              onChange({ library: e.target.value || null, language: lib?.language ?? parameters.language });
            }}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">No preference</option>
            {SUPPORTED_LIBRARIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="interactivity" className="block text-sm font-medium text-slate-300 mb-1.5">Interactivity</label>
          <select
            id="interactivity"
            value={parameters.interactivity ?? ''}
            onChange={(e) => onChange({ interactivity: e.target.value || null })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Not specified</option>
            {INTERACTIVITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="accessibility" className="block text-sm font-medium text-slate-300 mb-1.5">Accessibility</label>
          <select
            id="accessibility"
            value={parameters.accessibility ?? ''}
            onChange={(e) => onChange({ accessibility: e.target.value || null })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Standard</option>
            {ACCESSIBILITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="extra-notes" className="block text-sm font-medium text-slate-300 mb-1.5">
          Additional context
          <span className="text-slate-500 ml-1 font-normal">(optional)</span>
        </label>
        <textarea
          id="extra-notes"
          value={parameters.extraNotes ?? ''}
          onChange={(e) => onChange({ extraNotes: e.target.value || null })}
          placeholder="e.g. This will be embedded in a dark-mode dashboard. Prefer minimal annotations."
          rows={2}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        />
      </div>
    </div>
  );
}
