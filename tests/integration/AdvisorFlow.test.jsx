import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../src/context/SessionContext';
import { SettingsProvider } from '../../src/context/SettingsContext';
import AdvisorPage from '../../src/pages/AdvisorPage';

vi.mock('../../src/services/llmService', () => ({
  sendRequest: vi.fn(),
  streamRequest: vi.fn(),
}));

import { sendRequest, streamRequest } from '../../src/services/llmService';

const MOCK_RECOMMENDATION = {
  meta: { advisor_version:'1.0', session_id:null, goal_category:'comparison', confidence:'high', confidence_rationale:'Good data.' },
  primary_recommendation: {
    chart_type: 'bar chart',
    rationale: 'Bar charts are optimal for categorical comparison using position on a common scale.',
    data_mapping: { x_axis:'category', y_axis:'value', color:null, size:null, facet:null, tooltip:['category','value'], additional_channels:null },
    design_decisions: { color_palette:{ type:'qualitative', recommendation:'Okabe-Ito', rationale:'Colorblind safe.'}, scale:{ x:'ordinal', y:'linear', zero_baseline:true }, annotations:'None', sorting:'by-value-desc', aspect_ratio:'4:3', data_density_strategy:'Show all' },
    accessibility: { color_blind_safe:true, redundant_encoding:'None', aria_recommendations:null, wcag_level:'AA' },
    interactivity: { recommended:false, interactions:[], rationale:'Static context.' },
  },
  alternative_options: [],
  pitfalls: [],
  code_scaffold: { library:'recharts', language:'javascript', notes:'', snippet:'const Chart = () => null;' },
  follow_up_questions: [],
};

function renderAdvisor() {
  return render(
    <SettingsProvider>
      <SessionProvider>
        <MemoryRouter>
          <AdvisorPage />
        </MemoryRouter>
      </SessionProvider>
    </SettingsProvider>
  );
}

describe('AdvisorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockResult = { raw: JSON.stringify(MOCK_RECOMMENDATION), parsed: MOCK_RECOMMENDATION };
    sendRequest.mockResolvedValue(mockResult);
    streamRequest.mockResolvedValue(mockResult);
  });

  it('renders the page heading', () => {
    renderAdvisor();
    expect(screen.getByText(/data visualization advisor/i)).toBeInTheDocument();
  });

  it('submit button is disabled when no data or goal', () => {
    renderAdvisor();
    expect(screen.getByRole('button', { name: /get recommendation/i })).toBeDisabled();
  });

  it('shows idle state in output panel initially', () => {
    renderAdvisor();
    expect(screen.getByText(/complete the form/i)).toBeInTheDocument();
  });
});
