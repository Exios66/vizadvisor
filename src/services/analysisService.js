/**
 * Analysis API client — POST /api/analyze
 */
const PROXY_URL = import.meta.env.VITE_API_PROXY_URL;
const BASE_URL = PROXY_URL || 'http://localhost:3001';
const TIMEOUT_MS = parseInt(import.meta.env.VITE_ANALYSIS_TIMEOUT_MS) || 60000;

export async function runAnalysis({ engine, analysisType, data, config }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engine, analysisType, data, config }),
      signal: controller.signal,
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || `Analysis failed (${res.status})`);
    }

    if (json.error) {
      throw new Error(json.error);
    }

    return json;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Analysis timed out after ${TIMEOUT_MS / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
