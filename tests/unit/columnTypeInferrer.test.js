import { describe, it, expect } from 'vitest';
import { inferColumnType, inferSchema } from '../../src/utils/columnTypeInferrer';

describe('inferColumnType', () => {
  it('detects quantitative columns', () => {
    const vals = ['1.5','2.3','100','0.01','999.9'];
    expect(inferColumnType(vals).type).toBe('quantitative');
  });

  it('detects temporal columns', () => {
    const vals = ['2024-01-01','2024-02-15','2023-12-31'];
    expect(inferColumnType(vals).type).toBe('temporal');
  });

  it('detects boolean columns', () => {
    const vals = ['true','false','true','true','false'];
    expect(inferColumnType(vals).type).toBe('boolean');
  });

  it('detects nominal columns by default', () => {
    const vals = ['apple','banana','cherry','date','elderberry'];
    expect(inferColumnType(vals).type).toBe('nominal');
  });

  it('detects ordinal columns with ordered tokens', () => {
    const vals = ['Low','Medium','High','Low','High','Medium'];
    expect(inferColumnType(vals).type).toBe('ordinal');
  });

  it('handles empty values as nullable', () => {
    const vals = ['1','2','','4','5'];
    const result = inferColumnType(vals);
    expect(result.nullable).toBe(true);
  });

  it('returns correct range for quantitative', () => {
    const vals = ['10','20','30','5','50'];
    const result = inferColumnType(vals);
    expect(result.range).toContain('5');
    expect(result.range).toContain('50');
  });
});

describe('inferSchema', () => {
  it('marks geo columns by name', () => {
    const headers = ['country', 'sales'];
    const rows    = [{ country: 'USA', sales: '1000' }, { country: 'UK', sales: '500' }];
    const schema  = inferSchema(headers, rows);
    expect(schema.find((c) => c.name === 'country').type).toBe('geographic');
  });

  it('returns one entry per column', () => {
    const headers = ['a', 'b', 'c'];
    const rows    = [{ a: '1', b: 'x', c: '2024-01-01' }];
    expect(inferSchema(headers, rows)).toHaveLength(3);
  });
});
