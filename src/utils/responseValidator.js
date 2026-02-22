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
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
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
