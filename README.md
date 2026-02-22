# 📊 VizAdvisor — AI-Powered Data Visualization Recommender

> A frontend web application that allows users to describe their dataset and visualization goals, then receives tailored, LLM-powered recommendations on the best visualization strategies, chart types, and parameters for their specific use case.

-----

## 🗺️ Repository Map

```bash
vizadvisor/
│
├── README.md                          # This file — project overview & repo map
├── .env.example                       # Environment variable template
├── .gitignore
├── package.json
├── vite.config.js                     # or next.config.js if using Next.js
│
├── public/
│   └── favicon.svg
│
├── src/
│   │
│   ├── main.jsx                       # App entry point
│   ├── App.jsx                        # Root component + routing
│   │
│   ├── assets/                        # Static assets (logos, icons, etc.)
│   │
│   ├── components/                    # Reusable UI components
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Sidebar.jsx            # Optional: history / saved sessions
│   │   │
│   │   ├── input/
│   │   │   ├── DataUploader.jsx       # CSV / JSON file upload or paste
│   │   │   ├── DataPreview.jsx        # Table preview of uploaded data
│   │   │   ├── GoalSelector.jsx       # Dropdown: compare, trend, distribution, etc.
│   │   │   ├── ParameterPanel.jsx     # User-defined refinement params
│   │   │   └── PromptBuilder.jsx      # Assembles final prompt from all inputs
│   │   │
│   │   ├── output/
│   │   │   ├── RecommendationCard.jsx # Single viz recommendation block
│   │   │   ├── RecommendationList.jsx # Renders all LLM suggestions
│   │   │   ├── CodeSnippet.jsx        # Syntax-highlighted code example
│   │   │   └── ExportButton.jsx       # Copy / download recommendations
│   │   │
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Spinner.jsx
│   │       ├── Modal.jsx
│   │       ├── Tooltip.jsx
│   │       └── ErrorBanner.jsx
│   │
│   ├── pages/                         # Top-level route pages
│   │   ├── HomePage.jsx               # Landing / intro
│   │   ├── AdvisorPage.jsx            # Main tool: input + output side-by-side
│   │   └── AboutPage.jsx              # What this tool does, how it works
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useLLM.js                  # Handles API call to LLM, streaming, errors
│   │   ├── useDataParser.js           # Parses CSV/JSON, infers column types
│   │   └── useSessionHistory.js       # Saves/loads past sessions (localStorage)
│   │
│   ├── services/                      # API & data layer
│   │   ├── llmService.js              # Sends prompt to LLM API (Anthropic/OpenAI/etc.)
│   │   ├── dataService.js             # Data parsing, schema inference utilities
│   │   └── promptTemplates.js         # System prompt + user prompt construction logic
│   │
│   ├── context/                       # Global state via React Context
│   │   ├── SessionContext.jsx         # Current session data, recommendations
│   │   └── SettingsContext.jsx        # User preferences (model, verbosity, etc.)
│   │
│   ├── utils/                         # Pure utility functions
│   │   ├── columnTypeInferrer.js      # Detect numeric, categorical, datetime columns
│   │   ├── chartTypeMapper.js         # Maps goal + data types → candidate chart types
│   │   └── formatters.js             # Format numbers, dates for display
│   │
│   └── styles/                        # Global and component styles
│       ├── global.css
│       └── theme.js                   # Design tokens (colors, spacing, fonts)
│
├── tests/
│   ├── unit/
│   │   ├── columnTypeInferrer.test.js
│   │   ├── chartTypeMapper.test.js
│   │   └── promptTemplates.test.js
│   └── integration/
│       └── AdvisorFlow.test.jsx
│
└── docs/
    ├── ARCHITECTURE.md                # System design decisions
    ├── PROMPT_DESIGN.md               # How prompts are constructed & why
    └── CONTRIBUTING.md
```

-----

## 🧠 Core Concept & Data Flow

```
User Input
    │
    ├─ [1] Upload or paste dataset (CSV / JSON / manual description)
    ├─ [2] Select visualization goal
    │       (e.g., Compare categories, Show trend over time,
    │              Show distribution, Explore correlation, Part-of-whole)
    ├─ [3] Set optional parameters
    │       (audience, interactivity level, chart library preference,
    │        accessibility needs, color theme, data volume)
    │
    ▼
PromptBuilder.jsx
    │  Assembles structured prompt:
    │  - System prompt (expert data viz consultant persona)
    │  - Data schema + sample rows
    │  - Goal + parameters
    │
    ▼
llmService.js → LLM API (Anthropic Claude / OpenAI / etc.)
    │
    ▼
RecommendationList.jsx
    │  Renders structured LLM response:
    │  - Top chart type picks with rationale
    │  - Key design parameters (axes, color encoding, etc.)
    │  - Library-specific code snippet
    │  - Warnings or caveats (e.g., overplotting risk)
    │
    ▼
ExportButton.jsx → Copy to clipboard / Download as .md or .json
```

