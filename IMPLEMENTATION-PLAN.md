# VizAdvisor — Implementation & Development Plan

> **Version:** 1.0 | **Date:** February 2026  
> **Purpose:** Authoritative, agent-readable build specification. Every file, every configuration, every dependency, every implementation detail required to take VizAdvisor from an empty repository to a shippable product. Execute phases in order. Do not skip steps.

-----

## Quick Reference

|Phase|Name                  |Deliverable                                           |
|-----|----------------------|------------------------------------------------------|
|0    |Repository Bootstrap  |Initialized repo, toolchain, CI skeleton              |
|1    |Project Scaffold      |All directories, all empty files, all config files    |
|2    |Core Infrastructure   |Context, state machine, routing, design system        |
|3    |Data Input Pipeline   |Upload, parsing, schema inference, preview            |
|4    |Prompt Layer          |Prompt templates, LLM service, streaming              |
|5    |Output Rendering      |All recommendation UI components                      |
|6    |Integration & Wiring  |End-to-end data flow, full session lifecycle          |
|7    |Testing               |Unit, integration, golden-path prompt tests           |
|8    |Accessibility & Polish|WCAG AA, keyboard nav, responsive layout              |
|9    |Performance           |Bundle optimization, lazy loading, streaming UX       |
|10   |Production Readiness  |Env config, proxy server, error monitoring, deployment|

-----

## Phase 0 — Repository Bootstrap

### 0.1 Initialize the Git Repository

```bash
mkdir vizadvisor
cd vizadvisor
git init
git branch -M main
```

### 0.2 Create the Vite + React Project

```bash
npm create vite@latest . -- --template react
```

Accept the prompt to scaffold into the current directory. This generates:

- `index.html`
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`
- `src/App.css`
- `src/index.css`
- `src/assets/react.svg`
- `public/vite.svg`
- `package.json`

### 0.3 Install Core Dependencies

```bash
# Runtime dependencies
npm install \
  react-router-dom \
  papaparse \
  prismjs \
  react-simple-code-editor \
  @anthropic-ai/sdk

# Dev dependencies
npm install -D \
  @vitejs/plugin-react \
  eslint \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y \
  prettier \
  vitest \
  @vitest/ui \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  autoprefixer \
  tailwindcss \
  postcss
```

### 0.4 Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

This generates `tailwind.config.js` and `postcss.config.js`.

**Edit `tailwind.config.js`:**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

### 0.5 Configure ESLint

Create `.eslintrc.cjs` in the project root:

```js
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  rules: {
    'react/prop-types': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'jsx-a11y/anchor-is-valid': 'warn',
  },
};
```

### 0.6 Configure Prettier

Create `.prettierrc` in the project root:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "jsxSingleQuote": false
}
```

Create `.prettierignore`:

```
dist/
node_modules/
.env*
```

### 0.7 Configure Vitest

Edit `vite.config.js` to add test configuration:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'dist/'],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### 0.8 Add npm Scripts

Edit `package.json` scripts section:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext js,jsx --fix",
    "format": "prettier --write src/",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:prompts": "vitest run tests/prompts/",
    "typecheck": "tsc --noEmit"
  }
}
```

### 0.9 Create .gitignore

```
# Dependencies
node_modules/

# Build output
dist/
build/

# Environment — NEVER commit
.env
.env.local
.env.*.local

# Editor
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Test coverage
coverage/

# Logs
*.log
npm-debug.log*

# Vite
.vite/
```

### 0.10 Create .env.example

```bash
# ─────────────────────────────────────────────
# VizAdvisor Environment Configuration
# Copy this file to .env and fill in your values.
# NEVER commit .env to source control.
# ─────────────────────────────────────────────

# LLM Provider: anthropic | openai
VITE_LLM_PROVIDER=anthropic

# Anthropic API Key (get from console.anthropic.com)
VITE_ANTHROPIC_API_KEY=your_anthropic_key_here

# OpenAI API Key (if using OpenAI provider)
VITE_OPENAI_API_KEY=your_openai_key_here

# Default model
VITE_DEFAULT_MODEL=claude-sonnet-4-6

# Optional: proxy backend URL for production
# When set, all LLM calls route through this URL instead of direct to API
VITE_API_PROXY_URL=

# Max tokens for LLM response (do not reduce below 1000)
VITE_MAX_TOKENS=2048

# Request timeout in milliseconds
VITE_REQUEST_TIMEOUT_MS=30000

# App environment
VITE_APP_ENV=development
```

### 0.11 Initialize GitHub Actions CI

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npx prettier --check src/

      - name: Run unit & integration tests
        run: npm run test

      - name: Build
        run: npm run build
```

### 0.12 Initial Commit

```bash
git add .
git commit -m "chore: bootstrap Vite/React project with Tailwind, ESLint, Vitest"
git remote add origin https://github.com/YOUR-USERNAME/vizadvisor.git
git push -u origin main
```

-----

## Phase 1 — Project Scaffold

Create every directory and every file in the correct location. Files will be empty or contain a minimal placeholder at this stage. The complete directory and file list must match exactly.

### 1.1 Create Directory Structure

```bash
# src directories
mkdir -p src/assets
mkdir -p src/components/layout
mkdir -p src/components/input
mkdir -p src/components/output
mkdir -p src/components/common
mkdir -p src/pages
mkdir -p src/hooks
mkdir -p src/services
mkdir -p src/context
mkdir -p src/utils
mkdir -p src/styles

# test directories
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/prompts

# docs directory
mkdir -p docs
```

### 1.2 Create All Source Files (Empty Placeholders)

```bash
# Components — layout
touch src/components/layout/Header.jsx
touch src/components/layout/Footer.jsx
touch src/components/layout/Sidebar.jsx

# Components — input
touch src/components/input/DataUploader.jsx
touch src/components/input/DataPreview.jsx
touch src/components/input/GoalSelector.jsx
touch src/components/input/ParameterPanel.jsx
touch src/components/input/PromptBuilder.jsx

# Components — output
touch src/components/output/RecommendationCard.jsx
touch src/components/output/RecommendationList.jsx
touch src/components/output/DesignDecisionsPanel.jsx
touch src/components/output/AlternativeOptions.jsx
touch src/components/output/PitfallWarnings.jsx
touch src/components/output/CodeSnippet.jsx
touch src/components/output/FollowUpQuestions.jsx
touch src/components/output/ExportButton.jsx
touch src/components/output/MetaBadges.jsx

# Components — common
touch src/components/common/Button.jsx
touch src/components/common/Spinner.jsx
touch src/components/common/Modal.jsx
touch src/components/common/Tooltip.jsx
touch src/components/common/ErrorBanner.jsx
touch src/components/common/Badge.jsx
touch src/components/common/CopyButton.jsx

# Pages
touch src/pages/HomePage.jsx
touch src/pages/AdvisorPage.jsx
touch src/pages/AboutPage.jsx

# Hooks
touch src/hooks/useLLM.js
touch src/hooks/useDataParser.js
touch src/hooks/useSessionHistory.js

# Services
touch src/services/llmService.js
touch src/services/dataService.js
touch src/services/promptTemplates.js

# Context
touch src/context/SessionContext.jsx
touch src/context/SettingsContext.jsx

# Utils
touch src/utils/columnTypeInferrer.js
touch src/utils/chartTypeMapper.js
touch src/utils/formatters.js
touch src/utils/responseValidator.js

# Styles
touch src/styles/global.css
touch src/styles/theme.js

# Tests
touch tests/setup.js
touch tests/unit/columnTypeInferrer.test.js
touch tests/unit/chartTypeMapper.test.js
touch tests/unit/promptTemplates.test.js
touch tests/unit/responseValidator.test.js
touch tests/integration/AdvisorFlow.test.jsx
touch tests/prompts/comparison-goal.json
touch tests/prompts/trend-goal.json
touch tests/prompts/distribution-goal.json

# Docs — copy or create
touch docs/ARCHITECTURE.md
touch docs/PROMPT_DESIGN.md
touch docs/DATA_VIZ_REFERENCE.md
touch docs/CONTRIBUTING.md
```

### 1.3 Create Test Setup File

Write `tests/setup.js`:

```js
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

### 1.4 Commit Scaffold

```bash
git add .
git commit -m "chore: scaffold all directories and empty source files"
```

-----

## Phase 2 — Core Infrastructure

Implement the design system, routing, and global state before any feature-specific code.

### 2.1 Global CSS & Design Tokens

**Write `src/styles/global.css`:**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-bg-primary:   #0f172a;
    --color-bg-secondary: #1e293b;
    --color-bg-tertiary:  #334155;
    --color-text-primary: #f1f5f9;
    --color-text-muted:   #94a3b8;
    --color-border:       #334155;
    --color-brand:        #6366f1;
    --color-brand-light:  #818cf8;
    --color-success:      #10b981;
    --color-warning:      #f59e0b;
    --color-error:        #ef4444;
    --color-info:         #38bdf8;
    --radius-sm:          4px;
    --radius-md:          8px;
    --radius-lg:          12px;
    --transition-fast:    150ms ease;
    --transition-normal:  250ms ease;
  }

  * { box-sizing: border-box; }

  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  ::selection {
    background-color: #6366f140;
    color: #e0e7ff;
  }

  :focus-visible {
    outline: 2px solid var(--color-brand);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--color-bg-secondary); }
  ::-webkit-scrollbar-thumb { background: var(--color-bg-tertiary); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-brand); }
}
```

**Write `src/styles/theme.js`:**

```js
export const colors = {
  bg: {
    primary:   '#0f172a',
    secondary: '#1e293b',
    tertiary:  '#334155',
    card:      '#1e293b',
    elevated:  '#293548',
  },
  text: {
    primary: '#f1f5f9',
    muted:   '#94a3b8',
    faint:   '#64748b',
    inverse: '#0f172a',
  },
  brand: {
    DEFAULT: '#6366f1',
    light:   '#818cf8',
    dark:    '#4f46e5',
    subtle:  '#6366f115',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error:   '#ef4444',
    info:    '#38bdf8',
  },
  border: {
    DEFAULT: '#334155',
    subtle:  '#1e293b',
    strong:  '#475569',
  },
};

export const spacing = {
  xs: '4px',  sm: '8px',  md: '16px',
  lg: '24px', xl: '32px', xxl: '48px',
};

export const radius = {
  sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px',
};

export const shadows = {
  sm:  '0 1px 3px rgba(0,0,0,0.4)',
  md:  '0 4px 12px rgba(0,0,0,0.5)',
  lg:  '0 8px 24px rgba(0,0,0,0.6)',
  glow:'0 0 20px rgba(99,102,241,0.3)',
};
```

### 2.2 Implement Common Components

**Write `src/components/common/Button.jsx`:**

```jsx
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600',
    ghost:     'hover:bg-slate-800 text-slate-300 hover:text-slate-100',
    danger:    'bg-red-600 hover:bg-red-500 text-white',
    outline:   'border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
```

**Write `src/components/common/Spinner.jsx`:**

```jsx
export default function Spinner({ size = 'md', label = 'Loading…', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10', xl: 'h-16 w-16' };
  return (
    <div role="status" className={`flex flex-col items-center gap-3 ${className}`}>
      <svg
        className={`animate-spin text-indigo-400 ${sizes[size]}`}
        viewBox="0 0 24 24" fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label && <span className="text-sm text-slate-400">{label}</span>}
      <span className="sr-only">{label}</span>
    </div>
  );
}
```

