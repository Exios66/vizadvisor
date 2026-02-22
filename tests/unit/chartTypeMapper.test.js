import { describe, it, expect } from 'vitest';
import { getCandidates, getTopCandidate } from '../../src/utils/chartTypeMapper';

describe('getCandidates', () => {
  it('returns candidates for known goal categories', () => {
    expect(getCandidates('comparison').length).toBeGreaterThan(0);
    expect(getCandidates('trend').length).toBeGreaterThan(0);
  });

  it('returns empty array for unknown categories', () => {
    expect(getCandidates('unknown-goal')).toEqual([]);
  });

  it('covers all 8 goal categories', () => {
    const expected = ['comparison','trend','distribution','correlation','part-of-whole','geospatial','network-flow','ranking'];
    expected.forEach((cat) => expect(getCandidates(cat).length).toBeGreaterThan(0));
  });
});

describe('getTopCandidate', () => {
  it('returns the highest-scored candidate', () => {
    const top = getTopCandidate('comparison');
    expect(top).not.toBeNull();
    expect(top.score).toBe(10);
    expect(top.type).toBe('bar chart');
  });

  it('returns null for unknown categories', () => {
    expect(getTopCandidate('??')).toBeNull();
  });
});
