import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'vizadvisor:settings';

const defaultSettings = {
  provider: import.meta.env.VITE_LLM_PROVIDER || 'anthropic',
  model:    import.meta.env.VITE_DEFAULT_MODEL  || 'claude-sonnet-4-6',
  library:  'recharts',
  language: 'javascript',
  theme:    'dark',
  verbosity:'standard',
  streaming: true,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings]);

  const updateSettings = (patch) => setSettingsState((prev) => ({ ...prev, ...patch }));
  const resetSettings  = () => setSettingsState(defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
