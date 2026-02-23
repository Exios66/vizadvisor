import { useSession } from '../context/SessionContext';
import { useLLM } from '../hooks/useLLM';
import { useDataParser } from '../hooks/useDataParser';

import DataUploader    from '../components/input/DataUploader';
import DataPreview     from '../components/input/DataPreview';
import GoalSelector    from '../components/input/GoalSelector';
import ParameterPanel  from '../components/input/ParameterPanel';
import PromptBuilder   from '../components/input/PromptBuilder';
import RecommendationList from '../components/output/RecommendationList';

export default function AdvisorPage() {
  const { state, setDataset, setDatasetError, overrideType, setGoal, setParameters, resetSession } = useSession();
  const { submit, isReady, status, recommendation, rawResponse, error } = useLLM();
  const parser = useDataParser();

  const handleFile = async (file) => {
    const result = await parser.parse(file);
    if (result) setDataset(result);
    else setDatasetError(parser.error);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Data Visualization Advisor</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Upload your dataset, describe your goal, and receive expert visualization recommendations powered by AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6 lg:sticky lg:top-20">
          <Section title="1 · Upload Dataset">
            <DataUploader
              onFileParsed={handleFile}
              parseStatus={parser.status}
              parseError={parser.error}
              parseWarning={parser.warning}
            />
          </Section>

          {state.dataset?.schema && (
            <Section title="2 · Review Schema">
              <DataPreview
                schema={state.dataset.schema}
                sampleRows={state.dataset.sampleRows}
                rowCount={state.dataset.rowCount}
                onTypeOverride={overrideType}
              />
            </Section>
          )}

          <Section title="3 · Define Your Goal">
            <GoalSelector goal={state.goal} onChange={setGoal} />
          </Section>

          <Section title="4 · Set Parameters">
            <ParameterPanel parameters={state.parameters} onChange={setParameters} />
          </Section>

          <PromptBuilder
            isReady={isReady}
            status={status}
            onSubmit={submit}
            onReset={resetSession}
          />
        </div>

        <div className="min-h-[400px]" aria-live="polite" aria-label="Recommendation output">
          <RecommendationList
            status={status}
            recommendation={recommendation}
            rawResponse={rawResponse}
            error={error}
            onRetry={submit}
          />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}
