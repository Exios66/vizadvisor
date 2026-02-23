#!/usr/bin/env python3
"""Factorial ANOVA (2x2 or 2x2x2) — main effects, interactions, F, p, eta²."""
import json
import sys
import pandas as pd
from statsmodels.formula.api import ols
from statsmodels.stats.anova import anova_lm

input_json = sys.stdin.read()
parsed = json.loads(input_json)
data = pd.DataFrame(parsed["data"])
config = parsed["config"]

outcome = config["outcome"]
factors = config["factors"]

for f in factors:
    data[f] = pd.Categorical(data[f])

formula = outcome + " ~ " + " * ".join(factors)
model = ols(formula, data=data).fit()
anova_res = anova_lm(model, typ=3)

anova_list = []
for term in anova_res.index:
    row = anova_res.loc[term]
    ss_effect = row.get("sum_sq", 0)
    ss_resid = anova_res.loc["Residual", "sum_sq"] if "Residual" in anova_res.index else 0
    partial_eta_sq = ss_effect / (ss_effect + ss_resid) if (ss_effect + ss_resid) > 0 else None
    anova_list.append({
        "term": str(term),
        "sum_sq": float(ss_effect),
        "df": int(row.get("df", 0)),
        "F": float(row.get("F", 0)) if "F" in row else None,
        "p_value": float(row.get("PR(>F)", 0)) if "PR(>F)" in row else None,
        "partial_eta_sq": partial_eta_sq,
    })

out = {
    "anova": anova_list,
    "r_squared": float(model.rsquared),
}
print(json.dumps(out, allow_nan=False))
