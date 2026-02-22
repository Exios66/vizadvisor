import { describe, it, expect } from 'vitest';
import { inferColumnType, inferSchema } from '../../src/utils/columnTypeInferrer';

describe('columnTypeInferrer', () => {
  it('placeholder', () => {
    expect(inferColumnType).toBeDefined();
    expect(inferSchema).toBeDefined();
  });
});
