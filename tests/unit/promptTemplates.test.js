import { describe, it, expect } from 'vitest';
import { buildUserPrompt, buildMessages, buildFollowUpMessages, SYSTEM_PROMPT } from '../../src/services/promptTemplates';

const MOCK_CONTEXT = {
  sessionId: 'test-session-123',
  dataset: {
    rowCount: 500,
    schema: [
      { name: 'order_date', type: 'temporal',     cardinality: 365, nullable: false, range: '2023-01-01 → 2023-12-31' },
      { name: 'revenue',    type: 'quantitative', cardinality: 480, nullable: false, range: '100 – 50,000' },
      { name: 'region',     type: 'nominal',      cardinality: 4,   nullable: false, range: null },
    ],
    sampleRows: [
      { order_date: '2023-01-05', revenue: '1200', region: 'North' },
    ],
  },
  goal: {
    description: 'Show how monthly revenue has changed over the year by region',
    category: 'trend',
    primaryQuestion: 'Which region is growing fastest?',
  },
  parameters: {
    audience: 'Business stakeholders',
    library: 'recharts',
    language: 'javascript',
    interactivity: 'Tooltips only',
    accessibility: 'WCAG AA',
    extraNotes: null,
  },
};

describe('SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof SYSTEM_PROMPT).toBe('string');
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(500);
  });

  it('contains key constraint markers', () => {
    expect(SYSTEM_PROMPT).toContain('Never recommend pie charts for more than 5 categories');
    expect(SYSTEM_PROMPT).toContain('Never use rainbow/jet color scales');
    expect(SYSTEM_PROMPT).toContain('Never recommend 3D charts');
  });
});

describe('buildUserPrompt', () => {
  it('includes session ID', () => {
    expect(buildUserPrompt(MOCK_CONTEXT)).toContain('test-session-123');
  });

  it('includes all column names', () => {
    const prompt = buildUserPrompt(MOCK_CONTEXT);
    expect(prompt).toContain('order_date');
    expect(prompt).toContain('revenue');
    expect(prompt).toContain('region');
  });

  it('includes goal description', () => {
    const prompt = buildUserPrompt(MOCK_CONTEXT);
    expect(prompt).toContain(MOCK_CONTEXT.goal.description);
  });

  it('includes row count', () => {
    expect(buildUserPrompt(MOCK_CONTEXT)).toContain('500');
  });

  it('handles null parameters gracefully', () => {
    const ctx = { ...MOCK_CONTEXT, parameters: { ...MOCK_CONTEXT.parameters, extraNotes: null } };
    expect(() => buildUserPrompt(ctx)).not.toThrow();
  });
});

describe('buildMessages', () => {
  it('returns system and messages keys', () => {
    const result = buildMessages(MOCK_CONTEXT);
    expect(result).toHaveProperty('system');
    expect(result).toHaveProperty('messages');
  });

  it('system equals SYSTEM_PROMPT', () => {
    expect(buildMessages(MOCK_CONTEXT).system).toBe(SYSTEM_PROMPT);
  });

  it('appends history when provided', () => {
    const history = [{ role: 'user', content: 'prior turn' }];
    const { messages } = buildMessages(MOCK_CONTEXT, history);
    expect(messages[0].content).toBe('prior turn');
    expect(messages).toHaveLength(2);
  });
});

describe('buildFollowUpMessages', () => {
  it('appends assistant reply and user follow-up', () => {
    const history    = [{ role: 'user', content: 'first' }];
    const updated    = buildFollowUpMessages(history, '{"mock":"reply"}', 'make it accessible');
    expect(updated).toHaveLength(3);
    expect(updated[1].role).toBe('assistant');
    expect(updated[2].role).toBe('user');
    expect(updated[2].content).toBe('make it accessible');
  });
});
