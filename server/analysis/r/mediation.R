#!/usr/bin/env Rscript
# Mediation analysis — paths a, b, c', indirect effect, bootstrap CI
suppressPackageStartupMessages({
  library(jsonlite)
  library(lavaan)
})

input <- readLines(file("stdin"), warn = FALSE)
parsed <- fromJSON(paste(input, collapse = "\n"))
data <- as.data.frame(parsed$data)
config <- parsed$config

x <- config$x
m <- config$m
y <- config$y

model <- paste0(
  m, " ~ a*", x, "\n",
  y, " ~ b*", m, " + cp*", x, "\n",
  "indirect := a*b"
)

fit <- sem(model, data = data, se = "bootstrap", bootstrap = 500)
pe <- parameterEstimates(fit)

get_par <- function(lbl) {
  r <- pe[pe$label == lbl, ]
  if (nrow(r) == 0) return NULL
  list(est = r$est, se = r$se, pvalue = r$pvalue, ci_lower = r$ci.lower, ci_upper = r$ci.upper)
}

indirect <- pe[pe$label == "indirect", ]
if (nrow(indirect) == 0) {
  indirect <- tryCatch({
    indirect_est <- pe[pe$label == "a", "est"] * pe[pe$label == "b", "est"]
    list(est = indirect_est, se = NA, pvalue = NA, ci_lower = NA, ci_upper = NA)
  }, error = function(e) list(est = NA, se = NA, pvalue = NA, ci_lower = NA, ci_upper = NA))
} else {
  indirect <- as.list(indirect[1, c("est", "se", "pvalue", "ci.lower", "ci.upper")])
  names(indirect) <- c("est", "se", "pvalue", "ci_lower", "ci_upper")
}

total_c <- get_par("cp")
if (is.null(total_c)) total_c <- list(est = pe[pe$rhs == x & pe$lhs == y, "est"][1], se = NA, pvalue = NA)

out <- list(
  path_a = get_par("a"),
  path_b = get_par("b"),
  path_c_prime = get_par("cp"),
  indirect_effect = indirect,
  total_effect = total_c
)
cat(toJSON(out, auto_unbox = TRUE, digits = 8))
