import { useCallback } from 'react';
import { useSession } from '../context/SessionContext';
import { sendRequest, streamRequest } from '../services/llmService';
import { useSettings } from '../context/SettingsContext';

export function useLLM() {
  const { state, dispatch, appendHistory } = useSession();
  const { settings } = useSettings();

  const submit = useCallback(async () => {
    const { dataset, goal, parameters, sessionId, conversationHistory, preAnalysis } = state;

    dispatch({ type: 'SUBMIT_REQUEST' });

    const context = { sessionId, dataset, goal, parameters, preAnalysis };

    try {
      if (settings.streaming) {
        const { raw, parsed } = await streamRequest(
          context,
          conversationHistory,
          settings.model,
          (chunk) => dispatch({ type: 'STREAM_CHUNK', payload: chunk })
        );
        appendHistory({ role: 'user',      content: goal.description });
        appendHistory({ role: 'assistant', content: raw });
        dispatch({ type: 'REQUEST_COMPLETE', payload: parsed });
      } else {
        const { raw, parsed } = await sendRequest(context, conversationHistory, settings.model);
        appendHistory({ role: 'user',      content: goal.description });
        appendHistory({ role: 'assistant', content: raw });
        dispatch({ type: 'REQUEST_COMPLETE', payload: parsed });
      }
    } catch (err) {
      dispatch({ type: 'REQUEST_ERROR', payload: err.message });
    }
  }, [state, dispatch, appendHistory, settings]);

  const isReady = !!(
    state.dataset?.schema?.length &&
    state.goal?.description?.trim().length > 10
  );

  return {
    submit,
    isReady,
    status:         state.status,
    recommendation: state.recommendation,
    rawResponse:    state.rawResponse,
    error:          state.llmError,
  };
}
