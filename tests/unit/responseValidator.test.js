import { describe, it, expect } from 'vitest';
import { validateResponse, extractJSON, LLMResponseError } from '../../src/utils/responseValidator';

describe('responseValidator', () => {
  it('placeholder', () => {
    expect(extractJSON).toBeDefined();
    expect(validateResponse).toBeDefined();
    expect(LLMResponseError).toBeDefined();
  });
});
