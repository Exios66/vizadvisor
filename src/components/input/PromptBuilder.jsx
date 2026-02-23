import Button from '../common/Button';
import Tooltip from '../common/Tooltip';

export default function PromptBuilder({ isReady, status, onSubmit, onReset }) {
  const isLoading = status === 'loading' || status === 'streaming';
  const hasResult = status === 'complete' || status === 'error';

  return (
    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
      <div className="text-xs text-slate-500 dark:text-slate-500">
        {!isReady && 'Upload data and describe your goal to continue'}
        {isReady  && status === 'idle' && '✓ Ready to analyze'}
        {isLoading && '⏳ Generating…'}
        {status === 'complete' && '✓ Recommendation ready'}
      </div>
      <div className="flex gap-2">
        {hasResult && (
          <Button variant="ghost" size="sm" onClick={onReset}>New Session</Button>
        )}
        <Tooltip content={!isReady ? 'Upload a dataset and describe your goal first' : ''}>
          <span>
            <Button
              variant="primary"
              size="md"
              disabled={!isReady || isLoading}
              loading={isLoading}
              onClick={onSubmit}
            >
              {isLoading ? 'Analyzing…' : hasResult ? 'Re-analyze' : 'Get Recommendation →'}
            </Button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
