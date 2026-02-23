import Button from './Button';

export default function ErrorBanner({ title = 'An error occurred', message, onRetry, onDismiss }) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-500 dark:text-red-400 text-lg flex-shrink-0" aria-hidden="true">⚠</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-red-700 dark:text-red-300">{title}</p>
          {message && <p className="text-sm text-red-600 dark:text-red-400/80 mt-1 break-words">{message}</p>}
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <Button variant="danger" size="sm" onClick={onRetry}>Retry</Button>
            )}
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>Dismiss</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
