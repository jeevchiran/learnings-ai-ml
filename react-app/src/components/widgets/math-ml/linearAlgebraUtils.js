// Linear algebra utilities: vectors, 2x2 matrices, eigendecomposition, PCA

export function makeRng(seed = 7) {
  let s = seed >>> 0;
  return function rand() {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randn(rand) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ── Vectors ──
export function dot(a, b) {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

export function norm(a) {
  return Math.sqrt(dot(a, a));
}

export function cosineSim(a, b) {
  const na = norm(a), nb = norm(b);
  if (na === 0 || nb === 0) return 0;
  return dot(a, b) / (na * nb);
}

// Scalar projection length of a onto b, and the projected vector
export function projection(a, b) {
  const nb = norm(b);
  if (nb === 0) return { scalar: 0, vector: [0, 0] };
  const scalar = dot(a, b) / nb;
  const unitB = [b[0] / nb, b[1] / nb];
  return { scalar, vector: [scalar * unitB[0], scalar * unitB[1]] };
}

// ── 2x2 matrices, stored as [[a,b],[c,d]] ──
export function matVec(M, v) {
  return [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];
}

export function matMul(A, B) {
  return [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
}

export function determinant(M) {
  return M[0][0] * M[1][1] - M[0][1] * M[1][0];
}

export function inverse(M) {
  const det = determinant(M);
  if (Math.abs(det) < 1e-10) return null;
  return [[M[1][1] / det, -M[0][1] / det], [-M[1][0] / det, M[0][0] / det]];
}

export function rank(M) {
  const det = determinant(M);
  if (Math.abs(det) > 1e-9) return 2;
  const allZero = M[0][0] === 0 && M[0][1] === 0 && M[1][0] === 0 && M[1][1] === 0;
  return allZero ? 0 : 1;
}

// Real eigenvalues/eigenvectors of a 2x2 matrix (returns null pair if complex, i.e. a pure rotation)
export function eigen2x2(M) {
  const [[a, b], [c, d]] = M;
  const trace = a + d;
  const det = a * d - b * c;
  const disc = trace * trace - 4 * det;
  if (disc < 0) return { real: false, eigenvalues: [], eigenvectors: [] };

  const sq = Math.sqrt(disc);
  const lambdas = [(trace + sq) / 2, (trace - sq) / 2];
  const eigenvectors = lambdas.map(lambda => {
    let v;
    if (Math.abs(b) > 1e-9) v = [b, lambda - a];
    else if (Math.abs(c) > 1e-9) v = [lambda - d, c];
    else v = Math.abs(a - lambda) < 1e-9 ? [1, 0] : [0, 1];
    const n = norm(v);
    return n > 1e-12 ? [v[0] / n, v[1] / n] : [0, 0];
  });
  return { real: true, eigenvalues: lambdas, eigenvectors };
}

// ── PCA on a 2D point cloud ──
export function mean2D(points) {
  const n = points.length;
  return [points.reduce((s, p) => s + p[0], 0) / n, points.reduce((s, p) => s + p[1], 0) / n];
}

export function covarianceMatrix(points) {
  const [mx, my] = mean2D(points);
  const n = points.length;
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of points) {
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
    sxy += (x - mx) * (y - my);
  }
  return [[sxx / (n - 1), sxy / (n - 1)], [sxy / (n - 1), syy / (n - 1)]];
}

// Correlated 2D Gaussian point cloud, seeded
export function generatePointCloud(n, { seed = 7, stretchX = 3, stretchY = 1, angle = 0.5 } = {}) {
  const rand = makeRng(seed);
  const cosA = Math.cos(angle), sinA = Math.sin(angle);
  const points = [];
  for (let i = 0; i < n; i++) {
    const x0 = randn(rand) * stretchX, y0 = randn(rand) * stretchY;
    points.push([x0 * cosA - y0 * sinA, x0 * sinA + y0 * cosA]);
  }
  return points;
}
