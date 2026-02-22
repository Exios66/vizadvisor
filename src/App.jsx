import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { SettingsProvider } from './context/SettingsContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage    from './pages/HomePage';
import AdvisorPage from './pages/AdvisorPage';
import AboutPage   from './pages/AboutPage';

export default function App() {
  return (
    <SettingsProvider>
      <SessionProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-slate-950">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/"        element={<HomePage />} />
                <Route path="/advisor" element={<AdvisorPage />} />
                <Route path="/about"   element={<AboutPage />} />
                <Route path="*"        element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </SessionProvider>
    </SettingsProvider>
  );
}
