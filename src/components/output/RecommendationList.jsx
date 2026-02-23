import RecommendationCard    from './RecommendationCard';
import DesignDecisionsPanel  from './DesignDecisionsPanel';
import AlternativeOptions    from './AlternativeOptions';
import PitfallWarnings       from './PitfallWarnings';
import CodeSnippet           from './CodeSnippet';
import FollowUpQuestions     from './FollowUpQuestions';
import ExportButton          from './ExportButton';
import Spinner               from '../common/Spinner';
import ErrorBanner           from '../common/ErrorBanner';

export default function RecommendationList({ status, recommendation, rawResponse, error, onRetry }) {
  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
        <span className="text-5xl" aria-hidden="true">📊</span>
        <p className="text-slate-600 dark:text-slate-400">Complete the form on the left to receive your visualization recommendation.</p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="space-y-4 animate-pulse" aria-label="Loading recommendation" role="status">
        <div className="h-6 w-48 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700" />
        <span className="sr-only">Generating your visualization recommendation…</span>
      </div>
    );
  }

  if (status === 'streaming') {
    return (
      <div className="space-y-4">
        <Spinner size="lg" label="Generating recommendation…" className="py-12" />
        {rawResponse && (
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-500 mb-2 font-mono">Streaming response…</p>
            <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words max-h-48 overflow-y-auto font-mono">
              {rawResponse}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <ErrorBanner
        title="Failed to get recommendation"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!recommendation) return null;

  const { meta, primary_recommendation, alternative_options, pitfalls, code_scaffold, follow_up_questions } = recommendation;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your Recommendation</h2>
        <ExportButton recommendation={recommendation} />
      </div>

      <RecommendationCard recommendation={primary_recommendation} meta={meta} />
      <DesignDecisionsPanel
        designDecisions={primary_recommendation.design_decisions}
        accessibility={primary_recommendation.accessibility}
        interactivity={primary_recommendation.interactivity}
      />
      <AlternativeOptions alternatives={alternative_options} />
      <PitfallWarnings pitfalls={pitfalls} />
      <CodeSnippet codeScaffold={code_scaffold} />
      {follow_up_questions?.length > 0 && <FollowUpQuestions questions={follow_up_questions} />}
    </div>
  );
}
