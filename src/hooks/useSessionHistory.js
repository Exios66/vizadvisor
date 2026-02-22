import { useState, useCallback } from 'react';

const STORAGE_KEY    = 'vizadvisor:sessions';
const MAX_SESSIONS   = 20;

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch { /* ignore */ }
}

export function useSessionHistory() {
  const [sessions, setSessions] = useState(loadSessions);

  const saveSession = useCallback((sessionData) => {
    setSessions((prev) => {
      const updated = [
        { ...sessionData, savedAt: new Date().toISOString() },
        ...prev.filter((s) => s.sessionId !== sessionData.sessionId),
      ].slice(0, MAX_SESSIONS);
      saveSessions(updated);
      return updated;
    });
  }, []);

  const deleteSession = useCallback((sessionId) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.sessionId !== sessionId);
      saveSessions(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSessions([]);
    saveSessions([]);
  }, []);

  return { sessions, saveSession, deleteSession, clearAll };
}