-----

## ⚙️ Key Features to Implement

|Feature                   |Component(s)                         |Status|
|--------------------------|-------------------------------------|------|
|CSV/JSON upload + preview |`DataUploader`, `DataPreview`        |🔲 TODO|
|Auto column type inference|`useDataParser`, `columnTypeInferrer`|🔲 TODO|
|Goal selector UI          |`GoalSelector`                       |🔲 TODO|
|Refinement parameter panel|`ParameterPanel`                     |🔲 TODO|
|Prompt assembly & LLM call|`PromptBuilder`, `llmService`        |🔲 TODO|
|Streaming response display|`RecommendationList`, `useLLM`       |🔲 TODO|
|Code snippet output       |`CodeSnippet`                        |🔲 TODO|
|Session history (local)   |`useSessionHistory`                  |🔲 TODO|
|Model/settings toggle     |`SettingsContext`                    |🔲 TODO|
|Export recommendations    |`ExportButton`                       |🔲 TODO|

-----

## 🔧 Environment Variables

```bash
# .env.example

# LLM Provider (choose one)
VITE_LLM_PROVIDER=anthropic           # anthropic | openai | custom

# API Keys (set in your own .env — never commit!)
VITE_ANTHROPIC_API_KEY=your_key_here
VITE_OPENAI_API_KEY=your_key_here

# Model Selection
VITE_DEFAULT_MODEL=claude-sonnet-4-6  # or gpt-4o, etc.

# Optional: proxy backend URL (if routing API calls through your own server)
VITE_API_PROXY_URL=
```

> ⚠️ **Note:** For production, route API calls through a backend proxy so API keys are never exposed client-side.

-----

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/vizadvisor.git
cd vizadvisor

# Install dependencies
npm install

# Copy env template and fill in your API key
cp .env.example .env

# Start dev server
npm run dev
```

-----

## 📐 Prompt Design Philosophy

The system prompt should position the LLM as a senior data visualization consultant. Key elements:

1. **Role framing** — expert in data viz best practices (Tufte, Munzner, etc.)
1. **Data context** — column names, inferred types, row count, sample data
1. **Goal specification** — what the user wants to communicate
1. **Constraint parameters** — audience, tooling, interactivity, accessibility
1. **Output format** — structured JSON or markdown with sections:
- Primary recommendation + rationale
- Alternative options
- Key design decisions (encoding, scale, color)
- Code scaffold (in user’s preferred library)
- Pitfalls to avoid

See `docs/PROMPT_DESIGN.md` for full templates.

-----

## 🗂️ Visualization Goals Supported

- **Comparison** — bar, grouped bar, dot plot, radar
- **Trend over time** — line, area, candlestick, streamgraph
- **Distribution** — histogram, violin, box plot, beeswarm
- **Correlation** — scatter, bubble, heatmap, parallel coordinates
- **Part-of-whole** — pie, donut, treemap, sunburst, waffle
- **Geospatial** — choropleth, dot map, flow map
- **Network/Flow** — Sankey, chord, force-directed graph
- **Ranking** — slope chart, bump chart, lollipop

-----

## 📚 Tech Stack (Recommended)

|Layer            |Choice                  |Notes                             |
|-----------------|------------------------|----------------------------------|
|Framework        |React + Vite            |Fast, modern, minimal config      |
|Styling          |Tailwind CSS            |Utility-first, easy theming       |
|State            |React Context + hooks   |Lightweight; add Zustand if needed|
|LLM API          |Anthropic Claude        |Via `@anthropic-ai/sdk`           |
|Data parsing     |PapaParse               |CSV; native JSON.parse for JSON   |
|Code highlighting|Prism.js or Shiki       |Syntax highlight code snippets    |
|Routing          |React Router v6         |Simple page routing               |
|Testing          |Vitest + Testing Library|Unit + integration                |

-----

*Last updated: February 2026 — scaffold version 1.0*
