#!/usr/bin/env Rscript
# Factorial ANOVA (2x2 or 2x2x2) — main effects, interactions, F, p, eta²
suppressPackageStartupMessages({
  library(jsonlite)
  library(dplyr)
  library(broom)
  library(car)
})

input <- readLines(file("stdin"), warn = FALSE)
parsed <- fromJSON(paste(input, collapse = "\n"))
data <- as.data.frame(parsed$data)
config <- parsed$config

outcome <- config$outcome
factors <- config$factors

for (f in factors) {
  data[[f]] <- factor(data[[f]])
}

form_str <- paste(outcome, "~", paste(factors, collapse = "*"))
form <- as.formula(form_str)
fit <- lm(form, data = data)

anova_fit <- tryCatch(car::Anova(fit, type = "III"), error = function(e) anova(fit))
anova_tbl <- broom::tidy(anova_fit)

anova_list <- lapply(1:nrow(anova_tbl), function(i) {
  row <- as.list(anova_tbl[i, ])
  if ("sumsq" %in% names(row) && i < nrow(anova_tbl)) {
    ss_resid <- anova_tbl$sumsq[nrow(anova_tbl)]
    ss_effect <- row$sumsq
    row$partial_eta_sq <- if (ss_resid > 0 && !is.na(ss_effect)) ss_effect / (ss_effect + ss_resid) else NA_real_
  }
  row
})

out <- list(
  anova = anova_list,
  r_squared = summary(fit)$r.squared
)
cat(toJSON(out, auto_unbox = TRUE, digits = 8))
