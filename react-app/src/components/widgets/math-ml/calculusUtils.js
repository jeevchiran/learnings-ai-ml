// Calculus utilities: numerical derivatives, gradients, gradient descent, MLE likelihood

// Central-difference derivative of a scalar function
export function derivative(f, x, h = 1e-4) {
  return (f(x + h) - f(x - h)) / (2 * h);
}

// Numerical gradient of f(x, y) at a point
export function gradient2D(f, x, y, h = 1e-4) {
  const dfdx = (f(x + h, y) - f(x - h, y)) / (2 * h);
  const dfdy = (f(x, y + h) - f(x, y - h)) / (2 * h);
  return [dfdx, dfdy];
}

// Gradient descent path on f(x,y), returns array of {x, y, f}
export function gradientDescentPath(f, start, lr, steps) {
  const path = [{ x: start[0], y: start[1], f: f(start[0], start[1]) }];
  let [x, y] = start;
  for (let i = 0; i < steps; i++) {
    const [gx, gy] = gradient2D(f, x, y);
    x -= lr * gx;
    y -= lr * gy;
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 1e6 || Math.abs(y) > 1e6) break;
    path.push({ x, y, f: f(x, y) });
  }
  return path;
}

// Quadratic form f(x,y) = a*x^2 + b*x*y + c*y^2 — constant Hessian [[2a, b], [b, 2c]]
export function quadraticForm(a, b, c) {
  return (x, y) => a * x * x + b * x * y + c * y * y;
}

export function quadraticHessian(a, b, c) {
  return [[2 * a, b], [b, 2 * c]];
}

// ── Bernoulli MLE / likelihood ──
export function bernoulliLogLikelihood(p, heads, n) {
  const eps = 1e-9;
  const pc = Math.min(Math.max(p, eps), 1 - eps);
  return heads * Math.log(pc) + (n - heads) * Math.log(1 - pc);
}

export function likelihoodCurve(heads, n, points = 100) {
  const ps = Array.from({ length: points }, (_, i) => (i + 0.5) / points);
  const logL = ps.map(p => bernoulliLogLikelihood(p, heads, n));
  return { ps, logL, mle: heads / n };
}
