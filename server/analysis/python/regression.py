#!/usr/bin/env python3
"""Linear regression — coefficients, ANOVA, partial eta squared."""
import json
import sys
import pandas as pd
import statsmodels.api as sm
from statsmodels.formula.api import ols
from statsmodels.stats.anova import anova_lm

input_json = sys.stdin.read()
parsed = json.loads(input_json)
data = pd.DataFrame(parsed["data"])
config = parsed["config"]

outcome = config["outcome"]
predictors = config["predictors"]
covariates = config.get("covariates") or []
all_pred = predictors + covariates

formula = outcome + " ~ " + " + ".join(all_pred)
model = ols(formula, data=data).fit()

coef_list = []
for name, row in model.params.items():
    ci = model.conf_int().loc[name]
    coef_list.append({
        "term": name,
        "estimate": float(row),
        "std_error": float(model.bse[name]),
        "statistic": float(model.tvalues[name]),
        "p_value": float(model.pvalues[name]),
        "conf_low": float(ci[0]),
        "conf_high": float(ci[1]),
    })

anova_res = anova_lm(model, typ=3)
anova_list = []
for term in anova_res.index:
    row = anova_res.loc[term]
    ss_effect = row.get("sum_sq", row.get("F", 0))
    ss_resid = anova_res.loc["Residual", "sum_sq"] if "Residual" in anova_res.index else 0
    partial_eta_sq = ss_effect / (ss_effect + ss_resid) if (ss_effect + ss_resid) > 0 else None
    anova_list.append({
        "term": str(term),
        "sum_sq": float(row.get("sum_sq", 0)),
        "df": int(row.get("df", 0)),
        "F": float(row.get("F", 0)) if "F" in row else None,
        "p_value": float(row.get("PR(>F)", 0)) if "PR(>F)" in row else None,
        "partial_eta_sq": partial_eta_sq,
    })

out = {
    "coefficients": coef_list,
    "anova": anova_list,
    "r_squared": float(model.rsquared),
    "adj_r_squared": float(model.rsquared_adj),
}
print(json.dumps(out, allow_nan=False))
