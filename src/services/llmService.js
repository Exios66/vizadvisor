import { buildMessages, buildFollowUpMessages } from './promptTemplates';
import { validateResponse } from '../utils/responseValidator';

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
  if (PROXY_URL) return base;
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
