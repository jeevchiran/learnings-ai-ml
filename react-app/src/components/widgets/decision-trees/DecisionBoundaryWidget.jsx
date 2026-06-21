import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// Seeded PRNG (Mulberry32) for reproducible data
function makePrng(seed) {
  let s = seed
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Generate dataset once
function generateData() {
  const rng = makePrng(1337)
  const data = []
  for (let i = 0; i < 80; i++) {
    const x1 = rng() * 10
    const x2 = rng() * 6 + 4
    const noise = (rng() - 0.5) * 1.2
    const label = ((x1 + noise > 5 && x2 + noise > 6) || (x1 + noise > 7)) ? 1 : 0
    data.push({ x1, x2, y: label })
  }
  return data
}

const DATA = generateData()

function giniNode(data) {
  if (data.length === 0) return 0
  const pos = data.filter(d => d.y === 1).length
  const p = pos / data.length
  return 1 - p * p - (1 - p) * (1 - p)
}

function majorityClass(data) {
  if (data.length === 0) return 0
  const pos = data.filter(d => d.y === 1).length
  return pos >= data.length / 2 ? 1 : 0
}

function allSameLabel(data) {
  if (data.length === 0) return true
  const first = data[0].y
  return data.every(d => d.y === first)
}

function findBestSplit(data) {
  let bestGain = -Infinity
  let bestFeature = null
  let bestThreshold = null
  const parentGini = giniNode(data)
  const n = data.length
  for (const feat of ['x1', 'x2']) {
    const vals = data.map(d => d[feat])
    const unique = [...new Set(vals)].sort((a, b) => a - b)
    for (let i = 0; i < unique.length - 1; i++) {
      const t = (unique[i] + unique[i + 1]) / 2
      const left = data.filter(d => d[feat] <= t)
      const right = data.filter(d => d[feat] > t)
      if (left.length === 0 || right.length === 0) continue
      const weightedGini = (left.length / n) * giniNode(left) + (right.length / n) * giniNode(right)
      const gain = parentGini - weightedGini
      if (gain > bestGain) { bestGain = gain; bestFeature = feat; bestThreshold = t }
    }
  }
  return { feature: bestFeature, threshold: bestThreshold, gain: bestGain }
}

function buildTree(data, maxDepth, depth) {
  if (depth >= maxDepth || data.length <= 1 || allSameLabel(data)) {
    return { isLeaf: true, prediction: majorityClass(data), size: data.length }
  }
  const split = findBestSplit(data)
  if (split.feature === null || split.gain <= 0) {
    return { isLeaf: true, prediction: majorityClass(data), size: data.length }
  }
  const left = data.filter(d => d[split.feature] <= split.threshold)
  const right = data.filter(d => d[split.feature] > split.threshold)
  return {
    isLeaf: false,
    feature: split.feature,
    threshold: split.threshold,
    left: buildTree(left, maxDepth, depth + 1),
    right: buildTree(right, maxDepth, depth + 1),
  }
}

function predictTree(node, point) {
  if (node.isLeaf) return node.prediction
  return point[node.feature] <= node.threshold
    ? predictTree(node.left, point)
    : predictTree(node.right, point)
}

function countLeaves(node) {
  if (node.isLeaf) return 1
  return countLeaves(node.left) + countLeaves(node.right)
}

function getShapes(node, x1min, x1max, x2min, x2max) {
  if (node.isLeaf) return []
  const shapes = []
  if (node.feature === 'x1') {
    const t = node.threshold
    shapes.push({ type: 'line', x0: t, x1: t, y0: x2min, y1: x2max, line: { color: 'rgba(107,114,128,0.75)', width: 1.5, dash: 'dot' } })
    shapes.push(...getShapes(node.left, x1min, t, x2min, x2max))
    shapes.push(...getShapes(node.right, t, x1max, x2min, x2max))
  } else {
    const t = node.threshold
    shapes.push({ type: 'line', x0: x1min, x1: x1max, y0: t, y1: t, line: { color: 'rgba(107,114,128,0.75)', width: 1.5, dash: 'dot' } })
    shapes.push(...getShapes(node.left, x1min, x1max, x2min, t))
    shapes.push(...getShapes(node.right, x1min, x1max, t, x2max))
  }
  return shapes
}

function buildRegionTrace(tree) {
  const nx = 60, ny = 50
  const x1vals = linspace(0, 10, nx)
  const x2vals = linspace(4, 10, ny)
  const z = x2vals.map(x2 => x1vals.map(x1 => predictTree(tree, { x1, x2 })))
  return {
    type: 'heatmap',
    x: x1vals,
    y: x2vals,
    z,
    colorscale: [[0, 'rgba(239,68,68,0.13)'], [1, 'rgba(37,99,235,0.13)']],
    showscale: false,
    hoverinfo: 'none',
    zmin: 0,
    zmax: 1,
  }
}

export default function DecisionBoundaryWidget() {
  const plotRef = useRef(null)
  const [depth, setDepth] = useState(2)
  const [stats, setStats] = useState({ accuracy: '0%', leaves: 0 })

  useEffect(() => {
    const tree = buildTree(DATA, depth, 0)
    const shapes = getShapes(tree, 0, 10, 4, 10)
    const regionTrace = buildRegionTrace(tree)

    const passData = DATA.filter(d => d.y === 1)
    const failData = DATA.filter(d => d.y === 0)
    const tracePass = {
      x: passData.map(d => d.x1), y: passData.map(d => d.x2),
      mode: 'markers', type: 'scatter', name: 'Pass',
      marker: { color: '#2563eb', size: 7, symbol: 'circle', line: { color: '#1d4ed8', width: 1 } },
    }
    const traceFail = {
      x: failData.map(d => d.x1), y: failData.map(d => d.x2),
      mode: 'markers', type: 'scatter', name: 'Fail',
      marker: { color: '#dc2626', size: 7, symbol: 'circle', line: { color: '#b91c1c', width: 1 } },
    }

    const layout = plotlyLayout({
      height: 400,
      shapes,
      xaxis: { title: 'Study Hours (x₁)', range: [0, 10] },
      yaxis: { title: 'Sleep Hours (x₂)', range: [4, 10] },
      legend: { orientation: 'h', y: 1.08 },
      margin: { t: 20, r: 20, b: 60, l: 60 },
    })

    Plotly.react(plotRef.current, [regionTrace, tracePass, traceFail], layout, PLOTLY_CONFIG)

    const leaves = countLeaves(tree)
    const correct = DATA.filter(d => predictTree(tree, d) === d.y).length
    const accuracy = (correct / DATA.length * 100).toFixed(1) + '%'
    setStats({ accuracy, leaves })
  }, [depth])

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div ref={plotRef} />
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '0.75rem 0', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600 }}>Max Depth: <span>{depth}</span></label>
        <input
          type="range" min={1} max={8} value={depth}
          onChange={e => setDepth(parseInt(e.target.value, 10))}
          style={{ flex: 1, minWidth: 120 }}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Accuracy', value: stats.accuracy },
          { label: 'Leaf Nodes', value: stats.leaves },
          { label: 'Tree Depth', value: depth },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-secondary, #f3f4f6)', borderRadius: 8, padding: '0.5rem 1rem', minWidth: 100 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6b7280)' }}>{s.label}</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
