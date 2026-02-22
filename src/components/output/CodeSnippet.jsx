import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import CopyButton from '../common/CopyButton';
import Badge from '../common/Badge';

export default function CodeSnippet({ codeScaffold }) {
  const ref = useRef(null);

  useEffect(() => {
    async function loadLang() {
      const lang = codeScaffold?.language;
      if (lang === 'python') await import('prismjs/components/prism-python');
      if (lang === 'r') await import('prismjs/components/prism-r');
      if (ref.current) Prism.highlightElement(ref.current);
    }
    if (codeScaffold?.snippet) loadLang();
  }, [codeScaffold?.snippet, codeScaffold?.language]);

  if (!codeScaffold?.snippet) return null;

  const langMap = { javascript: 'javascript', typescript: 'javascript', python: 'python', r: 'r' };
  const lang    = langMap[codeScaffold.language] ?? 'javascript';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-200">Code Scaffold</h3>
        <div className="flex items-center gap-2">
          <Badge variant="brand">{codeScaffold.library}</Badge>
          <Badge variant="default">{codeScaffold.language}</Badge>
          <CopyButton text={codeScaffold.snippet} label="Code" />
        </div>
      </div>
      {codeScaffold.notes && (
        <p className="text-xs text-slate-400 italic bg-slate-800/60 rounded px-3 py-2">{codeScaffold.notes}</p>
      )}
      <div className="relative rounded-xl overflow-hidden border border-slate-700">
        <pre className="overflow-x-auto text-sm p-5 bg-slate-900 m-0">
          <code ref={ref} className={`language-${lang}`}>
            {codeScaffold.snippet}
          </code>
        </pre>
      </div>
    </div>
  );
}
