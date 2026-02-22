import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const FEATURES = [
  { icon: '📂', title: 'Upload Any Dataset', desc: 'Drop in CSV or JSON files. Automatic schema inference detects column types, ranges, and cardinality.' },
  { icon: '🎯', title: 'Describe Your Goal', desc: 'Tell the advisor what you want to communicate. Choose a goal category and primary question.' },
  { icon: '🧠', title: 'AI-Powered Analysis', desc: 'Claude applies Tufte, Munzner, and Cairo principles to your specific data and context.' },
  { icon: '⚙️', title: 'Code Scaffold', desc: 'Get copy-pasteable code in your preferred library — Recharts, D3, Plotly, ggplot2, and more.' },
  { icon: '♿', title: 'Accessibility Built-In', desc: 'Colorblind-safe palettes, WCAG compliance, ARIA recommendations included automatically.' },
  { icon: '⚠️', title: 'Pitfall Warnings', desc: 'Proactive warnings about overplotting, misleading axes, rainbow scales, and 3D chart traps.' },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">
      <div className="text-center space-y-6">
        <div className="text-6xl" aria-hidden="true">📊</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 leading-tight">
          Expert visualization advice,<br />
          <span className="text-indigo-400">powered by AI</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Upload your data, describe your communication goal, and receive recommendations grounded in Tufte, Munzner, and Cairo — with code scaffolds ready to run.
        </p>
        <Link to="/advisor">
          <Button variant="primary" size="lg">Get Started →</Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-2 hover:border-indigo-500/40 transition-colors">
            <div className="text-2xl" aria-hidden="true">{icon}</div>
            <h3 className="font-semibold text-slate-200">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
