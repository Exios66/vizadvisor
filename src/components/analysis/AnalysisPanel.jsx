import { useState, useCallback } from 'react';
import Button from '../common/Button';

const ENGINES = [
  { value: 'r', label: 'R' },
  { value: 'python', label: 'Python' },
];

const ANALYSIS_TYPES = [
  { value: 'descriptive', label: 'Descriptive statistics' },
  { value: 'regression', label: 'Regression / ANOVA' },
  { value: 'power', label: 'Power analysis' },
  { value: 'mediation', label: 'Mediation' },
  { value: 'factorial', label: 'Factorial ANOVA' },
];

export default function AnalysisPanel({
  schema,
  rows,
  onRun,
  status,
  error,
  disabled,
}) {
  const [engine, setEngine] = useState('r');
  const [analysisType, setAnalysisType] = useState('descriptive');
  const [config, setConfig] = useState({});

  const colNames = schema?.map((c) => c.name) ?? [];
  const numCols = schema?.filter((c) => c.type === 'quantitative').map((c) => c.name) ?? [];

  const handleRun = useCallback(() => {
    onRun({ engine, analysisType, data: rows, config });
  }, [engine, analysisType, rows, config, onRun]);

  const updateConfig = useCallback((updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const isLoading = status === 'loading';
  const canRun = rows?.length > 0 && !disabled;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="analysis-engine" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Engine</label>
          <select
            id="analysis-engine"
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ENGINES.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="analysis-type" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Analysis type</label>
          <select
            id="analysis-type"
            value={analysisType}
            onChange={(e) => {
              setAnalysisType(e.target.value);
              setConfig({});
            }}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ANALYSIS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <ConfigForm
        analysisType={analysisType}
        config={config}
        updateConfig={updateConfig}
        colNames={colNames}
        numCols={numCols}
      />

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <Button
        variant="primary"
        size="md"
        disabled={!canRun || isLoading}
        loading={isLoading}
        onClick={handleRun}
      >
        {isLoading ? 'Running…' : 'Run Analysis'}
      </Button>
    </div>
  );
}

function ConfigForm({ analysisType, config, updateConfig, colNames, numCols }) {
  if (analysisType === 'descriptive') {
    return (
      <div className="space-y-2">
        <div>
          <label htmlFor="analysis-groupby" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Group by (optional)</label>
          <select
            id="analysis-groupby"
            value={config.groupBy ?? ''}
            onChange={(e) => updateConfig({ groupBy: e.target.value || null })}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {colNames.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (analysisType === 'regression') {
    const preds = Array.isArray(config.predictors) ? config.predictors : (config.predictors ? [config.predictors] : []);
    return (
      <div className="space-y-2">
        <div>
          <label htmlFor="analysis-regression-outcome" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Outcome</label>
          <select
            id="analysis-regression-outcome"
            value={config.outcome ?? ''}
            onChange={(e) => updateConfig({ outcome: e.target.value || null })}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select…</option>
            {numCols.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="analysis-predictors" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Predictors (comma-separated)</label>
          <input
            id="analysis-predictors"
            type="text"
            value={preds.join(', ')}
            onChange={(e) => updateConfig({ predictors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="col1, col2, col3"
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
    );
  }

  if (analysisType === 'power') {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="analysis-power-u" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">u (numerator df)</label>
            <input
              id="analysis-power-u"
              type="number"
              min={0}
              value={config.u ?? ''}
              onChange={(e) => updateConfig({ u: e.target.value ? Number(e.target.value) : null })}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="analysis-power-v" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">v (denom df)</label>
            <input
              id="analysis-power-v"
              type="number"
              min={0}
              placeholder="Solve for"
              value={config.v ?? ''}
              onChange={(e) => updateConfig({ v: e.target.value ? Number(e.target.value) : null })}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="analysis-power-f2" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">f²</label>
            <input
              id="analysis-power-f2"
              type="number"
              min={0}
              step={0.01}
              placeholder="Solve for"
              value={config.f2 ?? ''}
              onChange={(e) => updateConfig({ f2: e.target.value ? Number(e.target.value) : null })}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="analysis-power-power" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Power</label>
            <input
              id="analysis-power-power"
              type="number"
              min={0}
              max={1}
              step={0.01}
              placeholder="Solve for"
              value={config.power ?? ''}
              onChange={(e) => updateConfig({ power: e.target.value ? Number(e.target.value) : null })}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  if (analysisType === 'mediation') {
    return (
      <div className="space-y-2">
        <div>
          <label htmlFor="analysis-mediation-x" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">X (predictor)</label>
          <select
            id="analysis-mediation-x"
            value={config.x ?? ''}
            onChange={(e) => updateConfig({ x: e.target.value || null })}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select…</option>
            {colNames.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="analysis-mediation-m" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">M (mediator)</label>
          <select
            id="analysis-mediation-m"
            value={config.m ?? ''}
            onChange={(e) => updateConfig({ m: e.target.value || null })}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select…</option>
            {colNames.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="analysis-mediation-y" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Y (outcome)</label>
          <select
            id="analysis-mediation-y"
            value={config.y ?? ''}
            onChange={(e) => updateConfig({ y: e.target.value || null })}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select…</option>
            {colNames.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (analysisType === 'factorial') {
    const factors = Array.isArray(config.factors) ? config.factors : (config.factors ? [config.factors] : []);
    return (
      <div className="space-y-2">
        <div>
          <label htmlFor="analysis-factorial-outcome" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Outcome</label>
          <select
            id="analysis-factorial-outcome"
            value={config.outcome ?? ''}
            onChange={(e) => updateConfig({ outcome: e.target.value || null })}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select…</option>
            {numCols.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="analysis-factorial-factors" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Factors (2 or 3, comma-separated)</label>
          <input
            id="analysis-factorial-factors"
            type="text"
            value={factors.join(', ')}
            onChange={(e) => updateConfig({ factors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="factor1, factor2"
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
    );
  }

  return null;
}
