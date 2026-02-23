import { useCallback } from 'react';
import { useSession } from '../context/SessionContext';
import { runAnalysis } from '../services/analysisService';

export function useAnalysis(slot) {
  const { state, setPreAnalysis, setPostAnalysis } = useSession();

  const setter = slot === 'pre' ? setPreAnalysis : setPostAnalysis;
  const analysis = slot === 'pre' ? state.preAnalysis : state.postAnalysis;

  const run = useCallback(
    async ({ engine, analysisType, data, config }) => {
      setter({ status: 'loading', error: null });
      try {
        const results = await runAnalysis({ engine, analysisType, data, config });
        setter({ results, status: 'complete', error: null, analysisType });
        return results;
      } catch (err) {
        setter({ results: null, status: 'error', error: err.message });
        throw err;
      }
    },
    [setter]
  );

  const clear = useCallback(() => {
    setter({ results: null, status: 'idle', error: null });
  }, [setter]);

  return {
    run,
    clear,
    results: analysis.results,
    status: analysis.status,
    error: analysis.error,
    analysisType: analysis.analysisType,
  };
}
