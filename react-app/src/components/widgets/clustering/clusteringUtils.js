// Clustering math utilities (ported from clustering/js/common.js)

export const CLUSTER_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#d97706',
  '#7c3aed', '#0891b2', '#be185d', '#854d0e',
];

// Euclidean distance between two points
export function euclidean(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

// Manhattan distance
export function manhattan(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum;
}

// Cosine similarity (returns value in [-1, 1])
export function cosineSim(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Centroid of an array of points [[x,y], ...]
export function centroid(points) {
  if (!points.length) return null;
  const dim = points[0].length;
  const c = new Array(dim).fill(0);
  for (let i = 0; i < points.length; i++)
    for (let d = 0; d < dim; d++) c[d] += points[i][d];
  for (let d = 0; d < dim; d++) c[d] /= points.length;
  return c;
}

// Assign each point to the nearest centroid; returns array of cluster indices
export function assignClusters(points, centroids) {
  return points.map(p => {
    let best = 0, bestDist = Infinity;
    for (let k = 0; k < centroids.length; k++) {
      const d = euclidean(p, centroids[k]);
      if (d < bestDist) { bestDist = d; best = k; }
    }
    return best;
  });
}

// Update centroids given current assignments
export function updateCentroids(points, labels, K) {
  const clusters = Array.from({ length: K }, () => []);
  for (let i = 0; i < points.length; i++) clusters[labels[i]].push(points[i]);
  return clusters.map(c => c.length > 0 ? centroid(c) : [Math.random() * 10, Math.random() * 10]);
}

// Within-Cluster Sum of Squares (inertia)
export function wcss(points, labels, centroids) {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const d = euclidean(points[i], centroids[labels[i]]);
    total += d * d;
  }
  return total;
}

// K-means++ initialization
export function kMeansPlusPlusInit(points, K) {
  const centroids = [];
  centroids.push(points[Math.floor(Math.random() * points.length)].slice());
  for (let k = 1; k < K; k++) {
    const dists = points.map(p => {
      let minD = Infinity;
      for (const c of centroids) {
        const d = euclidean(p, c);
        if (d < minD) minD = d;
      }
      return minD * minD;
    });
    const totalD = dists.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalD, cumSum = 0;
    let chosen = points.length - 1;
    for (let i = 0; i < points.length; i++) {
      cumSum += dists[i];
      if (cumSum >= r) { chosen = i; break; }
    }
    centroids.push(points[chosen].slice());
  }
  return centroids;
}

// Run full K-means to convergence; returns { labels, centroids, inertia, iterations }
export function kMeans(points, K, maxIter = 100, initCentroids = null) {
  let centroids = initCentroids ? initCentroids.map(c => c.slice()) : kMeansPlusPlusInit(points, K);
  let labels = assignClusters(points, centroids);
  for (let iter = 0; iter < maxIter; iter++) {
    const newCentroids = updateCentroids(points, labels, K);
    const newLabels = assignClusters(points, newCentroids);
    const moved = newCentroids.some((c, k) => euclidean(c, centroids[k]) > 1e-10);
    centroids = newCentroids;
    labels = newLabels;
    if (!moved) break;
  }
  return { labels, centroids, inertia: wcss(points, labels, centroids) };
}

// Best of N runs (lowest inertia)
export function bestKMeans(points, K, runs = 5) {
  let best = null;
  for (let r = 0; r < runs; r++) {
    const result = kMeans(points, K, 100);
    if (best === null || result.inertia < best.inertia) best = result;
  }
  return best;
}

// Silhouette score for a single point i
export function silhouettePoint(i, points, labels) {
  const myCluster = labels[i];
  const sameCluster = [];
  const otherClusters = {};
  for (let j = 0; j < points.length; j++) {
    if (j === i) continue;
    const d = euclidean(points[i], points[j]);
    if (labels[j] === myCluster) {
      sameCluster.push(d);
    } else {
      if (!otherClusters[labels[j]]) otherClusters[labels[j]] = [];
      otherClusters[labels[j]].push(d);
    }
  }
  const meanArr = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const a = sameCluster.length > 0 ? meanArr(sameCluster) : 0;
  let b = Infinity;
  for (const k of Object.keys(otherClusters)) {
    const md = meanArr(otherClusters[k]);
    if (md < b) b = md;
  }
  if (b === Infinity) return 0;
  return (b - a) / Math.max(a, b);
}

// Mean silhouette score
export function silhouetteScore(points, labels) {
  if (points.length < 2) return 0;
  const K = Math.max(...labels) + 1;
  if (K < 2) return 0;
  const scores = points.map((_, i) => silhouettePoint(i, points, labels));
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// Generate n points from K Gaussian blobs (seeded)
export function generateBlobs(n, K, spread = 1.0, seed = 42) {
  let s = seed;
  function seededRand() {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function seededRandn() {
    let u = 0, v = 0;
    while (u === 0) u = seededRand();
    while (v === 0) v = seededRand();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  const centers = [];
  for (let k = 0; k < K; k++) centers.push([2 + seededRand() * 6, 2 + seededRand() * 6]);
  const points = [], trueLabels = [];
  for (let i = 0; i < n; i++) {
    const k = Math.floor(seededRand() * K);
    points.push([centers[k][0] + seededRandn() * spread, centers[k][1] + seededRandn() * spread]);
    trueLabels.push(k);
  }
  return { points, trueLabels, centers };
}
