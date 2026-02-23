/**
 * Analysis Runner — spawns R or Python scripts for statistical analysis.
 * Validates request, passes data via stdin, parses JSON stdout, enforces timeout.
 */
import { spawn } from 'child_process';
import { createInterface } from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MAX_ROWS = 5000;
const DEFAULT_TIMEOUT_MS = 60000;

const ENGINES = ['r', 'python'];
const ANALYSIS_TYPES = ['descriptive', 'regression', 'power', 'mediation', 'factorial'];

function validateColumnName(name) {
  return typeof name === 'string' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && name.length <= 128;
}

function validateRequest(body) {
  const { engine, analysisType, data, config } = body;
  if (!ENGINES.includes(engine)) {
    throw new Error(`Invalid engine: ${engine}. Must be one of: ${ENGINES.join(', ')}`);
  }
  if (!ANALYSIS_TYPES.includes(analysisType)) {
    throw new Error(`Invalid analysisType: ${analysisType}. Must be one of: ${ANALYSIS_TYPES.join(', ')}`);
  }
  if (!Array.isArray(data)) {
    throw new Error('data must be an array of row objects');
  }
  if (data.length > MAX_ROWS) {
    throw new Error(`Data exceeds ${MAX_ROWS} row limit`);
  }
  if (data.length === 0) {
    throw new Error('data must contain at least one row');
  }
  if (!config || typeof config !== 'object') {
    throw new Error('config must be an object');
  }

  const columns = Object.keys(data[0] || {});
  columns.forEach((col) => {
    if (!validateColumnName(col)) {
      throw new Error(`Invalid column name: ${col}`);
    }
  });

  switch (analysisType) {
    case 'descriptive':
      if (config.groupBy && !validateColumnName(config.groupBy)) throw new Error('Invalid groupBy column');
      if (config.columns && (!Array.isArray(config.columns) || config.columns.some((c) => !validateColumnName(c)))) {
        throw new Error('columns must be an array of valid column names');
      }
      break;
    case 'regression':
      if (!config.outcome || !validateColumnName(config.outcome)) throw new Error('Valid outcome required');
      if (!Array.isArray(config.predictors) || config.predictors.some((p) => !validateColumnName(p))) {
        throw new Error('predictors must be an array of valid column names');
      }
      if (config.covariates && (!Array.isArray(config.covariates) || config.covariates.some((c) => !validateColumnName(c)))) {
        throw new Error('covariates must be an array of valid column names');
      }
      break;
    case 'power':
      if (typeof config.u !== 'number' || config.u < 0) throw new Error('u (numerator df) must be a non-negative number');
      if (config.v != null && (typeof config.v !== 'number' || config.v < 0)) throw new Error('v must be non-negative');
      if (config.f2 != null && (typeof config.f2 !== 'number' || config.f2 < 0)) throw new Error('f2 must be non-negative');
      if (config.power != null && (typeof config.power !== 'number' || config.power <= 0 || config.power > 1)) {
        throw new Error('power must be between 0 and 1');
      }
      break;
    case 'mediation':
      if (!config.x || !config.m || !config.y) throw new Error('x, m, y (strings) required');
      [config.x, config.m, config.y].forEach((v) => {
        if (!validateColumnName(v)) throw new Error(`Invalid path variable: ${v}`);
      });
      break;
    case 'factorial':
      if (!config.outcome || !validateColumnName(config.outcome)) throw new Error('Valid outcome required');
      if (!Array.isArray(config.factors) || config.factors.length < 2 || config.factors.length > 3) {
        throw new Error('factors must be array of 2 or 3 column names');
      }
      config.factors.forEach((f) => {
        if (!validateColumnName(f)) throw new Error(`Invalid factor: ${f}`);
      });
      break;
    default:
      break;
  }

  return { engine, analysisType, data, config };
}

function runScript(engine, analysisType, inputJson, timeoutMs) {
  return new Promise((resolve, reject) => {
    const scriptDir = path.join(__dirname, engine);
    const scriptName = `${analysisType}.${engine === 'r' ? 'R' : 'py'}`;
    const scriptPath = path.join(scriptDir, scriptName);

    const cmd = engine === 'r' ? process.env.R_PATH || 'Rscript' : process.env.PYTHON_PATH || 'python3';
    const args = [scriptPath];

    const proc = spawn(cmd, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk) => { stdout += chunk; });
    proc.stderr.on('data', (chunk) => { stderr += chunk; });

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error(`Analysis timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to start ${engine} process: ${err.message}`));
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(stderr || `Process exited with code ${code}`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Invalid JSON output: ${stdout.slice(0, 200)}`));
      }
    });

    proc.stdin.write(inputJson, 'utf8');
    proc.stdin.end();
  });
}

export async function runAnalysis(body) {
  const timeoutMs = Number(process.env.ANALYSIS_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  const { engine, analysisType, data, config } = validateRequest(body);
  const inputJson = JSON.stringify({ data, config });
  return runScript(engine, analysisType, inputJson, timeoutMs);
}