**Write `src/components/common/ErrorBanner.jsx`:**

```jsx
import Button from './Button';

export default function ErrorBanner({ title = 'An error occurred', message, onRetry, onDismiss }) {
  return (
    <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-400 text-lg flex-shrink-0" aria-hidden="true">⚠</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-red-300">{title}</p>
          {message && <p className="text-sm text-red-400/80 mt-1 break-words">{message}</p>}
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
```

**Write `src/components/common/Badge.jsx`:**

```jsx
export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-700 text-slate-300',
    brand:   'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    error:   'bg-red-500/20 text-red-300 border border-red-500/30',
    info:    'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
```

**Write `src/components/common/CopyButton.jsx`:**

```jsx
import { useState } from 'react';
import Button from './Button';

export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={className}
      aria-label={copied ? 'Copied!' : `Copy ${label} to clipboard`}
    >
      {copied ? '✓ Copied' : `⎘ ${label}`}
    </Button>
  );
}
```

**Write `src/components/common/Tooltip.jsx`:**

```jsx
import { useState } from 'react';

export default function Tooltip({ children, content, position = 'top' }) {
  const [visible, setVisible] = useState(false);

  const positions = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2 py-1 text-xs text-white bg-slate-900 border border-slate-700 rounded shadow-lg whitespace-nowrap pointer-events-none ${positions[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
```

**Write `src/components/common/Modal.jsx`:**

```jsx
import { useEffect } from 'react';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative w-full ${sizes[size]} bg-slate-900 border border-slate-700 rounded-xl shadow-2xl`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-100">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">✕</Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
```

### 2.3 Implement SessionContext

**Write `src/context/SessionContext.jsx`:**

```jsx
import { createContext, useContext, useReducer, useCallback } from 'react';

const initialState = {
  dataset: {
    rawFile: null, rowCount: null, schema: null,
    sampleRows: null, parseError: null,
  },
  goal: { description: '', category: null, primaryQuestion: null },
  parameters: {
    audience: null, library: null, language: 'javascript',
    interactivity: null, accessibility: null, extraNotes: null,
  },
  status: 'idle',
  rawResponse: null,
  recommendation: null,
  llmError: null,
  conversationHistory: [],
  sessionId: crypto.randomUUID(),
};

function sessionReducer(state, action) {
  switch (action.type) {
    case 'SET_DATASET':
      return { ...state, dataset: { ...state.dataset, ...action.payload, parseError: null } };
    case 'SET_DATASET_ERROR':
      return { ...state, dataset: { ...initialState.dataset, parseError: action.payload } };
    case 'SET_SCHEMA_OVERRIDE': {
      const schema = state.dataset.schema.map((col) =>
        col.name === action.payload.name ? { ...col, type: action.payload.type } : col
      );
      return { ...state, dataset: { ...state.dataset, schema } };
    }
    case 'SET_GOAL':
      return { ...state, goal: { ...state.goal, ...action.payload } };
    case 'SET_PARAMETERS':
      return { ...state, parameters: { ...state.parameters, ...action.payload } };
    case 'SUBMIT_REQUEST':
      return { ...state, status: 'loading', rawResponse: null, recommendation: null, llmError: null };
    case 'STREAM_CHUNK':
      return { ...state, status: 'streaming', rawResponse: (state.rawResponse || '') + action.payload };
    case 'REQUEST_COMPLETE':
      return { ...state, status: 'complete', recommendation: action.payload };
    case 'REQUEST_ERROR':
      return { ...state, status: 'error', llmError: action.payload };
    case 'APPEND_HISTORY':
      return { ...state, conversationHistory: [...state.conversationHistory, action.payload] };
    case 'RESET_SESSION':
      return { ...initialState, sessionId: crypto.randomUUID() };
    default:
      return state;
  }
}

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const setDataset      = useCallback((data) => dispatch({ type: 'SET_DATASET', payload: data }), []);
  const setDatasetError = useCallback((msg)  => dispatch({ type: 'SET_DATASET_ERROR', payload: msg }), []);
  const overrideType    = useCallback((name, type) => dispatch({ type: 'SET_SCHEMA_OVERRIDE', payload: { name, type } }), []);
  const setGoal         = useCallback((data) => dispatch({ type: 'SET_GOAL', payload: data }), []);
  const setParameters   = useCallback((data) => dispatch({ type: 'SET_PARAMETERS', payload: data }), []);
  const appendHistory   = useCallback((turn) => dispatch({ type: 'APPEND_HISTORY', payload: turn }), []);
  const resetSession    = useCallback(()     => dispatch({ type: 'RESET_SESSION' }), []);

  return (
    <SessionContext.Provider value={{ state, dispatch, setDataset, setDatasetError, overrideType, setGoal, setParameters, appendHistory, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
```

### 2.4 Implement SettingsContext

**Write `src/context/SettingsContext.jsx`:**

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'vizadvisor:settings';

const defaultSettings = {
  provider: import.meta.env.VITE_LLM_PROVIDER || 'anthropic',
  model:    import.meta.env.VITE_DEFAULT_MODEL  || 'claude-sonnet-4-6',
  library:  'recharts',
  language: 'javascript',
  theme:    'dark',
  verbosity:'standard',
  streaming: true,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings]);

  const updateSettings = (patch) => setSettingsState((prev) => ({ ...prev, ...patch }));
  const resetSettings  = () => setSettingsState(defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
```

### 2.5 Configure Routing & App Shell

**Write `src/App.jsx`:**

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { SettingsProvider } from './context/SettingsContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage    from './pages/HomePage';
import AdvisorPage from './pages/AdvisorPage';
import AboutPage   from './pages/AboutPage';

export default function App() {
  return (
    <SettingsProvider>
      <SessionProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-slate-950">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/"        element={<HomePage />} />
                <Route path="/advisor" element={<AdvisorPage />} />
                <Route path="/about"   element={<AboutPage />} />
                <Route path="*"        element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </SessionProvider>
    </SettingsProvider>
  );
}
```

**Update `src/main.jsx`:**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2.6 Implement Layout Components

**Write `src/components/layout/Header.jsx`:**

```jsx
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/advisor', label: 'Advisor' },
  { to: '/about',   label: 'About' },
];

export default function Header() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl" aria-hidden="true">📊</span>
          <span className="font-bold text-lg text-slate-100 group-hover:text-indigo-400 transition-colors">
            VizAdvisor
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === to
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                  aria-current={pathname === to ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
```

**Write `src/components/layout/Footer.jsx`:**

```jsx
export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
        <p>VizAdvisor — AI-powered data visualization recommendations</p>
        <p>Built with React, Vite & Claude</p>
      </div>
    </footer>
  );
}
```

### 2.7 Commit Infrastructure

```bash
git add .
git commit -m "feat: implement core infrastructure — context, routing, design system, common components"
```

-----

## Phase 3 — Data Input Pipeline

### 3.1 Implement Column Type Inferrer

**Write `src/utils/columnTypeInferrer.js`:**

```js
const TEMPORAL_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/,
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/,
  /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
  /^\d{1,2}-[A-Za-z]{3}-\d{2,4}$/,
  /^[A-Za-z]{3,9}\s\d{1,2},?\s\d{4}$/,
];

const GEO_COLUMN_NAMES = /^(country|state|province|region|city|zip|postal|fips|lat|lng|latitude|longitude|geo|location)$/i;
const BOOLEAN_VALUES   = new Set(['true','false','yes','no','y','n','1','0','t','f']);
const ORDINAL_TOKENS   = /^(low|med|medium|high|very\s+high|small|large|none|some|many|1st|2nd|3rd|\d+(st|nd|rd|th)|poor|fair|good|excellent|never|rarely|sometimes|often|always)$/i;

function sample(values, n = 100) {
  if (values.length <= n) return values;
  const step = Math.floor(values.length / n);
  return Array.from({ length: n }, (_, i) => values[i * step]);
}

function nonNull(values) {
  return values.filter((v) => v != null && v !== '' && v !== 'null' && v !== 'NA' && v !== 'N/A');
}

export function inferColumnType(values) {
  const valid   = nonNull(sample(values));
  const total   = valid.length;
  if (total === 0) return { type: 'unknown', cardinality: 0, nullable: true, range: null };

  const nullable    = values.length > valid.length;
  const unique      = new Set(valid.map(String)).size;
  const cardinality = unique;

  // Boolean
  const lv = valid.map((v) => String(v).toLowerCase().trim());
  if (lv.every((v) => BOOLEAN_VALUES.has(v))) {
    return { type: 'boolean', cardinality, nullable, range: null };
  }

  // Temporal
  const temporalCount = valid.filter((v) => TEMPORAL_PATTERNS.some((p) => p.test(String(v).trim()))).length;
  if (temporalCount / total >= 0.8) {
    const sorted = [...valid].sort();
    return { type: 'temporal', cardinality, nullable, range: `${sorted[0]} → ${sorted[sorted.length - 1]}` };
  }

  // Quantitative
  const nums = valid.map((v) => parseFloat(String(v).replace(/[$,%]/g, '')));
  const quantCount = nums.filter((n) => !isNaN(n) && isFinite(n)).length;
  if (quantCount / total >= 0.9) {
    const clean = nums.filter((n) => !isNaN(n));
    const min   = Math.min(...clean);
    const max   = Math.max(...clean);
    return {
      type: 'quantitative',
      cardinality,
      nullable,
      range: `${min.toLocaleString()} – ${max.toLocaleString()}`,
    };
  }

  // Geographic (by column name hint — caller passes colName separately)
  // See inferSchema() below for column-name-aware detection

  // Ordinal (low cardinality + ordered tokens)
  if (cardinality <= 12 && lv.every((v) => ORDINAL_TOKENS.test(v))) {
    return { type: 'ordinal', cardinality, nullable, range: null };
  }

  // Nominal default
  return { type: 'nominal', cardinality, nullable, range: null };
}

export function inferSchema(headers, rows) {
  return headers.map((name) => {
    const values = rows.map((row) => row[name]);
    const inferred = inferColumnType(values);
    // Upgrade to geographic if column name matches known geo identifiers
    if (GEO_COLUMN_NAMES.test(name.trim())) {
      inferred.type = 'geographic';
    }
    return { name, ...inferred };
  });
}
```

### 3.2 Implement Chart Type Mapper

**Write `src/utils/chartTypeMapper.js`:**

```js
// Maps (goalCategory × dataProfile) to ranked candidate chart types.
// The LLM makes the final selection; this provides UI hints and pre-filtering.

