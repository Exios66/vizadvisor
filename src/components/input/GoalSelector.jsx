import { GOAL_CATEGORIES } from '../../services/promptTemplates';

export default function GoalSelector({ goal, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="goal-category" className="block text-sm font-medium text-slate-300 mb-1.5">
          Visualization Goal
        </label>
        <select
          id="goal-category"
          value={goal.category ?? ''}
          onChange={(e) => onChange({ category: e.target.value || null })}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Select a goal…</option>
          {GOAL_CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="goal-description" className="block text-sm font-medium text-slate-300 mb-1.5">
          Describe what you want to communicate
          <span className="text-red-400 ml-1" aria-label="required">*</span>
        </label>
        <textarea
          id="goal-description"
          value={goal.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="e.g. Show how monthly sales have changed over the past year across different product categories"
          rows={3}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
        />
      </div>

      <div>
        <label htmlFor="primary-question" className="block text-sm font-medium text-slate-300 mb-1.5">
          Primary question this chart must answer
          <span className="text-slate-500 ml-1 font-normal">(optional but recommended)</span>
        </label>
        <input
          id="primary-question"
          type="text"
          value={goal.primaryQuestion ?? ''}
          onChange={(e) => onChange({ primaryQuestion: e.target.value || null })}
          placeholder="e.g. Which region is growing fastest?"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
