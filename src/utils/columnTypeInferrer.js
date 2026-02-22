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

  const lv = valid.map((v) => String(v).toLowerCase().trim());
  if (lv.every((v) => BOOLEAN_VALUES.has(v))) {
    return { type: 'boolean', cardinality, nullable, range: null };
  }

  const temporalCount = valid.filter((v) => TEMPORAL_PATTERNS.some((p) => p.test(String(v).trim()))).length;
  if (temporalCount / total >= 0.8) {
    const sorted = [...valid].sort();
    return { type: 'temporal', cardinality, nullable, range: `${sorted[0]} → ${sorted[sorted.length - 1]}` };
  }

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

  if (cardinality <= 12 && lv.every((v) => ORDINAL_TOKENS.test(v))) {
    return { type: 'ordinal', cardinality, nullable, range: null };
  }

  return { type: 'nominal', cardinality, nullable, range: null };
}

export function inferSchema(headers, rows) {
  return headers.map((name) => {
    const values = rows.map((row) => row[name]);
    const inferred = inferColumnType(values);
    if (GEO_COLUMN_NAMES.test(name.trim())) {
      inferred.type = 'geographic';
    }
    return { name, ...inferred };
  });
}
