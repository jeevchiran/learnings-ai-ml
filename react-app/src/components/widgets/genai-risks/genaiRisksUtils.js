// Shared toy-math helpers for the GenAI Risks & Safety track widgets — deterministic, no external deps.

// Expressed confidence stays high and nearly flat regardless of how obscure the
// question is — the model's tone is not a function of what it actually knows.
export function expressedConfidence(obscurity) {
  return 92 - obscurity * 0.08;
}

// Actual accuracy falls away sharply as questions move into the long tail,
// where training data was thin or absent.
export function actualAccuracy(obscurity) {
  return 95 * Math.exp(-((obscurity / 62) ** 1.7));
}

// Each mitigation layer catches some fraction of what reaches it. Layers compose
// multiplicatively, so residual risk shrinks fast but never reaches zero —
// the entire point of defence in depth.
export function residualRisk(layers, baseRate = 100) {
  return layers.reduce((risk, layer) => risk * (1 - layer.catchRate), baseRate);
}

// Maps a domain range to an SVG pixel range and returns an "M..L..L.." path string.
export function buildCurvePath(fn, { xMin, xMax, yMax, width, height, padding = 14, samples = 60 }) {
  const usableW = width - 2 * padding;
  const usableH = height - 2 * padding;
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const x = xMin + (i / samples) * (xMax - xMin);
    const y = fn(x);
    const px = padding + (usableW * i) / samples;
    const py = padding + usableH * (1 - Math.min(Math.max(y, 0) / yMax, 1));
    pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return pts.join(' ');
}
