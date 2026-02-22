import Papa from 'papaparse';

const MAX_FILE_SIZE_BYTES   = 20 * 1024 * 1024;
const WARN_FILE_SIZE_BYTES  =  5 * 1024 * 1024;
const MAX_ROWS_FOR_SCHEMA   = 1000;
const SAMPLE_ROW_COUNT      = 5;

export const FILE_SIZE_ERROR = 'File exceeds 20 MB. Please sample or summarize your data before uploading.';
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
