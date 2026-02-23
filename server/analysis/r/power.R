#!/usr/bin/env Rscript
# Power analysis — pwr.f2.test for F-test
suppressPackageStartupMessages({
  library(jsonlite)
  library(pwr)
})

input <- readLines(file("stdin"), warn = FALSE)
parsed <- fromJSON(paste(input, collapse = "\n"))
config <- parsed$config

u <- config$u
v <- config$v
f2 <- config$f2
power <- config$power

n_null <- sum(c(is.null(v), is.null(f2), is.null(power)))
if (n_null != 1) {
  out <- list(error = "Exactly one of v, f2, or power must be NULL (to be solved for)")
  cat(toJSON(out, auto_unbox = TRUE))
  quit(save = "no", status = 0)
}

result <- tryCatch(
  pwr::pwr.f2.test(u = u, v = v, f2 = f2, power = power, sig.level = 0.05),
  error = function(e) {
    list(error = e$message)
  }
)

if ("error" %in% names(result)) {
  out <- result
} else {
  out <- list(
    u = result$u,
    v = result$v,
    f2 = result$f2,
    power = result$power,
    n = if (!is.null(result$v)) result$v + result$u + 1 else NA_real_
  )
}
cat(toJSON(out, auto_unbox = TRUE, digits = 8))
