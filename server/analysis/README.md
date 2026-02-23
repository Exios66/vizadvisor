# Analysis Service

Statistical analysis via R and Python. The runner spawns scripts, passes JSON via stdin, and returns parsed results.

## Requirements

### R

Install R and required packages:

```r
install.packages(c("jsonlite", "dplyr", "tidyr", "broom", "car", "pwr", "lavaan"))
```

Or run from the project root:

```bash
Rscript -e 'install.packages(c("jsonlite","dplyr","tidyr","broom","car","pwr","lavaan"), repos="https://cloud.r-project.org")'
```

### Python

```bash
pip install -r ../requirements.txt
```

## Environment

- `ANALYSIS_TIMEOUT_MS` — timeout in ms (default: 60000)
- `R_PATH` — path to Rscript (default: `Rscript`)
- `PYTHON_PATH` — path to python3 (default: `python3`)

## Endpoint

`POST /api/analyze`

Body: `{ engine, analysisType, data, config }`

See the main plan for config schemas per analysis type.
