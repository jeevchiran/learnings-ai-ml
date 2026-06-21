import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { linspace, randn, plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

// ── 1-D regression tree (CART, MSE criterion) ─────────────────────────────────
function arrayMean(arr) {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function arrayMSE(arr) {
  if (arr.length === 0) return 0
  const m = arrayMean(arr)
  return arr.reduce((s, v) => s + (v - m) * (v - m), 0) / arr.length
}

function buildRegressionTree(indices, X, Y, depth, maxDepth) {
  const yVals = indices.map(i => Y[i])
  const predVal = arrayMean(yVals)
  if (depth >= maxDepth || indices.length <= 1) return { leaf: true, value: predVal, n: indices.length }

  const xVals = indices.map(i => X[i])
  const sorted = xVals.slice().sort((a, b) => a - b)
  const thresholds = []
  for (let k = 0; k < sorted.length - 1; k++) thresholds.push((sorted[k] + sorted[k + 1]) / 2)

  const parentMSE = arrayMSE(yVals)
  let bestGain = -Infinity, bestThresh = null

  for (const thr of thresholds) {
    const leftY = [], rightY = []
    for (const ii of indices) {
      if (X[ii] <= thr) leftY.push(Y[ii]); else rightY.push(Y[ii])
    }
    if (leftY.length === 0 || rightY.length === 0) continue
    const gain = parentMSE - (leftY.length / yVals.length) * arrayMSE(leftY) - (rightY.length / yVals.length) * arrayMSE(rightY)
    if (gain > bestGain) { bestGain = gain; bestThresh = thr }
  }

  if (bestThresh === null) return { leaf: true, value: predVal, n: indices.length }

  const leftIdx = indices.filter(i => X[i] <= bestThresh)
  const rightIdx = indices.filter(i => X[i] > bestThresh)
  return {
    leaf: false, threshold: bestThresh, value: predVal, n: indices.length,
    left: buildRegressionTree(leftIdx, X, Y, depth + 1, maxDepth),
    right: buildRegressionTree(rightIdx, X, Y, depth + 1, maxDepth),
  }
}

function predictRegressionTree(node, x) {
  if (node.leaf) return node.value
  return x <= node.threshold ? predictRegressionTree(node.left, x) : predictRegressionTree(node.right, x)
}

function countLeaves(node) {
  if (node.leaf) return 1
  return countLeaves(node.left) + countLeaves(node.right)
}

function computeTreeMSE(node, X, Y) {
  return Y.reduce((s, yi, i) => s + (predictRegressionTree(node, X[i]) - yi) ** 2, 0) / Y.length
}

function generateDataset() {
  const N_TRAIN = 40, N_TEST = 20
  const trainX = linspace(0, 1, N_TRAIN).map(x => x + (Math.random() - 0.5) * 0.015)
  const trainY = trainX.map(x => Math.sin(2 * Math.PI * x) + randn() * 0.1)
  const testX = linspace(0, 1, N_TEST).map(x => x + (Math.random() - 0.5) * 0.02)
  const testY = testX.map(x => Math.sin(2 * Math.PI * x) + randn() * 0.1)
  return { trainX, trainY, testX, testY }
}

export default function PruningWidget() {
  const errorRef = useRef(null)
  const fitRef = useRef(null)
  const dataRef = useRef(generateDataset())
  const [depth, setDepth] = useState(3)
  const [stats, setStats] = useState({ trainMSE: 0, testMSE: 0, leaves: 0 })
  const mseCache = useRef({ train: [], test: [] })

  const buildAllDepths = useCallback(() => {
    const { trainX, trainY, testX, testY } = dataRef.current
    const allIdx = trainX.map((_, i) => i)
    const trainMSEs = [], testMSEs = []
    for (let d = 1; d <= 12; d++) {
      const tree = buildRegressionTree(allIdx, trainX, trainY, 0, d)
      trainMSEs.push(computeTreeMSE(tree, trainX, trainY))
      testMSEs.push(computeTreeMSE(tree, testX, testY))
    }
    mseCache.current = { train: trainMSEs, test: testMSEs }
  }, [])

  const renderErrorCurve = useCallback((selectedDepth) => {
    const depths = Array.from({ length: 12 }, (_, i) => i + 1)
    const trainTrace = { x: depths, y: mseCache.current.train, mode: 'lines+markers', name: 'Train MSE', line: { color: '#2563eb', width: 2 }, marker: { size: 6 } }
    const testTrace = { x: depths, y: mseCache.current.test, mode: 'lines+markers', name: 'Test MSE', line: { color: '#dc2626', width: 2 }, marker: { size: 6 } }
    const vline = { type: 'line', x0: selectedDepth, x1: selectedDepth, y0: 0, y1: 1, yref: 'paper', line: { color: '#d97706', width: 1.5, dash: 'dash' } }
    Plotly.react(errorRef.current, [trainTrace, testTrace], plotlyLayout({
      title: { text: 'MSE vs. Max Depth', font: { size: 13 } },
      xaxis: { title: 'Max Depth', dtick: 1 },
      yaxis: { title: 'MSE' },
      shapes: [vline],
      legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: 1.12 },
    }), PLOTLY_CONFIG)
  }, [])

  const renderFit = useCallback((d) => {
    const { trainX, trainY, testX, testY } = dataRef.current
    const allIdx = trainX.map((_, i) => i)
    const tree = buildRegressionTree(allIdx, trainX, trainY, 0, d)
    const fineX = linspace(0, 1, 300)
    const fineY = fineX.map(x => predictRegressionTree(tree, x))
    const trueY = fineX.map(x => Math.sin(2 * Math.PI * x))
    Plotly.react(fitRef.current, [
      { x: trainX, y: trainY, mode: 'markers', name: 'Train', marker: { color: '#2563eb', size: 5, opacity: 0.7 } },
      { x: testX, y: testY, mode: 'markers', name: 'Test', marker: { color: '#dc2626', size: 5, opacity: 0.7, symbol: 'x' } },
      { x: fineX, y: fineY, mode: 'lines', name: `Tree fit (depth ${d})`, line: { color: '#d97706', width: 2 } },
      { x: fineX, y: trueY, mode: 'lines', name: 'True f(x)', line: { color: '#6b7280', width: 1, dash: 'dot' } },
    ], plotlyLayout({
      title: { text: 'Fitted Piecewise Function', font: { size: 13 } },
      xaxis: { title: 'x', range: [-0.02, 1.02] },
      yaxis: { title: 'y' },
      legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: 1.12 },
    }), PLOTLY_CONFIG)

    const leaves = countLeaves(tree)
    setStats({
      trainMSE: mseCache.current.train[d - 1]?.toFixed(4) ?? '—',
      testMSE: mseCache.current.test[d - 1]?.toFixed(4) ?? '—',
      leaves,
    })
  }, [])

  useEffect(() => {
    Plotly.newPlot(errorRef.current, [], plotlyLayout({ height: 320 }), PLOTLY_CONFIG)
    Plotly.newPlot(fitRef.current, [], plotlyLayout({ height: 300 }), PLOTLY_CONFIG)
    buildAllDepths()
    renderErrorCurve(depth)
    renderFit(depth)
  }, []) // eslint-disable-line

  function handleDepth(d) {
    setDepth(d)
    renderErrorCurve(d)
    renderFit(d)
  }

  function resample() {
    dataRef.current = generateDataset()
    buildAllDepths()
    renderErrorCurve(depth)
    renderFit(depth)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <label style={{ fontWeight: 600 }}>Max Depth: <span>{depth}</span>
          <input type="range" min={1} max={12} value={depth}
            onChange={e => handleDepth(parseInt(e.target.value, 10))}
            style={{ display: 'block', minWidth: 160 }} />
        </label>
        <button onClick={resample} style={{ padding: '0.4rem 1rem', borderRadius: 6, border: '1px solid var(--border, #d1d5db)', cursor: 'pointer', background: 'var(--bg-secondary, #f3f4f6)' }}>
          Resample
        </button>
      </div>
      <div ref={errorRef} />
      <div ref={fitRef} />
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        {[['Train MSE', stats.trainMSE], ['Test MSE', stats.testMSE], ['Leaf Nodes', stats.leaves]].map(([label, val]) => (
          <div key={label} style={{ background: 'var(--bg-secondary, #f3f4f6)', borderRadius: 8, padding: '0.5rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6b7280)' }}>{label}</div>
            <strong>{val}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
