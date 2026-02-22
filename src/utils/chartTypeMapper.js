export const CHART_CANDIDATES = {
  comparison: [
    { type: 'bar chart',         score: 10, bestFor: ['nominal', 'ordinal'] },
    { type: 'grouped bar chart', score: 9,  bestFor: ['nominal', 'ordinal'], minCols: 2 },
    { type: 'dot plot',          score: 7,  bestFor: ['nominal'] },
    { type: 'radar chart',       score: 4,  bestFor: ['ordinal'], maxCols: 10, warn: 'Use only when shape pattern matters' },
  ],
  trend: [
    { type: 'line chart',        score: 10, bestFor: ['temporal'] },
    { type: 'area chart',        score: 8,  bestFor: ['temporal'] },
    { type: 'stacked area',      score: 6,  bestFor: ['temporal'], minSeries: 2 },
    { type: 'candlestick',       score: 5,  bestFor: ['temporal'], domain: 'financial' },
  ],
  distribution: [
    { type: 'histogram',         score: 10, bestFor: ['quantitative'] },
    { type: 'density plot',      score: 9,  bestFor: ['quantitative'] },
    { type: 'box plot',          score: 8,  bestFor: ['quantitative'] },
    { type: 'violin plot',      score: 7,  bestFor: ['quantitative'] },
    { type: 'beeswarm',          score: 5,  bestFor: ['quantitative'], maxRows: 300 },
  ],
  correlation: [
    { type: 'scatter plot',      score: 10, bestFor: ['quantitative'] },
    { type: 'bubble chart',      score: 8,  bestFor: ['quantitative'], minCols: 3 },
    { type: 'heatmap',           score: 7,  bestFor: ['quantitative', 'ordinal'] },
    { type: 'parallel coords',   score: 6,  bestFor: ['quantitative'], minCols: 4 },
  ],
  'part-of-whole': [
    { type: 'stacked bar',       score: 10, bestFor: ['nominal', 'ordinal'] },
    { type: 'treemap',           score: 8,  bestFor: ['nominal'] },
    { type: 'pie chart',         score: 5,  bestFor: ['nominal'], maxCategories: 5 },
    { type: 'donut chart',       score: 5,  bestFor: ['nominal'], maxCategories: 5 },
    { type: 'waffle chart',      score: 6,  bestFor: ['nominal'], maxCategories: 4 },
  ],
  geospatial: [
    { type: 'choropleth map',    score: 10, bestFor: ['geographic'] },
    { type: 'symbol map',        score: 9,  bestFor: ['geographic'] },
    { type: 'dot density map',   score: 7,  bestFor: ['geographic'] },
    { type: 'flow map',          score: 6,  bestFor: ['geographic'] },
  ],
  'network-flow': [
    { type: 'sankey diagram',    score: 10, bestFor: ['nominal'] },
    { type: 'chord diagram',     score: 8,  bestFor: ['nominal'] },
    { type: 'force graph',       score: 7,  bestFor: ['nominal'] },
    { type: 'tree / dendrogram', score: 6,  bestFor: ['nominal'] },
  ],
  ranking: [
    { type: 'sorted bar chart',  score: 10, bestFor: ['nominal', 'ordinal'] },
    { type: 'lollipop chart',    score: 8,  bestFor: ['nominal'] },
    { type: 'bump chart',        score: 7,  bestFor: ['nominal', 'temporal'] },
    { type: 'slope chart',       score: 6,  bestFor: ['nominal', 'temporal'] },
  ],
};

export function getCandidates(goalCategory) {
  return CHART_CANDIDATES[goalCategory] ?? [];
}

export function getTopCandidate(goalCategory) {
  const candidates = getCandidates(goalCategory);
  return candidates.sort((a, b) => b.score - a.score)[0] ?? null;
}
