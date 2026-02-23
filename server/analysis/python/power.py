#!/usr/bin/env python3
"""Power analysis — F-test power, sample size, or effect size."""
import json
import sys
import math
from statsmodels.stats.power import FtestAnovaPower

input_json = sys.stdin.read()
parsed = json.loads(input_json)
config = parsed["config"]

u = config["u"]
v = config.get("v")
f2 = config.get("f2")
power = config.get("power")

n_null = sum(x is None for x in [v, f2, power])
if n_null != 1:
    out = {"error": "Exactly one of v, f2, or power must be null (to be solved for)"}
    print(json.dumps(out))
    sys.exit(0)

ft = FtestAnovaPower()
# Cohen's f = sqrt(f2) for regression-style F-test
# k_groups = u+1 gives df1=u for regression with u predictors
k = u + 1

try:
    if v is None:
        n = ft.solve_power(effect_size=math.sqrt(f2), power=power, alpha=0.05, k_groups=k)
        v = n - u - 1
    elif f2 is None:
        n = v + u + 1
        f2 = ft.solve_power(effect_size=None, nobs=n, power=power, alpha=0.05, k_groups=k)
        f2 = f2 ** 2 if f2 is not None else None  # effect_size is f, we store f2
    else:
        n = v + u + 1
        power = ft.solve_power(effect_size=math.sqrt(f2), nobs=n, alpha=0.05, k_groups=k)

    out = {
        "u": u,
        "v": float(v) if v is not None else None,
        "f2": float(f2) if f2 is not None else None,
        "power": float(power) if power is not None else None,
        "n": float(n) if n is not None else None,
    }
except Exception as e:
    out = {"error": str(e)}

print(json.dumps(out, allow_nan=False))
