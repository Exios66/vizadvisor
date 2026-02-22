import { useState, useCallback } from 'react';
import { parseFile } from '../services/dataService';
import { inferSchema } from '../utils/columnTypeInferrer';

export function useDataParser() {
  const [status, setStatus]     = useState('idle');
  const [warning, setWarning]   = useState(null);
  const [error, setError]       = useState(null);
  const [result, setResult]     = useState(null);

  const parse = useCallback(async (file) => {
    setStatus('parsing');
    setError(null);
    setWarning(null);
    setResult(null);
    try {
      const { headers, rows, sampleRows, rowCount, warn } = await parseFile(file);
      const schema = inferSchema(headers, rows);
      const parsed = { schema, sampleRows, rowCount };
      setResult(parsed);
      if (warn) setWarning(warn);
      setStatus('complete');
      return parsed;
    } catch (err) {
      setError(err.message);
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setWarning(null);
    setResult(null);
  }, []);

  return { status, error, warning, result, parse, reset };
}
