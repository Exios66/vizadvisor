import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/advisor', label: 'Advisor' },
  { to: '/about',   label: 'About' },
];

export default function Header() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl" aria-hidden="true">📊</span>
          <span className="font-bold text-lg text-slate-100 group-hover:text-indigo-400 transition-colors">
            VizAdvisor
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === to
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                  aria-current={pathname === to ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
