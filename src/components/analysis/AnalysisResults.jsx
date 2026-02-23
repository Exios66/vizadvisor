import { formatNumber } from '../../utils/formatters';

export default function AnalysisResults({ results, analysisType }) {
  if (!results) return null;
  if (results.error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
        <p className="text-sm text-red-700 dark:text-red-300">{results.error}</p>
      </div>
    );
  }

  if (analysisType === 'descriptive') {
    return <DescriptiveResults results={results} />;
  }
  if (analysisType === 'regression') {
    return <RegressionResults results={results} />;
  }
  if (analysisType === 'power') {
    return <PowerResults results={results} />;
  }
  if (analysisType === 'mediation') {
    return <MediationResults results={results} />;
  }
  if (analysisType === 'factorial') {
    return <FactorialResults results={results} />;
  }

  return (
    <pre className="text-xs bg-slate-100 dark:bg-slate-800 rounded-lg p-4 overflow-auto max-h-64">
      {JSON.stringify(results, null, 2)}
    </pre>
  );
}

function StatTable({ headers, rows, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800 text-left">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              {headers.map((h) => (
                <td key={h} className="px-3 py-2 text-slate-700 dark:text-slate-300 font-mono">
                  {formatStat(row[h])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatStat(v) {
  if (v == null) return '—';
  if (typeof v === 'number' && (v < 0.001 || v > 9999)) return v.toExponential(2);
  if (typeof v === 'number') return formatNumber(v, { maximumFractionDigits: 4 });
  return String(v);
}

function DescriptiveResults({ results }) {
  const { summary, by_group } = results;
  if (!summary?.length) return null;

  const headers = ['column', 'n', 'mean', 'sd', 'min', 'max', 'missing'];
  const rows = summary.map((s) => ({
    column: s.column,
    n: s.n,
    mean: s.mean,
    sd: s.sd,
    min: s.min,
    max: s.max,
    missing: s.missing,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Summary</h3>
        <StatTable headers={headers} rows={rows} />
      </div>
      {by_group && Object.keys(by_group).length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            ▸ By group
          </summary>
          <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg p-3 overflow-auto max-h-48">
            {JSON.stringify(by_group, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

function RegressionResults({ results }) {
  const { coefficients, anova, r_squared, adj_r_squared } = results;

  return (
    <div className="space-y-4">
      {(r_squared != null || adj_r_squared != null) && (
        <div className="flex gap-4 text-sm">
          {r_squared != null && (
            <span className="font-mono">R² = {formatStat(r_squared)}</span>
          )}
          {adj_r_squared != null && (
            <span className="font-mono">Adj R² = {formatStat(adj_r_squared)}</span>
          )}
        </div>
      )}
      {coefficients?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Coefficients</h3>
          <StatTable
            headers={['term', 'estimate', 'std_error', 'statistic', 'p_value', 'conf_low', 'conf_high']}
            rows={coefficients.map((c) => ({
              term: c.term,
              estimate: c.estimate,
              std_error: c.std_error ?? c.std.error,
              statistic: c.statistic,
              p_value: c.p_value ?? c['p.value'],
              conf_low: c.conf_low ?? c['conf.low'],
              conf_high: c.conf_high ?? c['conf.high'],
            }))}
          />
        </div>
      )}
      {anova?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">ANOVA</h3>
          <StatTable
            headers={['term', 'sum_sq', 'df', 'F', 'p_value', 'partial_eta_sq']}
            rows={anova.map((a) => ({
              term: a.term,
              sum_sq: a.sum_sq ?? a.sumsq,
              df: a.df,
              F: a.F ?? a.statistic,
              p_value: a.p_value ?? a['p.value'],
              partial_eta_sq: a.partial_eta_sq ?? a.partial_eta_sq,
            }))}
          />
        </div>
      )}
    </div>
  );
}

function PowerResults({ results }) {
  const { u, v, f2, power, n } = results;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        {u != null && <StatRow label="u" value={u} />}
        {v != null && <StatRow label="v" value={v} />}
        {f2 != null && <StatRow label="f²" value={f2} />}
        {power != null && <StatRow label="Power" value={power} />}
        {n != null && <StatRow label="N" value={n} />}
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between bg-slate-100 dark:bg-slate-800/60 rounded-lg px-3 py-2">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-mono text-slate-800 dark:text-slate-200">{formatStat(value)}</span>
    </div>
  );
}

function MediationResults({ results }) {
  const paths = ['path_a', 'path_b', 'path_c_prime', 'indirect_effect', 'total_effect'];
  const labels = { path_a: 'a (X→M)', path_b: 'b (M→Y)', path_c_prime: "c' (X→Y)", indirect_effect: 'Indirect (a×b)', total_effect: 'Total' };

  return (
    <div className="space-y-3">
      {paths.map((key) => {
        const p = results[key];
        if (!p) return null;
        return (
          <div key={key} className="bg-slate-100 dark:bg-slate-800/60 rounded-lg px-3 py-2">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{labels[key]}</div>
            <div className="flex flex-wrap gap-3 text-sm font-mono">
              {p.est != null && <span>est = {formatStat(p.est)}</span>}
              {p.se != null && <span>se = {formatStat(p.se)}</span>}
              {p.pvalue != null && <span>p = {formatStat(p.pvalue)}</span>}
              {(p.ci_lower != null || p.ci_upper != null) && (
                <span>95% CI [{formatStat(p.ci_lower)}, {formatStat(p.ci_upper)}]</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FactorialResults({ results }) {
  const { anova, r_squared } = results;
  return (
    <div className="space-y-4">
      {r_squared != null && (
        <div className="text-sm font-mono">R² = {formatStat(r_squared)}</div>
      )}
      {anova?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">ANOVA</h3>
          <StatTable
            headers={['term', 'sum_sq', 'df', 'F', 'p_value', 'partial_eta_sq']}
            rows={anova.map((a) => ({
              term: a.term,
              sum_sq: a.sum_sq ?? a.sumsq,
              df: a.df,
              F: a.F ?? a.statistic,
              p_value: a.p_value ?? a['p.value'],
              partial_eta_sq: a.partial_eta_sq,
            }))}
          />
        </div>
      )}
    </div>
  );
}
