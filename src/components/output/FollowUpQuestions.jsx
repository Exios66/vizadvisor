export default function FollowUpQuestions({ questions }) {
  if (!questions?.length) return null;
  return (
    <div className="rounded-lg border border-sky-200 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/5 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-2">
        <span aria-hidden="true">💬</span> Clarifying Questions
      </h3>
      <ul className="space-y-1.5">
        {questions.map((q, i) => (
          <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <span className="text-sky-600 dark:text-sky-400 font-bold mt-0.5" aria-hidden="true">{i + 1}.</span>
            {q}
          </li>
        ))}
      </ul>
    </div>
  );
}
