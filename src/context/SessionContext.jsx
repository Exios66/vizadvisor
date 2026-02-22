import { createContext, useContext, useReducer, useCallback } from 'react';

const initialState = {
  dataset: {
    rawFile: null, rowCount: null, schema: null,
    sampleRows: null, parseError: null,
  },
  goal: { description: '', category: null, primaryQuestion: null },
  parameters: {
    audience: null, library: null, language: 'javascript',
    interactivity: null, accessibility: null, extraNotes: null,
  },
  status: 'idle',
  rawResponse: null,
  recommendation: null,
  llmError: null,
  conversationHistory: [],
  sessionId: crypto.randomUUID(),
};

function sessionReducer(state, action) {
  switch (action.type) {
    case 'SET_DATASET':
      return { ...state, dataset: { ...state.dataset, ...action.payload, parseError: null } };
    case 'SET_DATASET_ERROR':
      return { ...state, dataset: { ...initialState.dataset, parseError: action.payload } };
    case 'SET_SCHEMA_OVERRIDE': {
      const schema = state.dataset.schema?.map((col) =>
        col.name === action.payload.name ? { ...col, type: action.payload.type } : col
      ) ?? [];
      return { ...state, dataset: { ...state.dataset, schema } };
    }
    case 'SET_GOAL':
      return { ...state, goal: { ...state.goal, ...action.payload } };
    case 'SET_PARAMETERS':
      return { ...state, parameters: { ...state.parameters, ...action.payload } };
    case 'SUBMIT_REQUEST':
      return { ...state, status: 'loading', rawResponse: null, recommendation: null, llmError: null };
    case 'STREAM_CHUNK':
      return { ...state, status: 'streaming', rawResponse: (state.rawResponse || '') + action.payload };
    case 'REQUEST_COMPLETE':
      return { ...state, status: 'complete', recommendation: action.payload };
    case 'REQUEST_ERROR':
      return { ...state, status: 'error', llmError: action.payload };
    case 'APPEND_HISTORY':
      return { ...state, conversationHistory: [...state.conversationHistory, action.payload] };
    case 'RESET_SESSION':
      return { ...initialState, sessionId: crypto.randomUUID() };
    default:
      return state;
  }
}

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const setDataset      = useCallback((data) => dispatch({ type: 'SET_DATASET', payload: data }), []);
  const setDatasetError = useCallback((msg)  => dispatch({ type: 'SET_DATASET_ERROR', payload: msg }), []);
  const overrideType    = useCallback((name, type) => dispatch({ type: 'SET_SCHEMA_OVERRIDE', payload: { name, type } }), []);
  const setGoal         = useCallback((data) => dispatch({ type: 'SET_GOAL', payload: data }), []);
  const setParameters   = useCallback((data) => dispatch({ type: 'SET_PARAMETERS', payload: data }), []);
  const appendHistory   = useCallback((turn) => dispatch({ type: 'APPEND_HISTORY', payload: turn }), []);
  const resetSession    = useCallback(()     => dispatch({ type: 'RESET_SESSION' }), []);

  return (
    <SessionContext.Provider value={{ state, dispatch, setDataset, setDatasetError, overrideType, setGoal, setParameters, appendHistory, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
