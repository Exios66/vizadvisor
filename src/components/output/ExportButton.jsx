import Button from '../common/Button';

function buildMarkdown(recommendation) {
  const { meta, primary_recommendation: pr, alternative_options, pitfalls, code_scaffold } = recommendation;
  return [
    '# VizAdvisor Recommendation',
    `**Chart type:** ${pr.chart_type}  `,
    `**Goal category:** ${meta.goal_category}  `,
    `**Confidence:** ${meta.confidence}`,
    '',
    '## Rationale',
    pr.rationale,
    '',
    '## Alternative Options',
    ...alternative_options.map((a) => `- **${a.chart_type}**: ${a.use_when}`),
    '',
    '## Pitfalls',
    ...pitfalls.map((p) => `- **${p.risk}**: ${p.mitigation}`),
    '',
    `## Code Scaffold (${code_scaffold.library} / ${code_scaffold.language})`,
    `\`\`\`${code_scaffold.language}`,
    code_scaffold.snippet,
    '```',
  ].join('\n');
}

export default function ExportButton({ recommendation }) {
  if (!recommendation) return null;

  const downloadMarkdown = () => {
    const md   = buildMarkdown(recommendation);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'vizadvisor-recommendation.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const json = JSON.stringify(recommendation, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'vizadvisor-recommendation.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={downloadMarkdown}>⬇ Export Markdown</Button>
      <Button variant="secondary" size="sm" onClick={downloadJSON}>⬇ Export JSON</Button>
    </div>
  );
}
