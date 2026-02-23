#!/usr/bin/env Rscript
# Descriptive statistics — n, mean, sd, min, max, missing; optional group-by
suppressPackageStartupMessages({
  library(jsonlite)
  library(dplyr)
  library(tidyr)
})

input <- readLines(file("stdin"), warn = FALSE)
parsed <- fromJSON(paste(input, collapse = "\n"))
data <- as.data.frame(parsed$data)
config <- parsed$config

group_by_col <- config$groupBy
columns <- config$columns

if (is.null(columns)) {
  num_cols <- names(data)[sapply(data, function(x) is.numeric(x) || is.integer(x))]
} else {
  num_cols <- intersect(columns, names(data))
}

if (length(num_cols) == 0) {
  out <- list(
    summary = list(),
    by_group = list(),
    error = "No numeric columns found"
  )
  cat(toJSON(out, auto_unbox = TRUE))
  quit(save = "no", status = 0)
}

desc_stats <- function(x) {
  x <- as.numeric(x)
  x <- x[!is.na(x)]
  list(
    n = length(x),
    mean = if (length(x)) mean(x) else NA_real_,
    sd = if (length(x) > 1) sd(x) else NA_real_,
    min = if (length(x)) min(x) else NA_real_,
    max = if (length(x)) max(x) else NA_real_,
    missing = sum(is.na(as.numeric(x)))
  )
}

if (is.null(group_by_col) || !(group_by_col %in% names(data))) {
  summary <- lapply(num_cols, function(col) {
    stats <- desc_stats(data[[col]])
    stats$column <- col
    stats
  })
  by_group <- list()
} else {
  grp <- data[[group_by_col]]
  summary <- lapply(num_cols, function(col) {
    stats <- desc_stats(data[[col]])
    stats$column <- col
    stats
  })
  by_group <- data %>%
    group_by(!!sym(group_by_col)) %>%
    summarise(across(all_of(num_cols), list(
      n = ~ sum(!is.na(.)),
      mean = ~ mean(., na.rm = TRUE),
      sd = ~ sd(., na.rm = TRUE),
      min = ~ min(., na.rm = TRUE),
      max = ~ max(., na.rm = TRUE)
    ), .names = "{.col}_{.fn}"), .groups = "drop")
  by_group <- as.list(by_group)
}

out <- list(summary = summary, by_group = by_group)
cat(toJSON(out, auto_unbox = TRUE, digits = 8))
