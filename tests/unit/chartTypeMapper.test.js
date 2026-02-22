import { describe, it, expect } from 'vitest';
import { getCandidates, getTopCandidate } from '../../src/utils/chartTypeMapper';

describe('chartTypeMapper', () => {
  it('placeholder', () => {
    expect(getCandidates).toBeDefined();
    expect(getTopCandidate).toBeDefined();
  });
});
