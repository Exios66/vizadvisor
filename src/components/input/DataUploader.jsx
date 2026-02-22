import { useState, useRef, useCallback } from 'react';
import ErrorBanner from '../common/ErrorBanner';
import { formatFileSize } from '../../utils/formatters';

const ACCEPTED_TYPES = '.csv,.tsv,.json,.txt';

export default function DataUploader({ onFileParsed, parseStatus, parseError, parseWarning }) {
  const [dragging, setDragging]   = useState(false);
  const [fileName, setFileName]   = useState(null);
  const [fileSize, setFileSize]   = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size);
    onFileParsed(file);
  }, [onFileParsed]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onInputChange = (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); };

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload dataset file — CSV or JSON"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={onInputChange}
          className="sr-only"
          aria-hidden="true"
        />
        <div className="space-y-2">
          <div className="text-3xl" aria-hidden="true">
            {parseStatus === 'parsing' ? '⏳' : fileName ? '✅' : '📂'}
          </div>
          {fileName ? (
            <div>
              <p className="font-medium text-slate-200">{fileName}</p>
              <p className="text-sm text-slate-400">{formatFileSize(fileSize)}</p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-slate-300">Drop your file here</p>
              <p className="text-sm text-slate-400">CSV or JSON • Up to 20 MB</p>
            </div>
          )}
          {parseStatus === 'parsing' && (
            <p className="text-sm text-indigo-400 animate-pulse">Parsing dataset…</p>
          )}
        </div>
      </div>

      {parseWarning && (
        <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300">
          <span aria-hidden="true">⚠️</span>
          <span>{parseWarning}</span>
        </div>
      )}

      {parseError && (
        <ErrorBanner
          title="Could not parse file"
          message={parseError}
          onDismiss={() => {}}
        />
      )}
    </div>
  );
}
