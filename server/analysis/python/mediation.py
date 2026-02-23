#!/usr/bin/env python3
"""Mediation analysis — paths a, b, c', indirect effect, bootstrap CI."""
import json
import sys
import pandas as pd
import numpy as np
import statsmodels.api as sm

input_json = sys.stdin.read()
parsed = json.loads(input_json)
data = pd.DataFrame(parsed["data"])
config = parsed["config"]

x_col = config["x"]
m_col = config["m"]
y_col = config["y"]

n_boot = 500


def run_paths(df):
    X_m = sm.add_constant(df[x_col])
    model_m = sm.OLS(df[m_col], X_m).fit()
    a = model_m.params[x_col]

    X_y = sm.add_constant(df[[m_col, x_col]])
    model_y = sm.OLS(df[y_col], X_y).fit()
    b = model_y.params[m_col]
    cp = model_y.params[x_col]
    return a, b, cp


a, b, cp = run_paths(data)
indirect_obs = a * b

boot_indirect = []
np.random.seed(42)
n = len(data)
for _ in range(n_boot):
    idx = np.random.choice(n, n, replace=True)
    sample = data.iloc[idx]
    try:
        ai, bi, _ = run_paths(sample)
        boot_indirect.append(ai * bi)
    except Exception:
        pass

boot_indirect = np.array(boot_indirect)
ci_lower = float(np.percentile(boot_indirect, 2.5)) if len(boot_indirect) else None
ci_upper = float(np.percentile(boot_indirect, 97.5)) if len(boot_indirect) else None
se_boot = float(np.std(boot_indirect)) if len(boot_indirect) else None
pval = float(np.mean(boot_indirect <= 0) * 2) if len(boot_indirect) else None

out = {
    "path_a": {"est": float(a)},
    "path_b": {"est": float(b)},
    "path_c_prime": {"est": float(cp)},
    "indirect_effect": {
        "est": float(indirect_obs),
        "se": se_boot,
        "pvalue": pval,
        "ci_lower": ci_lower,
        "ci_upper": ci_upper,
    },
    "total_effect": {"est": float(cp + indirect_obs)},
}
print(json.dumps(out, allow_nan=False))
