import { describe, it, expect } from 'vitest';
import { validateResponse, extractJSON, LLMResponseError } from '../../src/utils/responseValidator';

const VALID_RESPONSE = JSON.stringify({
  meta: { advisor_version:'1.0', session_id:null, goal_category:'comparison', confidence:'high', confidence_rationale:'Clear data.' },
  primary_recommendation: {
    chart_type: 'bar chart',
    rationale: 'Position on a common scale is the most accurate encoding for categorical comparison.',
    data_mapping: { x_axis: 'category', y_axis: 'sales', color: null, size: null, facet: null, tooltip: [], additional_channels: null },
    design_decisions: { color_palette: { type:'qualitative', recommendation:'Okabe-Ito', rationale:'Colorblind safe.' }, scale: { x:'ordinal', y:'linear', zero_baseline: true }, annotations: 'None', sorting: 'by-value-desc', aspect_ratio: '4:3', data_density_strategy: 'Show all' },
    accessibility: { color_blind_safe: true, redundant_encoding: 'None needed', aria_recommendations: null, wcag_level: 'AA' },
    interactivity: { recommended: false, interactions: [], rationale: 'Static report context.' },
  },
  alternative_options: [{ chart_type: 'dot plot', use_when: 'Many categories', tradeoff: 'Less familiar', key_difference: 'Points instead of bars' }],
  pitfalls: [{ risk: 'Truncated y-axis', description: 'Do not start y above zero.', mitigation: 'Set y domain minimum to 0.' }],
  code_scaffold: { library: 'recharts', language: 'javascript', notes: 'Use ResponsiveContainer.', snippet: 'const Chart = () => <BarChart data={data}/>;\nexport default Chart;' },
  follow_up_questions: [],
});

describe('extractJSON', () => {
  it('strips markdown fences', () => {
    const fenced = '```json\n{"key":"value"}\n```';
    expect(extractJSON(fenced)).toBe('{"key":"value"}');
  });

  it('returns raw text if no fence', () => {
    expect(extractJSON('{"a":1}')).toBe('{"a":1}');
  });
});

describe('validateResponse', () => {
  it('parses and returns valid responses', () => {
    const result = validateResponse(VALID_RESPONSE);
    expect(result.primary_recommendation.chart_type).toBe('bar chart');
  });

  it('throws LLMResponseError for invalid JSON', () => {
    expect(() => validateResponse('not json at all')).toThrow(LLMResponseError);
  });

  it('throws for missing required top-level keys', () => {
    const bad = JSON.stringify({ meta: {}, primary_recommendation: { chart_type:'bar', rationale:'x', data_mapping:{}, design_decisions:{}, accessibility:{}, interactivity:{} } });
    expect(() => validateResponse(bad)).toThrow(LLMResponseError);
  });

  it('throws for empty chart_type', () => {
    const parsed = JSON.parse(VALID_RESPONSE);
    parsed.primary_recommendation.chart_type = '';
    expect(() => validateResponse(JSON.stringify(parsed))).toThrow(LLMResponseError);
  });
});