export const CHART_CANDIDATES = {
  comparison: [
    { type: 'bar chart',         score: 10, bestFor: ['nominal', 'ordinal'] },
    { type: 'grouped bar chart', score: 9,  bestFor: ['nominal', 'ordinal'], minCols: 2 },
    { type: 'dot plot',          score: 7,  bestFor: ['nominal'] },
    { type: 'radar chart',       score: 4,  bestFor: ['ordinal'], maxCols: 10, warn: 'Use only when shape pattern matters' },
  ],
  trend: [
    { type: 'line chart',        score: 10, bestFor: ['temporal'] },
    { type: 'area chart',        score: 8,  bestFor: ['temporal'] },
    { type: 'stacked area',      score: 6,  bestFor: ['temporal'], minSeries: 2 },
    { type: 'candlestick',       score: 5,  bestFor: ['temporal'], domain: 'financial' },
  ],
  distribution: [
    { type: 'histogram',         score: 10, bestFor: ['quantitative'] },
    { type: 'density plot',      score: 9,  bestFor: ['quantitative'] },
    { type: 'box plot',          score: 8,  bestFor: ['quantitative'] },
    { type: 'violin plot',       score: 7,  bestFor: ['quantitative'] },
    { type: 'beeswarm',          score: 5,  bestFor: ['quantitative'], maxRows: 300 },
  ],
  correlation: [
    { type: 'scatter plot',      score: 10, bestFor: ['quantitative'] },
    { type: 'bubble chart',      score: 8,  bestFor: ['quantitative'], minCols: 3 },
    { type: 'heatmap',           score: 7,  bestFor: ['quantitative', 'ordinal'] },
    { type: 'parallel coords',   score: 6,  bestFor: ['quantitative'], minCols: 4 },
  ],
  'part-of-whole': [
    { type: 'stacked bar',       score: 10, bestFor: ['nominal', 'ordinal'] },
    { type: 'treemap',           score: 8,  bestFor: ['nominal'] },
    { type: 'pie chart',         score: 5,  bestFor: ['nominal'], maxCategories: 5 },
    { type: 'donut chart',       score: 5,  bestFor: ['nominal'], maxCategories: 5 },
    { type: 'waffle chart',      score: 6,  bestFor: ['nominal'], maxCategories: 4 },
  ],
  geospatial: [
    { type: 'choropleth map',    score: 10, bestFor: ['geographic'] },
    { type: 'symbol map',        score: 9,  bestFor: ['geographic'] },
    { type: 'dot density map',   score: 7,  bestFor: ['geographic'] },
    { type: 'flow map',          score: 6,  bestFor: ['geographic'] },
  ],
  'network-flow': [
    { type: 'sankey diagram',    score: 10, bestFor: ['nominal'] },
    { type: 'chord diagram',     score: 8,  bestFor: ['nominal'] },
    { type: 'force graph',       score: 7,  bestFor: ['nominal'] },
    { type: 'tree / dendrogram', score: 6,  bestFor: ['nominal'] },
  ],
  ranking: [
    { type: 'sorted bar chart',  score: 10, bestFor: ['nominal', 'ordinal'] },
    { type: 'lollipop chart',    score: 8,  bestFor: ['nominal'] },
    { type: 'bump chart',        score: 7,  bestFor: ['nominal', 'temporal'] },
    { type: 'slope chart',       score: 6,  bestFor: ['nominal', 'temporal'] },
  ],
};

export function getCandidates(goalCategory) {
  return CHART_CANDIDATES[goalCategory] ?? [];
}

export function getTopCandidate(goalCategory) {
  const candidates = getCandidates(goalCategory);
  return candidates.sort((a, b) => b.score - a.score)[0] ?? null;
}
```

### 3.3 Implement Formatters

**Write `src/utils/formatters.js`:**

```js
export function formatNumber(n, opts = {}) {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', opts).format(n);
}

export function formatFileSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 ** 2)   return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3)   return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export function formatRowCount(n) {
  if (n == null) return '—';
  return formatNumber(n);
}

export function formatCardinality(n) {
  if (n == null) return '—';
  if (n > 1000) return `${formatNumber(n)} unique values`;
  return `${n} unique`;
}

export function truncate(str, max = 60) {
  if (!str) return '';
  return str.length <= max ? str : `${str.slice(0, max)}…`;
}

export const TYPE_LABELS = {
  quantitative: 'Numeric',
  ordinal:      'Ordinal',
  nominal:      'Categorical',
  temporal:     'Date/Time',
  geographic:   'Geographic',
  boolean:      'Boolean',
  unknown:      'Unknown',
};

export const TYPE_COLORS = {
  quantitative: 'text-sky-400',
  ordinal:      'text-violet-400',
  nominal:      'text-amber-400',
  temporal:     'text-emerald-400',
  geographic:   'text-rose-400',
  boolean:      'text-teal-400',
  unknown:      'text-slate-400',
};
```

### 3.4 Implement Data Service

**Write `src/services/dataService.js`:**

```js
import Papa from 'papaparse';

const MAX_FILE_SIZE_BYTES   = 20 * 1024 * 1024; // 20 MB hard cap
const WARN_FILE_SIZE_BYTES  =  5 * 1024 * 1024; // 5 MB warning
const MAX_ROWS_FOR_SCHEMA   = 1000;
const SAMPLE_ROW_COUNT      = 5;

export const FILE_SIZE_ERROR = `File exceeds 20 MB. Please sample or summarize your data before uploading.`;
export const FILE_SIZE_WARN  = `File is large (>5 MB). Only the first ${MAX_ROWS_FOR_SCHEMA} rows will be used for analysis.`;

export function validateFile(file) {
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error(FILE_SIZE_ERROR);
  return { warn: file.size > WARN_FILE_SIZE_BYTES ? FILE_SIZE_WARN : null };
}

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header:          true,
      skipEmptyLines:  true,
      dynamicTyping:   false,
      worker:          file.size > WARN_FILE_SIZE_BYTES,
      preview:         MAX_ROWS_FOR_SCHEMA,
      complete: (result) => {
        if (result.errors.length && !result.data.length) {
          reject(new Error(`CSV parse error: ${result.errors[0].message}`));
          return;
        }
        const headers    = result.meta.fields ?? [];
        const rows       = result.data;
        const sampleRows = rows.slice(0, SAMPLE_ROW_COUNT);
        resolve({ headers, rows, sampleRows, rowCount: rows.length });
      },
      error: (err) => reject(new Error(`CSV parse error: ${err.message}`)),
    });
  });
}

