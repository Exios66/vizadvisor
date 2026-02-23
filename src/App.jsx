import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Spinner from './components/common/Spinner';

const HomePage    = lazy(() => import('./pages/HomePage'));
const AdvisorPage = lazy(() => import('./pages/AdvisorPage'));
const AboutPage   = lazy(() => import('./pages/AboutPage'));

function ThemeWrapper({ children }) {
  const { settings } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);
  return children;
}

export default function App() {
  return (
    <SettingsProvider>
      <ThemeWrapper>
        <SessionProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header />
            <main className="flex-1">
              <Suspense fallback={<div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>}>
                <Routes>
                  <Route path="/"        element={<HomePage />} />
                  <Route path="/advisor" element={<AdvisorPage />} />
                  <Route path="/about"   element={<AboutPage />} />
                  <Route path="*"        element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            </div>
          </BrowserRouter>
        </SessionProvider>
      </ThemeWrapper>
    </SettingsProvider>
  );
}
