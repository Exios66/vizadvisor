#!/usr/bin/env Rscript
# Linear regression — coefficients, ANOVA, partial eta squared
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
predictors <- config$predictors
covariates <- if (is.null(config$covariates)) character(0) else config$covariates
all_pred <- c(predictors, covariates)

form <- as.formula(paste(outcome, "~", paste(all_pred, collapse = " + ")))
fit <- lm(form, data = data)

coef_tbl <- broom::tidy(fit, conf.int = TRUE)
coef_list <- lapply(1:nrow(coef_tbl), function(i) {
  as.list(coef_tbl[i, ])
})

anova_fit <- tryCatch(car::Anova(fit, type = "III"), error = function(e) anova(fit))
anova_tbl <- broom::tidy(anova_fit)
anova_list <- lapply(1:nrow(anova_tbl), function(i) {
  row <- as.list(anova_tbl[i, ])
  if ("sumsq" %in% names(row)) {
    ss_resid <- anova_tbl$sumsq[nrow(anova_tbl)]
    ss_effect <- row$sumsq
    row$partial_eta_sq <- if (ss_resid > 0) ss_effect / (ss_effect + ss_resid) else NA_real_
  }
  row
})

out <- list(
  coefficients = coef_list,
  anova = anova_list,
  r_squared = summary(fit)$r.squared,
  adj_r_squared = summary(fit)$adj.r.squared
)
cat(toJSON(out, auto_unbox = TRUE, digits = 8))