export function parseJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target.result);
        // Handle both array and { data: [...] } shapes
        if (!Array.isArray(data)) {
          const keys = Object.keys(data);
          const arrayKey = keys.find((k) => Array.isArray(data[k]));
          if (!arrayKey) throw new Error('JSON does not contain an array of records.');
          data = data[arrayKey];
        }
        if (!data.length) throw new Error('JSON array is empty.');
        const headers    = Object.keys(data[0]);
        const rows       = data.slice(0, MAX_ROWS_FOR_SCHEMA);
        const sampleRows = rows.slice(0, SAMPLE_ROW_COUNT);
        resolve({ headers, rows, sampleRows, rowCount: data.length });
      } catch (err) {
        reject(new Error(`JSON parse error: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

export async function parseFile(file) {
  const { warn } = validateFile(file);
  const ext = file.name.split('.').pop().toLowerCase();
  let result;
  if (ext === 'json') {
    result = await parseJSON(file);
  } else if (['csv', 'tsv', 'txt'].includes(ext)) {
    result = await parseCSV(file);
  } else {
    throw new Error(`Unsupported file type: .${ext}. Upload a CSV or JSON file.`);
  }
  return { ...result, warn };
}
```

### 3.5 Implement useDataParser Hook

**Write `src/hooks/useDataParser.js`:**

```js
import { useState, useCallback } from 'react';
import { parseFile } from '../services/dataService';
import { inferSchema } from '../utils/columnTypeInferrer';

export function useDataParser() {
  const [status, setStatus]     = useState('idle');
  const [warning, setWarning]   = useState(null);
  const [error, setError]       = useState(null);
  const [result, setResult]     = useState(null);

  const parse = useCallback(async (file) => {
    setStatus('parsing');
    setError(null);
    setWarning(null);
    setResult(null);
    try {
      const { headers, rows, sampleRows, rowCount, warn } = await parseFile(file);
      const schema = inferSchema(headers, rows);
      const parsed = { schema, sampleRows, rowCount };
      setResult(parsed);
      if (warn) setWarning(warn);
      setStatus('complete');
      return parsed;
    } catch (err) {
      setError(err.message);
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setWarning(null);
    setResult(null);
  }, []);

  return { status, error, warning, result, parse, reset };
}
```

### 3.6 Implement DataUploader Component

**Write `src/components/input/DataUploader.jsx`:**

```jsx
import { useState, useRef, useCallback } from 'react';
import Button from '../common/Button';
import ErrorBanner from '../common/ErrorBanner';
import { formatFileSize } from '../../utils/formatters';

const ACCEPTED_TYPES = '.csv,.tsv,.json,.txt';
const ACCEPTED_MIME  = ['text/csv', 'application/json', 'text/plain', 'text/tab-separated-values'];

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
```

### 3.7 Implement DataPreview Component

**Write `src/components/input/DataPreview.jsx`:**

```jsx
import Badge from '../common/Badge';
import { TYPE_LABELS, TYPE_COLORS, formatCardinality, truncate } from '../../utils/formatters';

const TYPE_OPTIONS = ['quantitative','ordinal','nominal','temporal','geographic','boolean'];
const BADGE_VARIANTS = {
  quantitative:'info', ordinal:'brand', nominal:'warning',
  temporal:'success', geographic:'error', boolean:'default', unknown:'default',
};

export default function DataPreview({ schema, sampleRows, rowCount, onTypeOverride }) {
  if (!schema || !sampleRows) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Schema Preview</h3>
        <span className="text-xs text-slate-500">{rowCount?.toLocaleString()} rows · {schema.length} columns</span>
      </div>

      {/* Schema table */}
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-left">
              <th className="px-3 py-2 text-slate-400 font-medium">Column</th>
              <th className="px-3 py-2 text-slate-400 font-medium">Type</th>
              <th className="px-3 py-2 text-slate-400 font-medium">Cardinality</th>
              <th className="px-3 py-2 text-slate-400 font-medium">Range</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {schema.map((col) => (
              <tr key={col.name} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-3 py-2 font-mono text-slate-200 max-w-[160px] truncate"
                    title={col.name}>{col.name}</td>
                <td className="px-3 py-2">
                  <select
                    value={col.type}
                    onChange={(e) => onTypeOverride?.(col.name, e.target.value)}
                    aria-label={`Column type for ${col.name}`}
                    className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-slate-400 text-xs">{formatCardinality(col.cardinality)}</td>
                <td className="px-3 py-2 text-slate-400 text-xs font-mono">{col.range ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sample rows */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-200 transition-colors select-none">
          ▸ Show sample rows ({sampleRows.length})
        </summary>
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-700">
          <table className="text-xs w-full">
            <thead>
              <tr className="bg-slate-800">
                {schema.map((col) => (
                  <th key={col.name} className="px-3 py-2 text-slate-400 font-medium text-left whitespace-nowrap">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sampleRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  {schema.map((col) => (
                    <td key={col.name} className="px-3 py-1.5 text-slate-300 font-mono whitespace-nowrap">
                      {truncate(String(row[col.name] ?? '—'), 40)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
```

### 3.8 Implement GoalSelector Component

**Write `src/components/input/GoalSelector.jsx`:**

```jsx
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
```

### 3.9 Implement ParameterPanel Component

**Write `src/components/input/ParameterPanel.jsx`:**

```jsx
import { SUPPORTED_LIBRARIES } from '../../services/promptTemplates';

const AUDIENCE_OPTIONS    = ['General public','Business stakeholders','Executive leadership','Data analysts','Data scientists','Domain experts','Developers'];
const INTERACTIVITY_OPTIONS = ['None — static image/PDF','Tooltips only','Basic interactive (zoom, pan)','Fully interactive (filter, drill-down, cross-filter)'];
const ACCESSIBILITY_OPTIONS = ['Standard (no special requirements)','WCAG AA — color-blind safe palettes','WCAG AA — full (color + keyboard + ARIA)','WCAG AAA'];

export default function ParameterPanel({ parameters, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Audience */}
        <div>
          <label htmlFor="audience" className="block text-sm font-medium text-slate-300 mb-1.5">Audience</label>
          <select
            id="audience"
            value={parameters.audience ?? ''}
            onChange={(e) => onChange({ audience: e.target.value || null })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Not specified</option>
            {AUDIENCE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Library */}
        <div>
          <label htmlFor="library" className="block text-sm font-medium text-slate-300 mb-1.5">Chart Library</label>
          <select
            id="library"
            value={parameters.library ?? ''}
            onChange={(e) => {
              const lib = SUPPORTED_LIBRARIES.find((l) => l.value === e.target.value);
              onChange({ library: e.target.value || null, language: lib?.language ?? parameters.language });
            }}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">No preference</option>
            {SUPPORTED_LIBRARIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Interactivity */}
        <div>
          <label htmlFor="interactivity" className="block text-sm font-medium text-slate-300 mb-1.5">Interactivity</label>
          <select
            id="interactivity"
            value={parameters.interactivity ?? ''}
            onChange={(e) => onChange({ interactivity: e.target.value || null })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Not specified</option>
            {INTERACTIVITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Accessibility */}
        <div>
          <label htmlFor="accessibility" className="block text-sm font-medium text-slate-300 mb-1.5">Accessibility</label>
          <select
            id="accessibility"
            value={parameters.accessibility ?? ''}
            onChange={(e) => onChange({ accessibility: e.target.value || null })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Standard</option>
            {ACCESSIBILITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Extra notes */}
      <div>
        <label htmlFor="extra-notes" className="block text-sm font-medium text-slate-300 mb-1.5">
          Additional context
          <span className="text-slate-500 ml-1 font-normal">(optional)</span>
        </label>
        <textarea
          id="extra-notes"
          value={parameters.extraNotes ?? ''}
          onChange={(e) => onChange({ extraNotes: e.target.value || null })}
          placeholder="e.g. This will be embedded in a dark-mode dashboard. Prefer minimal annotations."
          rows={2}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        />
      </div>
    </div>
  );
}
```

### 3.10 Commit Input Pipeline

```bash
git add .
git commit -m "feat: implement full data input pipeline — parsing, schema inference, DataUploader, DataPreview, GoalSelector, ParameterPanel"
```

-----

## Phase 4 — Prompt Layer & LLM Service

### 4.1 Implement promptTemplates.js

The full implementation of this file is defined in `docs/PROMPT_DESIGN.md` and the `promptTemplates.js` artifact previously created. Copy the complete file contents verbatim into `src/services/promptTemplates.js`. Verify the following exports exist after copying:

- `SYSTEM_PROMPT` (string constant)
- `buildUserPrompt(context)` (function)
- `buildMessages(context, history?)` (function)
- `buildFollowUpMessages(history, assistantReply, userFollowUp)` (function)
- `GOAL_CATEGORIES` (array)
- `SUPPORTED_LIBRARIES` (array)

### 4.2 Implement Response Validator

**Write `src/utils/responseValidator.js`:**

```js
const REQUIRED_KEYS = ['meta', 'primary_recommendation', 'alternative_options', 'pitfalls', 'code_scaffold'];
const REQUIRED_PRIMARY_KEYS = ['chart_type', 'rationale', 'data_mapping', 'design_decisions', 'accessibility', 'interactivity'];

export class LLMResponseError extends Error {
  constructor(message, raw) {
    super(message);
    this.name = 'LLMResponseError';
    this.raw  = raw;
  }
}

export function extractJSON(text) {
  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Try to find a JSON object in the text
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) return objMatch[0];
  return text.trim();
}

export function validateResponse(raw) {
  const extracted = extractJSON(raw);
  let parsed;
  try {
    parsed = JSON.parse(extracted);
  } catch {
    throw new LLMResponseError(
      'Response was not valid JSON. The model may have returned plain text or markdown.',
      raw
    );
  }

  for (const key of REQUIRED_KEYS) {
    if (!(key in parsed)) {
      throw new LLMResponseError(`Response is missing required field: "${key}"`, raw);
    }
  }

  for (const key of REQUIRED_PRIMARY_KEYS) {
    if (!(key in parsed.primary_recommendation)) {
      throw new LLMResponseError(`primary_recommendation is missing field: "${key}"`, raw);
    }
  }

  if (!parsed.primary_recommendation.chart_type?.trim()) {
    throw new LLMResponseError('primary_recommendation.chart_type is empty', raw);
  }

  if (!parsed.primary_recommendation.rationale?.trim()) {
    throw new LLMResponseError('primary_recommendation.rationale is empty', raw);
  }

  if (!Array.isArray(parsed.alternative_options)) {
    throw new LLMResponseError('alternative_options must be an array', raw);
  }

  if (!Array.isArray(parsed.pitfalls)) {
    throw new LLMResponseError('pitfalls must be an array', raw);
  }

  return parsed;
}
```

### 4.3 Implement LLM Service

**Write `src/services/llmService.js`:**

```js
import { buildMessages, buildFollowUpMessages } from './promptTemplates';
import { validateResponse, LLMResponseError } from '../utils/responseValidator';

const TIMEOUT_MS    = parseInt(import.meta.env.VITE_REQUEST_TIMEOUT_MS) || 30000;
const MAX_TOKENS    = parseInt(import.meta.env.VITE_MAX_TOKENS)         || 2048;
const PROXY_URL     = import.meta.env.VITE_API_PROXY_URL;
const PROVIDER      = import.meta.env.VITE_LLM_PROVIDER                || 'anthropic';
const API_KEY       = import.meta.env.VITE_ANTHROPIC_API_KEY           || import.meta.env.VITE_OPENAI_API_KEY;
const DEFAULT_MODEL = import.meta.env.VITE_DEFAULT_MODEL               || 'claude-sonnet-4-6';

const RETRY_DELAYS = [0, 1000, 2000, 4000];

function buildEndpoint() {
  if (PROXY_URL) return `${PROXY_URL}/api/recommend`;
  if (PROVIDER === 'openai') return 'https://api.openai.com/v1/chat/completions';
  return 'https://api.anthropic.com/v1/messages';
}

function buildHeaders() {
  const base = { 'Content-Type': 'application/json' };
  if (PROXY_URL) return base; // Proxy handles auth
  if (PROVIDER === 'openai') return { ...base, 'Authorization': `Bearer ${API_KEY}` };
  return { ...base, 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' };
}

function buildBody(messages, model, stream = false) {
  if (PROVIDER === 'openai') {
    const openAiMessages = [
      { role: 'system', content: messages.system },
      ...messages.messages,
    ];
    return JSON.stringify({ model, messages: openAiMessages, max_tokens: MAX_TOKENS, stream });
  }
  return JSON.stringify({
    model,
    max_tokens: MAX_TOKENS,
    system: messages.system,
    messages: messages.messages,
    stream,
  });
}

async function fetchWithTimeout(url, opts) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`Request timed out after ${TIMEOUT_MS / 1000}s`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function attemptRequest(messages, model, attempt = 0) {
  if (attempt > 0) await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));

  const res = await fetchWithTimeout(buildEndpoint(), {
    method:  'POST',
    headers: buildHeaders(),
    body:    buildBody(messages, model, false),
  });

  if (res.status === 429 && attempt < RETRY_DELAYS.length - 1) {
    return attemptRequest(messages, model, attempt + 1);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();

  // Extract content string
  let content;
  if (PROVIDER === 'openai') {
    content = data.choices?.[0]?.message?.content;
  } else {
    content = data.content?.map((b) => b.text ?? '').join('');
  }

  if (!content) throw new Error('Empty response from LLM API');
  return content;
}

export async function sendRequest(sessionContext, history = [], model = DEFAULT_MODEL) {
  const messages = buildMessages(sessionContext, history);
  const raw      = await attemptRequest(messages, model);
  return { raw, parsed: validateResponse(raw) };
}

export async function sendFollowUp(history, assistantReply, userMessage, model = DEFAULT_MODEL) {
  const updated  = buildFollowUpMessages(history, assistantReply, userMessage);
  const raw      = await attemptRequest({ system: '', messages: updated }, model);
  return { raw, parsed: validateResponse(raw) };
}

// Streaming implementation
export async function streamRequest(sessionContext, history = [], model = DEFAULT_MODEL, onChunk) {
  const messages = buildMessages(sessionContext, history);
  const res      = await fetchWithTimeout(buildEndpoint(), {
    method:  'POST',
    headers: buildHeaders(),
    body:    buildBody(messages, model, true),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let   raw     = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        let text = '';
        if (PROVIDER === 'openai') {
          text = parsed.choices?.[0]?.delta?.content ?? '';
        } else {
          text = parsed.delta?.text ?? '';
        }
        if (text) { raw += text; onChunk(text); }
      } catch { /* malformed SSE chunk — skip */ }
    }
  }

  return { raw, parsed: validateResponse(raw) };
}
```

### 4.4 Implement useLLM Hook

**Write `src/hooks/useLLM.js`:**

```js
import { useCallback } from 'react';
import { useSession } from '../context/SessionContext';
import { sendRequest, streamRequest } from '../services/llmService';
import { useSettings } from '../context/SettingsContext';

export function useLLM() {
  const { state, dispatch, appendHistory } = useSession();
  const { settings } = useSettings();

  const submit = useCallback(async () => {
    const { dataset, goal, parameters, sessionId, conversationHistory } = state;

    dispatch({ type: 'SUBMIT_REQUEST' });

    const context = { sessionId, dataset, goal, parameters };

    try {
      if (settings.streaming) {
        const { raw, parsed } = await streamRequest(
          context,
          conversationHistory,
          settings.model,
          (chunk) => dispatch({ type: 'STREAM_CHUNK', payload: chunk })
        );
        appendHistory({ role: 'user',      content: goal.description });
        appendHistory({ role: 'assistant', content: raw });
        dispatch({ type: 'REQUEST_COMPLETE', payload: parsed });
      } else {
        const { raw, parsed } = await sendRequest(context, conversationHistory, settings.model);
        appendHistory({ role: 'user',      content: goal.description });
        appendHistory({ role: 'assistant', content: raw });
        dispatch({ type: 'REQUEST_COMPLETE', payload: parsed });
      }
    } catch (err) {
      dispatch({ type: 'REQUEST_ERROR', payload: err.message });
    }
  }, [state, dispatch, appendHistory, settings]);

  const isReady = !!(
    state.dataset?.schema?.length &&
    state.goal?.description?.trim().length > 10
  );

  return {
    submit,
    isReady,
    status:         state.status,
    recommendation: state.recommendation,
    rawResponse:    state.rawResponse,
    error:          state.llmError,
  };
}
```

### 4.5 Commit Prompt & LLM Layer

```bash
git add .
git commit -m "feat: implement prompt templates, LLM service with streaming + retry, response validator, useLLM hook"
```

-----

## Phase 5 — Output Rendering Components

### 5.1 Implement MetaBadges

**Write `src/components/output/MetaBadges.jsx`:**

```jsx
import Badge from '../common/Badge';

const CONFIDENCE_VARIANTS = { high: 'success', medium: 'warning', low: 'error' };
const GOAL_ICONS = {
  comparison:'⚖️', trend:'📈', distribution:'📊', correlation:'🔗',
  'part-of-whole':'🥧', geospatial:'🗺️', 'network-flow':'🕸️', ranking:'🏆',
};

export default function MetaBadges({ meta }) {
  if (!meta) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {meta.goal_category && (
        <Badge variant="brand">
          {GOAL_ICONS[meta.goal_category] ?? '📊'} {meta.goal_category}
        </Badge>
      )}
      {meta.confidence && (
        <Badge variant={CONFIDENCE_VARIANTS[meta.confidence] ?? 'default'}>
          Confidence: {meta.confidence}
        </Badge>
      )}
    </div>
  );
}
```

### 5.2 Implement RecommendationCard

**Write `src/components/output/RecommendationCard.jsx`:**

```jsx
import Badge from '../common/Badge';
import MetaBadges from './MetaBadges';

export default function RecommendationCard({ recommendation, meta }) {
  if (!recommendation) return null;
  const { chart_type, rationale, data_mapping } = recommendation;

  const mappings = Object.entries(data_mapping ?? {})
    .filter(([, v]) => v && (typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.length : false));

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 space-y-4">
      <div className="space-y-2">
        <MetaBadges meta={meta} />
        <h2 className="text-xl font-bold text-slate-100">{chart_type}</h2>
        <p className="text-sm text-slate-300 leading-relaxed">{rationale}</p>
      </div>

      {mappings.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Data Mapping</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {mappings.map(([channel, value]) => (
              <div key={channel} className="flex items-start gap-2 bg-slate-800/60 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-500 capitalize min-w-[48px] pt-0.5">{channel.replace('_', ' ')}</span>
                <span className="text-xs text-slate-200 font-mono break-words">
                  {Array.isArray(value) ? value.join(', ') : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 5.3 Implement DesignDecisionsPanel

**Write `src/components/output/DesignDecisionsPanel.jsx`:**

```jsx
export default function DesignDecisionsPanel({ designDecisions, accessibility, interactivity }) {
  if (!designDecisions) return null;
  const { color_palette, scale, annotations, sorting, aspect_ratio, data_density_strategy } = designDecisions;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5 space-y-5">
      <h3 className="font-semibold text-slate-200">Design Decisions</h3>

      {/* Color palette */}
      {color_palette && (
        <Section label="Color Palette">
          <p className="text-sm text-slate-300 font-medium">{color_palette.recommendation}</p>
          <p className="text-xs text-slate-400 mt-1">{color_palette.rationale}</p>
        </Section>
      )}

      {/* Scale */}
      {scale && (
        <Section label="Scales">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {scale.x && <KV label="X-axis" value={scale.x} />}
            {scale.y && <KV label="Y-axis" value={scale.y} />}
            <KV label="Zero baseline" value={scale.zero_baseline ? 'Yes' : 'No'} />
          </div>
        </Section>
      )}

      {/* Misc decisions */}
      {annotations && <Section label="Annotations"><p className="text-sm text-slate-300">{annotations}</p></Section>}
      {sorting      && <Section label="Sort Order"><p className="text-sm text-slate-300">{sorting}</p></Section>}
      {aspect_ratio && <Section label="Aspect Ratio"><p className="text-sm text-slate-300">{aspect_ratio}</p></Section>}
      {data_density_strategy && <Section label="Data Density"><p className="text-sm text-slate-300">{data_density_strategy}</p></Section>}

      {/* Accessibility */}
      {accessibility && (
        <Section label="Accessibility">
          <div className="flex flex-wrap gap-2 text-xs">
            <StatusChip ok={accessibility.color_blind_safe} label="Colorblind safe" />
            <StatusChip ok={accessibility.wcag_level !== 'not_applicable'} label={`WCAG ${accessibility.wcag_level}`} />
          </div>
          {accessibility.redundant_encoding && (
            <p className="text-xs text-slate-400 mt-2">{accessibility.redundant_encoding}</p>
          )}
          {accessibility.aria_recommendations && (
            <p className="text-xs text-slate-400 mt-1">{accessibility.aria_recommendations}</p>
          )}
        </Section>
      )}

      {/* Interactivity */}
      {interactivity?.interactions?.length > 0 && (
        <Section label="Interactivity">
          <div className="flex flex-wrap gap-1.5">
            {interactivity.interactions.map((i) => (
              <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{i}</span>
            ))}
          </div>
          {interactivity.rationale && (
            <p className="text-xs text-slate-400 mt-2">{interactivity.rationale}</p>
          )}
        </Section>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</h4>
      {children}
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="bg-slate-700/50 rounded px-2 py-1.5">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-slate-200">{value}</p>
    </div>
  );
}

function StatusChip({ ok, label }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
      ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
    }`}>
      {ok ? '✓' : '–'} {label}
    </span>
  );
}
```

### 5.4 Implement AlternativeOptions

**Write `src/components/output/AlternativeOptions.jsx`:**

```jsx
export default function AlternativeOptions({ alternatives }) {
  if (!alternatives?.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-200">Alternative Options</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {alternatives.map((alt, i) => (
          <div key={i} className="rounded-lg border border-slate-700 bg-slate-800/30 p-4 space-y-2">
            <p className="font-medium text-slate-200 text-sm">{alt.chart_type}</p>
            <div className="space-y-1 text-xs text-slate-400">
              <p><span className="text-slate-500 font-medium">Use when: </span>{alt.use_when}</p>
              <p><span className="text-slate-500 font-medium">Tradeoff: </span>{alt.tradeoff}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5.5 Implement PitfallWarnings

**Write `src/components/output/PitfallWarnings.jsx`:**

```jsx
export default function PitfallWarnings({ pitfalls }) {
  if (!pitfalls?.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-200">Pitfalls to Avoid</h3>
      <div className="space-y-2">
        {pitfalls.map((p, i) => (
          <div key={i} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
            <p className="text-sm font-medium text-amber-300 flex items-center gap-2">
              <span aria-hidden="true">⚠</span>{p.risk}
            </p>
            <p className="text-xs text-slate-400">{p.description}</p>
            <p className="text-xs text-slate-300">
              <span className="text-emerald-400 font-medium">Fix: </span>{p.mitigation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5.6 Implement CodeSnippet

**Write `src/components/output/CodeSnippet.jsx`:**

```jsx
import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-r';
import 'prismjs/themes/prism-tomorrow.css';
import CopyButton from '../common/CopyButton';
import Badge from '../common/Badge';

export default function CodeSnippet({ codeScaffold }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) Prism.highlightElement(ref.current);
  }, [codeScaffold?.snippet]);

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
```

### 5.7 Implement FollowUpQuestions

**Write `src/components/output/FollowUpQuestions.jsx`:**

```jsx
export default function FollowUpQuestions({ questions }) {
  if (!questions?.length) return null;
  return (
    <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
        <span aria-hidden="true">💬</span> Clarifying Questions
      </h3>
      <ul className="space-y-1.5" role="list">
        {questions.map((q, i) => (
          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
            <span className="text-sky-400 font-bold mt-0.5" aria-hidden="true">{i + 1}.</span>
            {q}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5.8 Implement ExportButton

**Write `src/components/output/ExportButton.jsx`:**

```jsx
import Button from '../common/Button';

function buildMarkdown(recommendation) {
  const { meta, primary_recommendation: pr, alternative_options, pitfalls, code_scaffold } = recommendation;
  return [
    `# VizAdvisor Recommendation`,
    `**Chart type:** ${pr.chart_type}  `,
    `**Goal category:** ${meta.goal_category}  `,
    `**Confidence:** ${meta.confidence}`,
    ``,
    `## Rationale`,
    pr.rationale,
    ``,
    `## Alternative Options`,
    ...alternative_options.map((a) => `- **${a.chart_type}**: ${a.use_when}`),
    ``,
    `## Pitfalls`,
    ...pitfalls.map((p) => `- **${p.risk}**: ${p.mitigation}`),
    ``,
    `## Code Scaffold (${code_scaffold.library} / ${code_scaffold.language})`,
    `\`\`\`${code_scaffold.language}`,
    code_scaffold.snippet,
    `\`\`\``,
  ].join('\n');
}

export default function ExportButton({ recommendation }) {
  if (!recommendation) return null;

  const downloadMarkdown = () => {
    const md   = buildMarkdown(recommendation);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'vizadvisor-recommendation.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const json = JSON.stringify(recommendation, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'vizadvisor-recommendation.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={downloadMarkdown}>⬇ Export Markdown</Button>
      <Button variant="secondary" size="sm" onClick={downloadJSON}>⬇ Export JSON</Button>
    </div>
  );
}
```

### 5.9 Implement RecommendationList (Output Orchestrator)

**Write `src/components/output/RecommendationList.jsx`:**

```jsx
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
        <p className="text-slate-400">Complete the form on the left to receive your visualization recommendation.</p>
      </div>
    );
  }

  if (status === 'loading' || status === 'streaming') {
    return (
      <div className="space-y-4">
        <Spinner size="lg" label="Generating recommendation…" className="py-12" />
        {rawResponse && (
          <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-4">
            <p className="text-xs text-slate-500 mb-2 font-mono">Streaming response…</p>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap break-words max-h-48 overflow-y-auto font-mono">
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
        <h2 className="text-lg font-semibold text-slate-100">Your Recommendation</h2>
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
```

### 5.10 Commit Output Components

```bash
git add .
git commit -m "feat: implement all output rendering components — RecommendationCard, DesignDecisions, Alternatives, Pitfalls, CodeSnippet, Export"
```

-----

## Phase 6 — Integration & Wiring

### 6.1 Implement PromptBuilder (Submission Control)

**Write `src/components/input/PromptBuilder.jsx`:**

```jsx
import Button from '../common/Button';
import Tooltip from '../common/Tooltip';

export default function PromptBuilder({ isReady, status, onSubmit, onReset }) {
  const isLoading = status === 'loading' || status === 'streaming';
  const hasResult = status === 'complete' || status === 'error';

  return (
    <div className="flex items-center justify-between pt-2 border-t border-slate-700">
      <div className="text-xs text-slate-500">
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
          <Button
            variant="primary"
            size="md"
            disabled={!isReady || isLoading}
            loading={isLoading}
            onClick={onSubmit}
          >
            {isLoading ? 'Analyzing…' : hasResult ? 'Re-analyze' : 'Get Recommendation →'}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
```

### 6.2 Implement AdvisorPage (Full Integration)

**Write `src/pages/AdvisorPage.jsx`:**

```jsx
import { useSession } from '../context/SessionContext';
import { useLLM }     from '../hooks/useLLM';
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
        <h1 className="text-3xl font-bold text-slate-100">Data Visualization Advisor</h1>
        <p className="text-slate-400 mt-1">Upload your dataset, describe your goal, and receive expert visualization recommendations powered by AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ── Input Panel ── */}
        <div className="space-y-6 sticky top-20">
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

        {/* ── Output Panel ── */}
        <div className="min-h-[400px]">
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
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}
```

### 6.3 Implement HomePage

**Write `src/pages/HomePage.jsx`:**

```jsx
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const FEATURES = [
  { icon: '📂', title: 'Upload Any Dataset', desc: 'Drop in CSV or JSON files. Automatic schema inference detects column types, ranges, and cardinality.' },
  { icon: '🎯', title: 'Describe Your Goal', desc: 'Tell the advisor what you want to communicate. Choose a goal category and primary question.' },
  { icon: '🧠', title: 'AI-Powered Analysis', desc: 'Claude applies Tufte, Munzner, and Cairo principles to your specific data and context.' },
  { icon: '⚙️', title: 'Code Scaffold', desc: 'Get copy-pasteable code in your preferred library — Recharts, D3, Plotly, ggplot2, and more.' },
  { icon: '♿', title: 'Accessibility Built-In', desc: 'Colorblind-safe palettes, WCAG compliance, ARIA recommendations included automatically.' },
  { icon: '⚠️', title: 'Pitfall Warnings', desc: 'Proactive warnings about overplotting, misleading axes, rainbow scales, and 3D chart traps.' },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">
      {/* Hero */}
      <div className="text-center space-y-6">
        <div className="text-6xl" aria-hidden="true">📊</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 leading-tight">
          Expert visualization advice,<br />
          <span className="text-indigo-400">powered by AI</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Upload your data, describe your communication goal, and receive recommendations grounded in Tufte, Munzner, and Cairo — with code scaffolds ready to run.
        </p>
        <Link to="/advisor">
          <Button variant="primary" size="lg">Get Started →</Button>
        </Link>
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-2 hover:border-indigo-500/40 transition-colors">
            <div className="text-2xl" aria-hidden="true">{icon}</div>
            <h3 className="font-semibold text-slate-200">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6.4 Implement AboutPage

**Write `src/pages/AboutPage.jsx`:**

```jsx
export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-slate-100">About VizAdvisor</h1>

      <Section title="What it does">
        <p>VizAdvisor is a front-end application that connects your dataset and communication goal to a large language model trained on best practices from the data visualization literature. It analyzes your schema, task, audience, and constraints to recommend the optimal chart type, encoding decisions, color palette, interactivity patterns, and accessibility approach — then generates working code in your preferred library.</p>
      </Section>

      <Section title="Theoretical foundation">
        <p>Recommendations are grounded in a curated body of visualization research:</p>
        <ul className="mt-2 space-y-1 text-slate-300">
          {['Edward Tufte — data-ink ratio, chartjunk, small multiples',
            'Tamara Munzner — What-Why-How framework, channel effectiveness',
            'Alberto Cairo — truthful, functional, and beautiful visualization',
            'Stephen Few — perceptual efficiency and dashboard design',
            'Colin Ware — visual perception and pre-attentive attributes',
            'Claus Wilke — principles of figure design',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <span className="text-indigo-400 mt-0.5" aria-hidden="true">▸</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Privacy">
        <p>Your data never leaves your browser. Only the column schema, a small sample of rows (5 rows maximum), and row count are sent to the LLM API. Raw data files are never transmitted or stored.</p>
      </Section>

      <Section title="Technology">
        <p>Built with React, Vite, and Tailwind CSS. Powered by Anthropic's Claude API. Chart library recommendations cover Recharts, D3.js, Plotly, Chart.js, Vega-Lite, Observable Plot, Matplotlib, Altair, and ggplot2.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-slate-200">{title}</h2>
      <div className="text-slate-400 leading-relaxed">{children}</div>
    </div>
  );
}
```

### 6.5 Implement useSessionHistory Hook

**Write `src/hooks/useSessionHistory.js`:**

```js
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY    = 'vizadvisor:sessions';
const MAX_SESSIONS   = 20;

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch { /* ignore */ }
}

export function useSessionHistory() {
  const [sessions, setSessions] = useState(loadSessions);

  const saveSession = useCallback((sessionData) => {
    setSessions((prev) => {
      const updated = [
        { ...sessionData, savedAt: new Date().toISOString() },
        ...prev.filter((s) => s.sessionId !== sessionData.sessionId),
      ].slice(0, MAX_SESSIONS);
      saveSessions(updated);
      return updated;
    });
  }, []);

  const deleteSession = useCallback((sessionId) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.sessionId !== sessionId);
      saveSessions(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSessions([]);
    saveSessions([]);
  }, []);

  return { sessions, saveSession, deleteSession, clearAll };
}
```

### 6.6 End-to-End Smoke Test

At this point, run the dev server and manually verify the full flow:

```bash
npm run dev
```

Checklist:

- [ ] App loads at `http://localhost:5173`
- [ ] Navigation works between Home, Advisor, About
- [ ] File upload accepts a CSV and renders schema table
- [ ] Type override dropdown changes a column type
- [ ] Goal selector populates category and description
- [ ] Submit button is disabled until dataset + goal are both present
- [ ] Submit button triggers the LLM API call
- [ ] Streaming tokens appear in the output panel
- [ ] Final recommendation renders all sections: card, design decisions, alternatives, pitfalls, code
- [ ] Export downloads a valid markdown file
- [ ] Error state renders when API key is missing or invalid

### 6.7 Commit Integration

```bash
git add .
git commit -m "feat: integrate all components into AdvisorPage — full end-to-end data flow working"
```

-----

## Phase 7 — Testing

### 7.1 Unit Tests — columnTypeInferrer

**Write `tests/unit/columnTypeInferrer.test.js`:**

```js
import { describe, it, expect } from 'vitest';
import { inferColumnType, inferSchema } from '../../src/utils/columnTypeInferrer';

describe('inferColumnType', () => {
  it('detects quantitative columns', () => {
    const vals = ['1.5','2.3','100','0.01','999.9'];
    expect(inferColumnType(vals).type).toBe('quantitative');
  });

  it('detects temporal columns', () => {
    const vals = ['2024-01-01','2024-02-15','2023-12-31'];
    expect(inferColumnType(vals).type).toBe('temporal');
  });

  it('detects boolean columns', () => {
    const vals = ['true','false','true','true','false'];
    expect(inferColumnType(vals).type).toBe('boolean');
  });

  it('detects nominal columns by default', () => {
    const vals = ['apple','banana','cherry','date','elderberry'];
    expect(inferColumnType(vals).type).toBe('nominal');
  });

  it('detects ordinal columns with ordered tokens', () => {
    const vals = ['Low','Medium','High','Low','High','Medium'];
    expect(inferColumnType(vals).type).toBe('ordinal');
  });

  it('handles empty values as nullable', () => {
    const vals = ['1','2','','4','5'];
    const result = inferColumnType(vals);
    expect(result.nullable).toBe(true);
  });

  it('returns correct range for quantitative', () => {
    const vals = ['10','20','30','5','50'];
    const result = inferColumnType(vals);
    expect(result.range).toContain('5');
    expect(result.range).toContain('50');
  });
});

describe('inferSchema', () => {
  it('marks geo columns by name', () => {
    const headers = ['country', 'sales'];
    const rows    = [{ country: 'USA', sales: '1000' }, { country: 'UK', sales: '500' }];
    const schema  = inferSchema(headers, rows);
    expect(schema.find((c) => c.name === 'country').type).toBe('geographic');
  });

  it('returns one entry per column', () => {
    const headers = ['a', 'b', 'c'];
    const rows    = [{ a: '1', b: 'x', c: '2024-01-01' }];
    expect(inferSchema(headers, rows)).toHaveLength(3);
  });
});
```

### 7.2 Unit Tests — chartTypeMapper

**Write `tests/unit/chartTypeMapper.test.js`:**

```js
import { describe, it, expect } from 'vitest';
import { getCandidates, getTopCandidate, CHART_CANDIDATES } from '../../src/utils/chartTypeMapper';

describe('getCandidates', () => {
  it('returns candidates for known goal categories', () => {
    expect(getCandidates('comparison').length).toBeGreaterThan(0);
    expect(getCandidates('trend').length).toBeGreaterThan(0);
  });

  it('returns empty array for unknown categories', () => {
    expect(getCandidates('unknown-goal')).toEqual([]);
  });

  it('covers all 8 goal categories', () => {
    const expected = ['comparison','trend','distribution','correlation','part-of-whole','geospatial','network-flow','ranking'];
    expected.forEach((cat) => expect(getCandidates(cat).length).toBeGreaterThan(0));
  });
});

describe('getTopCandidate', () => {
  it('returns the highest-scored candidate', () => {
    const top = getTopCandidate('comparison');
    expect(top).not.toBeNull();
    expect(top.score).toBe(10);
    expect(top.type).toBe('bar chart');
  });

  it('returns null for unknown categories', () => {
    expect(getTopCandidate('??')).toBeNull();
  });
});
```

### 7.3 Unit Tests — responseValidator

**Write `tests/unit/responseValidator.test.js`:**

```js
import { describe, it, expect } from 'vitest';
import { validateResponse, extractJSON, LLMResponseError } from '../../src/utils/responseValidator';

const VALID_RESPONSE = JSON.stringify({
  meta: { advisor_version:'1.0', session_id:null, goal_category:'comparison', confidence:'high', confidence_rationale:'Clear data.' },
  primary_recommendation: {
    chart_type: 'bar chart',
    rationale: 'Position on a common scale is the most accurate encoding for categorical comparison.',
    data_mapping: { x_axis: 'category', y_axis: 'sales', color: null, size: null, facet: null, tooltip: [], additional_channels: null },
    design_decisions: { color_palette: { type:'qualitative', recommendation:'Okabe-Ito', rationale:'Colorblind safe.' }, scale: { x:'ordinal', y:'linear', zero_baseline: true }, annotations: 'None', sorting: 'by-value-desc', aspect_ratio: '4:3', data_density_strategy: 'Show all' },
    accessibility: { color_blind_safe: true, redundant_encoding: 'None needed', aria_recommendations: null, wcag_level: 'AA' },
    interactivity: { recommended: false, interactions: [], rationale: 'Static report context.' },
  },
  alternative_options: [{ chart_type: 'dot plot', use_when: 'Many categories', tradeoff: 'Less familiar', key_difference: 'Points instead of bars' }],
  pitfalls: [{ risk: 'Truncated y-axis', description: 'Do not start y above zero.', mitigation: 'Set y domain minimum to 0.' }],
  code_scaffold: { library: 'recharts', language: 'javascript', notes: 'Use ResponsiveContainer.', snippet: 'const Chart = () => <BarChart data={data}/>;\nexport default Chart;' },
  follow_up_questions: [],
});

describe('extractJSON', () => {
  it('strips markdown fences', () => {
    const fenced = '```json\n{"key":"value"}\n```';
    expect(extractJSON(fenced)).toBe('{"key":"value"}');
  });

  it('returns raw text if no fence', () => {
    expect(extractJSON('{"a":1}')).toBe('{"a":1}');
  });
});

describe('validateResponse', () => {
  it('parses and returns valid responses', () => {
    const result = validateResponse(VALID_RESPONSE);
    expect(result.primary_recommendation.chart_type).toBe('bar chart');
  });

  it('throws LLMResponseError for invalid JSON', () => {
    expect(() => validateResponse('not json at all')).toThrow(LLMResponseError);
  });

  it('throws for missing required top-level keys', () => {
    const bad = JSON.stringify({ meta: {}, primary_recommendation: { chart_type:'bar', rationale:'x', data_mapping:{}, design_decisions:{}, accessibility:{}, interactivity:{} } });
    expect(() => validateResponse(bad)).toThrow(LLMResponseError);
  });

  it('throws for empty chart_type', () => {
    const parsed = JSON.parse(VALID_RESPONSE);
    parsed.primary_recommendation.chart_type = '';
    expect(() => validateResponse(JSON.stringify(parsed))).toThrow(LLMResponseError);
  });
});
```

### 7.4 Unit Tests — promptTemplates

**Write `tests/unit/promptTemplates.test.js`:**

```js
import { describe, it, expect } from 'vitest';
import { buildUserPrompt, buildMessages, buildFollowUpMessages, SYSTEM_PROMPT } from '../../src/services/promptTemplates';

const MOCK_CONTEXT = {
  sessionId: 'test-session-123',
  dataset: {
    rowCount: 500,
    schema: [
      { name: 'order_date', type: 'temporal',     cardinality: 365, nullable: false, range: '2023-01-01 → 2023-12-31' },
      { name: 'revenue',    type: 'quantitative', cardinality: 480, nullable: false, range: '100 – 50,000' },
      { name: 'region',     type: 'nominal',      cardinality: 4,   nullable: false, range: null },
    ],
    sampleRows: [
      { order_date: '2023-01-05', revenue: '1200', region: 'North' },
    ],
  },
  goal: {
    description: 'Show how monthly revenue has changed over the year by region',
    category: 'trend',
    primaryQuestion: 'Which region is growing fastest?',
  },
  parameters: {
    audience: 'Business stakeholders',
    library: 'recharts',
    language: 'javascript',
    interactivity: 'Tooltips only',
    accessibility: 'WCAG AA',
    extraNotes: null,
  },
};

describe('SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof SYSTEM_PROMPT).toBe('string');
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(500);
  });

  it('contains key constraint markers', () => {
    expect(SYSTEM_PROMPT).toContain('Never recommend pie charts for more than 5 categories');
    expect(SYSTEM_PROMPT).toContain('Never use rainbow/jet color scales');
    expect(SYSTEM_PROMPT).toContain('Never recommend 3D charts');
  });
});

describe('buildUserPrompt', () => {
  it('includes session ID', () => {
    expect(buildUserPrompt(MOCK_CONTEXT)).toContain('test-session-123');
  });

  it('includes all column names', () => {
    const prompt = buildUserPrompt(MOCK_CONTEXT);
    expect(prompt).toContain('order_date');
    expect(prompt).toContain('revenue');
    expect(prompt).toContain('region');
  });

  it('includes goal description', () => {
    const prompt = buildUserPrompt(MOCK_CONTEXT);
    expect(prompt).toContain(MOCK_CONTEXT.goal.description);
  });

  it('includes row count', () => {
    expect(buildUserPrompt(MOCK_CONTEXT)).toContain('500');
  });

  it('handles null parameters gracefully', () => {
    const ctx = { ...MOCK_CONTEXT, parameters: { ...MOCK_CONTEXT.parameters, extraNotes: null } };
    expect(() => buildUserPrompt(ctx)).not.toThrow();
  });
});

describe('buildMessages', () => {
  it('returns system and messages keys', () => {
    const result = buildMessages(MOCK_CONTEXT);
    expect(result).toHaveProperty('system');
    expect(result).toHaveProperty('messages');
  });

  it('system equals SYSTEM_PROMPT', () => {
    expect(buildMessages(MOCK_CONTEXT).system).toBe(SYSTEM_PROMPT);
  });

  it('appends history when provided', () => {
    const history = [{ role: 'user', content: 'prior turn' }];
    const { messages } = buildMessages(MOCK_CONTEXT, history);
    expect(messages[0].content).toBe('prior turn');
    expect(messages).toHaveLength(2);
  });
});

describe('buildFollowUpMessages', () => {
  it('appends assistant reply and user follow-up', () => {
    const history    = [{ role: 'user', content: 'first' }];
    const updated    = buildFollowUpMessages(history, '{"mock":"reply"}', 'make it accessible');
    expect(updated).toHaveLength(3);
    expect(updated[1].role).toBe('assistant');
    expect(updated[2].role).toBe('user');
    expect(updated[2].content).toBe('make it accessible');
  });
});
```

### 7.5 Integration Test — AdvisorFlow

**Write `tests/integration/AdvisorFlow.test.jsx`:**

```jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../src/context/SessionContext';
import { SettingsProvider } from '../../src/context/SettingsContext';
import AdvisorPage from '../../src/pages/AdvisorPage';

// Mock the LLM service
vi.mock('../../src/services/llmService', () => ({
  sendRequest: vi.fn(),
  streamRequest: vi.fn(),
}));

import { sendRequest } from '../../src/services/llmService';

const MOCK_RECOMMENDATION = {
  meta: { advisor_version:'1.0', session_id:null, goal_category:'comparison', confidence:'high', confidence_rationale:'Good data.' },
  primary_recommendation: {
    chart_type: 'bar chart',
    rationale: 'Bar charts are optimal for categorical comparison using position on a common scale.',
    data_mapping: { x_axis:'category', y_axis:'value', color:null, size:null, facet:null, tooltip:['category','value'], additional_channels:null },
    design_decisions: { color_palette:{ type:'qualitative', recommendation:'Okabe-Ito', rationale:'Colorblind safe.'}, scale:{ x:'ordinal', y:'linear', zero_baseline:true }, annotations:'None', sorting:'by-value-desc', aspect_ratio:'4:3', data_density_strategy:'Show all' },
    accessibility: { color_blind_safe:true, redundant_encoding:'None', aria_recommendations:null, wcag_level:'AA' },
    interactivity: { recommended:false, interactions:[], rationale:'Static context.' },
  },
  alternative_options: [],
  pitfalls: [],
  code_scaffold: { library:'recharts', language:'javascript', notes:'', snippet:'const Chart = () => null;' },
  follow_up_questions: [],
};

function renderAdvisor() {
  return render(
    <SettingsProvider>
      <SessionProvider>
        <MemoryRouter>
          <AdvisorPage />
        </MemoryRouter>
      </SessionProvider>
    </SettingsProvider>
  );
}

describe('AdvisorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendRequest.mockResolvedValue({ raw: JSON.stringify(MOCK_RECOMMENDATION), parsed: MOCK_RECOMMENDATION });
  });

  it('renders the page heading', () => {
    renderAdvisor();
    expect(screen.getByText(/data visualization advisor/i)).toBeInTheDocument();
  });

  it('submit button is disabled when no data or goal', () => {
    renderAdvisor();
    expect(screen.getByRole('button', { name: /get recommendation/i })).toBeDisabled();
  });

  it('shows idle state in output panel initially', () => {
    renderAdvisor();
    expect(screen.getByText(/complete the form/i)).toBeInTheDocument();
  });
});
```

### 7.6 Golden-Path Prompt Test Fixtures

**Write `tests/prompts/comparison-goal.json`:**

```json
{
  "description": "Sales comparison across 5 product categories",
  "input": {
    "sessionId": "test-comparison-001",
    "dataset": {
      "rowCount": 250,
      "schema": [
        { "name": "category", "type": "nominal",      "cardinality": 5,   "nullable": false, "range": null },
        { "name": "total_sales", "type": "quantitative", "cardinality": 250,  "nullable": false, "range": "1,200 – 98,000" },
        { "name": "quarter", "type": "ordinal",      "cardinality": 4,   "nullable": false, "range": null }
      ],
      "sampleRows": [
        { "category": "Electronics", "total_sales": "45200", "quarter": "Q1" },
        { "category": "Apparel",     "total_sales": "12800", "quarter": "Q1" },
        { "category": "Home",        "total_sales": "33100", "quarter": "Q1" }
      ]
    },
    "goal": {
      "description": "Compare total sales performance across product categories for Q1",
      "category": "comparison",
      "primaryQuestion": "Which category generated the most revenue?"
    },
    "parameters": {
      "audience": "Business stakeholders",
      "library": "recharts",
      "language": "javascript",
      "interactivity": "Tooltips only",
      "accessibility": "WCAG AA",
      "extraNotes": null
    }
  },
  "expected": {
    "goal_category": "comparison",
    "confidence_not": "low",
    "primary_chart_type_contains": "bar",
    "must_reference_column": "total_sales",
    "code_library": "recharts",
    "color_blind_safe": true
  },
  "must_not_contain": ["pie chart", "3D", "rainbow", "jet"]
}
```

### 7.7 Run Full Test Suite

```bash
npm run test
```

All tests must pass before proceeding. Fix any failures before Phase 8.

```bash
git add .
git commit -m "test: add full unit test suite — columnTypeInferrer, chartTypeMapper, responseValidator, promptTemplates, AdvisorFlow integration"
```

-----

## Phase 8 — Accessibility & Polish

### 8.1 Keyboard Navigation Audit

Manually audit every interactive element in the application:

- [ ] All buttons, inputs, selects, and textareas are reachable via Tab key
- [ ] Tab order follows visual reading order (left-to-right, top-to-bottom)
- [ ] Focus rings are visible on all focusable elements (defined in `global.css` via `:focus-visible`)
- [ ] DataUploader responds to `Enter` and `Space` keys (implemented in Phase 3.6)
- [ ] Modal closes on `Escape` key (implemented in Phase 2.2)
- [ ] Dropdown type override in DataPreview is keyboard-operable
- [ ] File input is accessible via keyboard (via `<input type="file">` inside a label or button)

### 8.2 Screen Reader Audit

Verify the following using a screen reader (VoiceOver on macOS, NVDA on Windows):

- [ ] Page heading hierarchy: `<h1>` on each page, `<h2>` for major sections, `<h3>` for subsections
- [ ] All form inputs have associated `<label>` elements (either via `htmlFor` or wrapping)
- [ ] Required fields are marked with `aria-label` or `aria-required`
- [ ] Loading state announces via `role="status"` on Spinner
- [ ] Error state announces via `role="alert"` on ErrorBanner
- [ ] Charts/output sections: add `aria-live="polite"` to the output panel so screen readers announce when recommendations appear

**Add `aria-live` to output panel in `AdvisorPage.jsx`:**

```jsx
{/* ── Output Panel ── */}
<div className="min-h-[400px]" aria-live="polite" aria-label="Recommendation output">
  <RecommendationList ... />
</div>
```

### 8.3 Color Contrast Audit

Verify all text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text):

- Primary text (`slate-100` on `slate-950`): ✅ >15:1
- Muted text (`slate-400` on `slate-900`): verify with contrast checker tool
- Badge text — verify each variant
- Error banner text (`red-300` on `red-500/10`): verify

Fix any failures by adjusting color values in `theme.js` and Tailwind classes.

### 8.4 Responsive Layout

Test the application at the following breakpoints and fix layout issues:

- [ ] **320px** (small mobile): single column, all content visible, no horizontal scroll
- [ ] **640px** (large mobile): same as above
- [ ] **768px** (tablet): input panel and output panel may still stack
- [ ] **1024px** (laptop): two-column layout activates (`lg:grid-cols-2`)
- [ ] **1280px+** (desktop): comfortable padding, max-width container respected

**Mobile-specific fixes to implement:**

In `AdvisorPage.jsx`, remove `sticky top-20` from the input panel on mobile (it causes scroll issues):

```jsx
<div className={`space-y-6 lg:sticky lg:top-20`}>
```

### 8.5 Error State Polish

Add meaningful error messages for all known failure modes:

```js
// In llmService.js, enhance error messages
const ERROR_MESSAGES = {
  401: 'Invalid API key. Check your .env file and verify VITE_ANTHROPIC_API_KEY is set correctly.',
  403: 'Access denied. Your API key may not have permission for this model.',
  429: 'Rate limit reached. Please wait a moment and try again.',
  500: 'The AI service encountered an error. Please try again.',
  503: 'The AI service is temporarily unavailable. Please try again in a few moments.',
};
```

### 8.6 Loading Skeleton

Add a loading skeleton to the output panel so the layout does not jump when content loads:

**Add to `RecommendationList.jsx` loading branch:**

```jsx
if (status === 'loading') {
  return (
    <div className="space-y-4 animate-pulse" aria-label="Loading recommendation" role="status">
      <div className="h-6 w-48 bg-slate-700 rounded" />
      <div className="h-32 bg-slate-800 rounded-xl border border-slate-700" />
      <div className="h-24 bg-slate-800 rounded-xl border border-slate-700" />
      <div className="h-20 bg-slate-800 rounded-xl border border-slate-700" />
      <span className="sr-only">Generating your visualization recommendation…</span>
    </div>
  );
}
```

### 8.7 Commit Accessibility & Polish

```bash
git add .
git commit -m "feat: accessibility audit fixes, responsive layout, loading skeleton, enhanced error messages"
```

-----

## Phase 9 — Performance Optimization

### 9.1 Bundle Analysis

```bash
npm run build
npx vite-bundle-visualizer
```

Identify large chunks. Target: total gzipped bundle < 300 KB.

### 9.2 Lazy Load Heavy Dependencies

In `vite.config.js`, configure manual chunks:

```js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
        'prism':         ['prismjs'],
        'papaparse':     ['papaparse'],
      },
    },
  },
},
```

### 9.3 Lazy Load Pages

In `App.jsx`, use `React.lazy` for route-level code splitting:

```jsx
import { lazy, Suspense } from 'react';
import Spinner from './components/common/Spinner';

const HomePage    = lazy(() => import('./pages/HomePage'));
const AdvisorPage = lazy(() => import('./pages/AdvisorPage'));
const AboutPage   = lazy(() => import('./pages/AboutPage'));

// Wrap <Routes> in:
<Suspense fallback={<div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>}>
  <Routes>...</Routes>
</Suspense>
```

### 9.4 Memoize Expensive Computations

Wrap `inferSchema` calls in `useMemo` inside `useDataParser.js` to prevent re-computation on re-renders:

```js
import { useMemo } from 'react';
// Memoize the schema after parse — schema should not change unless new file is uploaded
```

### 9.5 Prism.js Language Loading

Load only the Prism language pack needed for the current scaffold. In `CodeSnippet.jsx`:

```jsx
useEffect(() => {
  async function loadLang() {
    const lang = codeScaffold?.language;
    if (lang === 'python') await import('prismjs/components/prism-python');
    if (lang === 'r')      await import('prismjs/components/prism-r');
    // javascript is loaded by default
    Prism.highlightElement(ref.current);
  }
  if (ref.current) loadLang();
}, [codeScaffold?.snippet, codeScaffold?.language]);
```

### 9.6 Commit Performance

```bash
npm run build   # verify build succeeds
npm run test    # verify tests still pass
git add .
git commit -m "perf: lazy load routes, manual chunk splitting, dynamic Prism language imports"
```

-----

## Phase 10 — Production Readiness

### 10.1 Proxy Server (Required for Production)

Create `server/` directory and implement a minimal Express proxy:

```bash
mkdir server
npm install -D express cors dotenv
touch server/index.js
```

**Write `server/index.js`:**

```js
import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';

dotenv.config();

const app      = express();
const PORT     = process.env.PORT || 3001;
const API_KEY  = process.env.ANTHROPIC_API_KEY;
const PROVIDER = process.env.LLM_PROVIDER || 'anthropic';

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.post('/api/recommend', async (req, res) => {
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured on server' });

  const endpoint = PROVIDER === 'openai'
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://api.anthropic.com/v1/messages';

  const headers  = PROVIDER === 'openai'
    ? { 'Content-Type':'application/json', 'Authorization':`Bearer ${API_KEY}` }
    : { 'Content-Type':'application/json', 'x-api-key':API_KEY, 'anthropic-version':'2023-06-01' };

  try {
    const upstream = await fetch(endpoint, {
      method:  'POST',
      headers,
      body:    JSON.stringify(req.body),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: `Upstream error: ${err.message}` });
  }
});

app.listen(PORT, () => console.log(`VizAdvisor proxy server running on port ${PORT}`));
```

**Add server script to `package.json`:**

```json
"server": "node server/index.js",
"dev:full": "concurrently \"npm run dev\" \"npm run server\""
```

```bash
npm install -D concurrently
```

### 10.2 Production Environment File

Create `server/.env.example`:

```bash
# Server-side only — never exposed to client
ANTHROPIC_API_KEY=your_key_here
LLM_PROVIDER=anthropic
PORT=3001
ALLOWED_ORIGIN=https://your-domain.com
```

### 10.3 Content Security Policy

Add CSP meta tag to `index.html`:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
           script-src 'self' 'unsafe-inline';
           style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
           font-src 'self' https://fonts.gstatic.com;
           connect-src 'self' https://api.anthropic.com https://api.openai.com;
           img-src 'self' data:;
           frame-ancestors 'none';">
```

> **Note:** If using a proxy server in production, replace `connect-src` values with your proxy domain only.

### 10.4 Error Monitoring (Optional but Recommended)

Add Sentry for production error tracking:

```bash
npm install @sentry/react
```

In `src/main.jsx`:

```jsx
import * as Sentry from '@sentry/react';

if (import.meta.env.VITE_APP_ENV === 'production' && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, tracesSampleRate: 0.2 });
}
```

Add to `.env.example`:

```bash
VITE_SENTRY_DSN=
```

### 10.5 Pre-Deployment Checklist

Run through this checklist before every production deployment:

```
Build & Quality
  [ ] npm run lint    — zero errors, zero warnings
  [ ] npm run test    — all tests passing
  [ ] npm run build   — build succeeds, no TypeScript/rollup errors
  [ ] Bundle size     — gzipped total < 300 KB

Security
  [ ] .env not committed to git (verify with: git ls-files .env)
  [ ] VITE_API_KEY not present in built output (grep -r "sk-" dist/)
  [ ] Proxy server configured for production (VITE_API_PROXY_URL set)
  [ ] CSP header in place
  [ ] CORS restricted to production domain

Functionality
  [ ] Full flow tested: upload → schema → goal → submit → recommendation
  [ ] Streaming works end-to-end
  [ ] Error states display correctly (test with invalid API key)
  [ ] Export downloads valid markdown and JSON
  [ ] Keyboard navigation works throughout
  [ ] Screen reader announces status changes

Performance
  [ ] Lighthouse score ≥ 90 on Performance
  [ ] Lighthouse score ≥ 90 on Accessibility
  [ ] No console errors or warnings in production build
  [ ] First Contentful Paint < 1.5s on fast 3G
```

### 10.6 Deployment

**Vercel (recommended):**

```bash
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard:

- `VITE_LLM_PROVIDER`
- `VITE_API_PROXY_URL` (point to your proxy server URL)
- `VITE_DEFAULT_MODEL`
- `VITE_APP_ENV=production`

**Netlify:**

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Docker:**

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 10.7 Final Commit

```bash
git add .
git commit -m "feat: production readiness — proxy server, CSP, error monitoring, deployment config"
git tag v1.0.0
git push origin main --tags
```

-----

## Appendix A — Full File Manifest

Every file that must exist in the completed repository:

```
vizadvisor/
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── .prettierignore
├── .github/workflows/ci.yml
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── IMPLEMENTATION_PLAN.md          ← this file
├── REPO_MAP.md
├── README.md
├── public/
│   └── favicon.svg
├── server/
│   ├── .env.example
│   └── index.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── CopyButton.jsx
│   │   │   ├── ErrorBanner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── Tooltip.jsx
│   │   ├── input/
│   │   │   ├── DataPreview.jsx
│   │   │   ├── DataUploader.jsx
│   │   │   ├── GoalSelector.jsx
│   │   │   ├── ParameterPanel.jsx
│   │   │   └── PromptBuilder.jsx
│   │   ├── layout/
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   └── output/
│   │       ├── AlternativeOptions.jsx
│   │       ├── CodeSnippet.jsx
│   │       ├── DesignDecisionsPanel.jsx
│   │       ├── ExportButton.jsx
│   │       ├── FollowUpQuestions.jsx
│   │       ├── MetaBadges.jsx
│   │       ├── PitfallWarnings.jsx
│   │       └── RecommendationList.jsx
│   ├── context/
│   │   ├── SessionContext.jsx
│   │   └── SettingsContext.jsx
│   ├── hooks/
│   │   ├── useDataParser.js
│   │   ├── useLLM.js
│   │   └── useSessionHistory.js
│   ├── pages/
│   │   ├── AboutPage.jsx
│   │   ├── AdvisorPage.jsx
│   │   └── HomePage.jsx
│   ├── services/
│   │   ├── dataService.js
│   │   ├── llmService.js
│   │   └── promptTemplates.js
│   ├── styles/
│   │   ├── global.css
│   │   └── theme.js
│   └── utils/
│       ├── chartTypeMapper.js
│       ├── columnTypeInferrer.js
│       ├── formatters.js
│       └── responseValidator.js
├── tests/
│   ├── setup.js
│   ├── integration/
│   │   └── AdvisorFlow.test.jsx
│   ├── prompts/
│   │   ├── comparison-goal.json
│   │   ├── distribution-goal.json
│   │   └── trend-goal.json
│   └── unit/
│       ├── chartTypeMapper.test.js
│       ├── columnTypeInferrer.test.js
│       ├── promptTemplates.test.js
│       └── responseValidator.test.js
└── docs/
    ├── ARCHITECTURE.md
    ├── CONTRIBUTING.md
    ├── DATA_VIZ_REFERENCE.md
    └── PROMPT_DESIGN.md
```

-----

## Appendix B — Dependency Reference

```json
{
  "dependencies": {
    "react":              "^18.2.0",
    "react-dom":          "^18.2.0",
    "react-router-dom":   "^6.x",
    "papaparse":          "^5.x",
    "prismjs":            "^1.x",
    "@anthropic-ai/sdk":  "^0.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react":           "^4.x",
    "vite":                           "^5.x",
    "tailwindcss":                    "^3.x",
    "autoprefixer":                   "^10.x",
    "postcss":                        "^8.x",
    "eslint":                         "^8.x",
    "eslint-plugin-react":            "^7.x",
    "eslint-plugin-react-hooks":      "^4.x",
    "eslint-plugin-jsx-a11y":         "^6.x",
    "prettier":                       "^3.x",
    "vitest":                         "^1.x",
    "@vitest/ui":                     "^1.x",
    "@testing-library/react":         "^14.x",
    "@testing-library/jest-dom":      "^6.x",
    "@testing-library/user-event":    "^14.x",
    "jsdom":                          "^24.x",
    "express":                        "^4.x",
    "cors":                           "^2.x",
    "dotenv":                         "^16.x",
    "concurrently":                   "^8.x"
  }
}
```

-----

## Appendix C — Key Decisions Summary

|Decision             |Choice                                      |Do Not Change Without Reviewing              |
|---------------------|--------------------------------------------|---------------------------------------------|
|Output format        |Strict JSON schema                          |`PROMPT_DESIGN.md` § Output Contract         |
|State management     |Context + useReducer                        |`ARCHITECTURE.md` § 7                        |
|Streaming            |On by default                               |`useLLM.js` + `SettingsContext`              |
|Data sent to LLM     |Schema + 5 sample rows only                 |Privacy requirement — never send full dataset|
|Column type inference|Heuristic cascade in `columnTypeInferrer.js`|User can override via UI                     |
|Hard constraints     |10 absolute rules in system prompt          |`PROMPT_DESIGN.md` § 3.4                     |
|API key location     |Server-side proxy in production             |Security requirement                         |
|Test runner          |Vitest                                      |Configured in `vite.config.js`               |
|CSS framework        |Tailwind CSS v3                             |`tailwind.config.js`                         |
|Routing              |React Router v6                             |`App.jsx`                                    |
