import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

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
    </div>
  );
}
