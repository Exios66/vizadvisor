#!/usr/bin/env python3
"""Descriptive statistics — n, mean, sd, min, max, missing; optional group-by."""
import json
import sys
import pandas as pd

input_json = sys.stdin.read()
parsed = json.loads(input_json)
data = pd.DataFrame(parsed["data"])
config = parsed["config"]

group_by_col = config.get("groupBy")
columns = config.get("columns")

if columns is None:
    num_cols = data.select_dtypes(include=["number"]).columns.tolist()
else:
    num_cols = [c for c in columns if c in data.columns and pd.api.types.is_numeric_dtype(data[c])]

if not num_cols:
    out = {"summary": [], "by_group": {}, "error": "No numeric columns found"}
    print(json.dumps(out))
    sys.exit(0)


def desc_stats(series):
    s = pd.to_numeric(series, errors="coerce")
    valid = s.dropna()
    return {
        "column": series.name,
        "n": int(valid.count()),
        "mean": float(valid.mean()) if len(valid) else None,
        "sd": float(valid.std()) if len(valid) > 1 else None,
        "min": float(valid.min()) if len(valid) else None,
        "max": float(valid.max()) if len(valid) else None,
        "missing": int(s.isna().sum()),
    }


summary = [desc_stats(data[col]) for col in num_cols]

if group_by_col and group_by_col in data.columns:
    by_group = (
        data.groupby(group_by_col)[num_cols]
        .agg(["count", "mean", "std", "min", "max"])
        .reset_index()
    )
    by_group = by_group.to_dict(orient="list")
else:
    by_group = {}

out = {"summary": summary, "by_group": by_group}
print(json.dumps(out, allow_nan=False))
