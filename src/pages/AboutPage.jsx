export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">About VizAdvisor</h1>

      <Section title="What it does">
        <p>VizAdvisor is a front-end application that connects your dataset and communication goal to a large language model trained on best practices from the data visualization literature. It analyzes your schema, task, audience, and constraints to recommend the optimal chart type, encoding decisions, color palette, interactivity patterns, and accessibility approach — then generates working code in your preferred library.</p>
      </Section>

      <Section title="Theoretical foundation">
        <p>Recommendations are grounded in a curated body of visualization research:</p>
        <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
          {['Edward Tufte — data-ink ratio, chartjunk, small multiples',
            'Tamara Munzner — What-Why-How framework, channel effectiveness',
            'Alberto Cairo — truthful, functional, and beautiful visualization',
            'Stephen Few — perceptual efficiency and dashboard design',
            'Colin Ware — visual perception and pre-attentive attributes',
            'Claus Wilke — principles of figure design',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <span className="text-indigo-500 dark:text-indigo-400 mt-0.5" aria-hidden="true">▸</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Privacy">
        <p>Your data never leaves your browser. Only the column schema, a small sample of rows (5 rows maximum), and row count are sent to the LLM API. Raw data files are never transmitted or stored.</p>
      </Section>

      <Section title="Technology">
        <p>Built with React, Vite, and Tailwind CSS. Powered by Anthropic&apos;s Claude API. Chart library recommendations cover Recharts, D3.js, Plotly, Chart.js, Vega-Lite, Observable Plot, Matplotlib, Altair, and ggplot2.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
      <div className="text-slate-600 dark:text-slate-400 leading-relaxed">{children}</div>
    </div>
  );
}
