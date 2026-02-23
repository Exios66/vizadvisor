import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runAnalysis } from './analysis/runner.js';

dotenv.config();

const app      = express();
const PORT     = process.env.PORT || 3001;
const API_KEY  = process.env.ANTHROPIC_API_KEY;
const PROVIDER = process.env.LLM_PROVIDER || 'anthropic';

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

app.post('/api/analyze', async (req, res) => {
  try {
    const results = await runAnalysis(req.body);
    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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
