import { useState, useEffect, useRef, useMemo } from 'react'

const ACCENT = '#c026d3'
const ACCENT_LIGHT = '#fdf4ff'
const LIGHT_RGB = [253, 244, 255]
const ACCENT_RGB = [192, 38, 211]

const LR_MIN = 0.001
const LR_MAX = 1.0
const DEPTH_MIN = 1
const DEPTH_MAX = 10
const LOG_LR_MIN = Math.log10(LR_MIN)
const LOG_LR_MAX = Math.log10(LR_MAX)

function lrToU(lr) { return (Math.log10(lr) - LOG_LR_MIN) / (LOG_LR_MAX - LOG_LR_MIN) }
function uToLr(u) { return Math.pow(10, LOG_LR_MIN + u * (LOG_LR_MAX - LOG_LR_MIN)) }
function depthToV(d) { return (d - DEPTH_MIN) / (DEPTH_MAX - DEPTH_MIN) }
function vToDepth(v) { return DEPTH_MIN + v * (DEPTH_MAX - DEPTH_MIN) }
function clamp01(x) { return Math.max(0, Math.min(1, x)) }
function roundDepth(d) { return Math.max(DEPTH_MIN, Math.min(DEPTH_MAX, Math.round(d))) }

// True global optimum (taller, off-center) and a lower decoy local optimum elsewhere.
const BUMP1 = { lr: 0.05, depth: 7, amp: 1.0, su: 0.17, sv: 0.19 }
const BUMP2 = { lr: 0.5, depth: 2, amp: 0.55, su: 0.13, sv: 0.15 }

function gaussianBump(u, v, bump) {
  const bu = lrToU(bump.lr), bv = depthToV(bump.depth)
  const du = u - bu, dv = v - bv
  return bump.amp * Math.exp(-(du * du / (2 * bump.su * bump.su) + dv * dv / (2 * bump.sv * bump.sv)))
}

// Synthetic validation-score surface: sum of two Gaussian bumps in normalized (lr, depth) space.
function score(lr, depth) {
  const u = lrToU(lr), v = depthToV(depth)
  return gaussianBump(u, v, BUMP1) + gaussianBump(u, v, BUMP2)
}

// Scan the reachable grid (continuous lr, integer depth) once to find the actual best score.
function findTrueOptimum() {
  let best = { lr: BUMP1.lr, depth: BUMP1.depth, score: -Infinity }
  const N = 400
  for (let depth = DEPTH_MIN; depth <= DEPTH_MAX; depth++) {
    for (let i = 0; i <= N; i++) {
      const lr = uToLr(i / N)
      const s = score(lr, depth)
      if (s > best.score) best = { lr, depth, score: s }
    }
  }
  return best
}
const TRUE_OPT = findTrueOptimum()

function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function lerpColor(t) {
  const c = LIGHT_RGB.map((l, i) => Math.round(l + (ACCENT_RGB[i] - l) * clamp01(t)))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

function makePoint(u, v, phase) {
  const lr = uToLr(u)
  const depth = roundDepth(vToDepth(v))
  return { lr, depth, score: score(lr, depth), phase }
}

function buildGridPoints(budget) {
  const n = Math.max(1, Math.round(Math.sqrt(budget)))
  const pts = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const u = n === 1 ? 0.5 : i / (n - 1)
      const v = n === 1 ? 0.5 : j / (n - 1)
      pts.push(makePoint(u, v))
    }
  }
  return { points: pts, gridN: n }
}

function buildRandomPoints(budget, seed) {
  const rng = mulberry32(seed)
  const pts = []
  for (let i = 0; i < budget; i++) pts.push(makePoint(rng(), rng()))
  return pts
}

// Spread-out anchors covering the space (corners, edges, center) so early exploration
// has a fair chance of landing near either bump before the exploitation phase kicks in.
const ANCHORS = [
  [0.15, 0.15], [0.85, 0.15], [0.15, 0.85], [0.85, 0.85], [0.5, 0.5],
  [0.15, 0.5], [0.85, 0.5], [0.5, 0.15], [0.5, 0.85],
]

function buildBayesianPoints(budget, seed) {
  const rng = mulberry32(seed)
  const exploreCount = Math.min(budget, Math.max(3, Math.round(budget * 0.3)))
  const pts = []
  let best = null

  for (let i = 0; i < exploreCount; i++) {
    const wrap = Math.floor(i / ANCHORS.length)
    const [au, av] = ANCHORS[i % ANCHORS.length]
    const jitter = 0.06 + wrap * 0.04
    const u = clamp01(au + (rng() - 0.5) * 2 * jitter)
    const v = clamp01(av + (rng() - 0.5) * 2 * jitter)
    const p = makePoint(u, v, 'explore')
    pts.push(p)
    if (!best || p.score > best.score) best = p
  }

  const exploitTotal = Math.max(1, budget - exploreCount)
  for (let i = 0; i < budget - exploreCount; i++) {
    const t = i / exploitTotal
    const radius = 0.35 * (1 - 0.72 * t)
    const u = clamp01(lrToU(best.lr) + (rng() - 0.5) * 2 * radius)
    const v = clamp01(depthToV(best.depth) + (rng() - 0.5) * 2 * radius)
    const p = makePoint(u, v, 'exploit')
    pts.push(p)
    if (p.score > best.score) best = p
  }

  return pts
}

const MODES = [
  { id: 'grid', label: 'Grid Search' },
  { id: 'random', label: 'Random Search' },
  { id: 'bayesian', label: 'Bayesian Optimization' },
]

const X_TICKS = [0.001, 0.01, 0.1, 1.0]
const Y_TICKS = [1, 2, 4, 6, 8, 10]
const GRID_CELLS = 12

export default function HPOSearchWidget() {
  const [mode, setMode] = useState('bayesian')
  const [budget, setBudget] = useState(16)
  const [seed, setSeed] = useState(1)
  const [activeStep, setActiveStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)

  const { points, gridN } = useMemo(() => {
    if (mode === 'grid') return buildGridPoints(budget)
    if (mode === 'random') return { points: buildRandomPoints(budget, seed), gridN: null }
    return { points: buildBayesianPoints(budget, seed), gridN: null }
  }, [mode, budget, seed])

  useEffect(() => {
    setPlaying(false)
    setActiveStep(-1)
  }, [mode, budget, seed])

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setActiveStep(s => {
          if (s >= points.length - 1) { setPlaying(false); return points.length - 1 }
          return s + 1
        })
      }, 220)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, points.length])

  const startPlay = () => { setActiveStep(-1); setTimeout(() => { setActiveStep(0); setPlaying(true) }, 50) }
  const resetAnim = () => { setPlaying(false); setActiveStep(-1) }
  const resample = () => { if (mode !== 'grid') setSeed(s => s + 1) }

  const visiblePoints = activeStep === -1 ? points : points.slice(0, activeStep + 1)
  const best = visiblePoints.reduce((b, p) => (!b || p.score > b.score ? p : b), null)
  const pctFound = best ? clamp01(best.score / TRUE_OPT.score) * 100 : 0

  // Layout
  const W = 560, H = 380
  const padL = 55, padR = 20, padT = 20, padB = 45
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const xPix = u => padL + u * plotW
  const yPix = v => padT + (1 - v) * plotH

  const cellW = plotW / GRID_CELLS
  const cellH = plotH / GRID_CELLS
  const heatCells = []
  for (let i = 0; i < GRID_CELLS; i++) {
    for (let j = 0; j < GRID_CELLS; j++) {
      const u = (i + 0.5) / GRID_CELLS
      const v = (j + 0.5) / GRID_CELLS
      const s = score(uToLr(u), vToDepth(v))
      heatCells.push({ x: padL + i * cellW, y: padT + (GRID_CELLS - 1 - j) * cellH, fill: lerpColor(s / TRUE_OPT.score) })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem', alignItems: 'center', fontSize: '0.83rem' }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Strategy:</span>
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            style={{ padding: '0.2rem 0.6rem', borderRadius: 4, border: `1px solid ${m.id === mode ? ACCENT : 'var(--border)'}`, background: m.id === mode ? ACCENT : 'var(--bg)', color: m.id === mode ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '0.82rem' }}>
            {m.label}
          </button>
        ))}
        <button onClick={resample} disabled={mode === 'grid'}
          style={{ marginLeft: 'auto', padding: '0.25rem 0.7rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: mode === 'grid' ? 'default' : 'pointer', opacity: mode === 'grid' ? 0.4 : 1, fontSize: '0.82rem' }}>
          Re-sample
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.7rem', fontSize: '0.82rem' }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Budget: {budget} evaluations</span>
        <input type="range" min={6} max={40} value={budget} onChange={e => setBudget(Number(e.target.value))}
          style={{ accentColor: ACCENT, width: 160 }} />
        <span style={{ color: 'var(--text-muted)' }}>
          {mode === 'grid' ? `(${gridN}×${gridN} grid = ${points.length} points)` : `(${points.length} points)`}
        </span>
        <button onClick={startPlay} disabled={playing}
          style={{ marginLeft: 'auto', padding: '0.25rem 0.7rem', borderRadius: 4, border: 'none', background: ACCENT, color: '#fff', cursor: playing ? 'default' : 'pointer', opacity: playing ? 0.5 : 1, fontSize: '0.82rem' }}>
          ▶ Animate
        </button>
        <button onClick={resetAnim}
          style={{ padding: '0.25rem 0.7rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.82rem' }}>
          Reset
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', minWidth: 380 }}>
          {heatCells.map((c, i) => (
            <rect key={i} x={c.x} y={c.y} width={cellW + 0.5} height={cellH + 0.5} fill={c.fill} />
          ))}

          <rect x={padL} y={padT} width={plotW} height={plotH} fill="none" stroke="var(--border)" strokeWidth={1.2} />

          {X_TICKS.map(lr => (
            <g key={lr}>
              <line x1={xPix(lrToU(lr))} y1={padT + plotH} x2={xPix(lrToU(lr))} y2={padT + plotH + 5} stroke="var(--border)" />
              <text x={xPix(lrToU(lr))} y={padT + plotH + 18} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{lr}</text>
            </g>
          ))}
          <text x={padL + plotW / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--text-muted)">learning rate (log scale)</text>

          {Y_TICKS.map(d => (
            <g key={d}>
              <line x1={padL - 5} y1={yPix(depthToV(d))} x2={padL} y2={yPix(depthToV(d))} stroke="var(--border)" />
              <text x={padL - 9} y={yPix(depthToV(d)) + 3} textAnchor="end" fontSize="10" fill="var(--text-muted)">{d}</text>
            </g>
          ))}
          <text x={14} y={padT + plotH / 2} textAnchor="middle" fontSize="11" fill="var(--text-muted)" transform={`rotate(-90 14 ${padT + plotH / 2})`}>max depth</text>

          {visiblePoints.map((p, i) => {
            const cx = xPix(lrToU(p.lr))
            const cy = yPix(depthToV(p.depth))
            const isActive = activeStep === i
            const hollow = p.phase === 'explore'
            return (
              <circle key={i} cx={cx} cy={cy} r={isActive ? 8 : 5.5}
                fill={hollow ? ACCENT_LIGHT : ACCENT}
                stroke={ACCENT} strokeWidth={hollow ? 1.6 : 1}
                opacity={hollow ? 0.95 : 0.88}
                style={{ filter: isActive ? `drop-shadow(0 0 6px ${ACCENT}aa)` : 'none', transition: 'r 0.2s' }} />
            )
          })}

          {best && (
            <circle cx={xPix(lrToU(best.lr))} cy={yPix(depthToV(best.depth))} r={11}
              fill="none" stroke={ACCENT} strokeWidth={2.5} />
          )}
        </svg>
      </div>

      <div style={{ marginTop: '0.6rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${ACCENT}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        {best ? (
          <>
            <strong style={{ color: ACCENT }}>Best score found:</strong>{' '}
            {best.score.toFixed(3)} at (lr={best.lr < 0.01 ? best.lr.toExponential(2) : best.lr.toFixed(3)}, depth={best.depth})
            <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              true optimum: {TRUE_OPT.score.toFixed(3)} at (lr={TRUE_OPT.lr.toFixed(3)}, depth={TRUE_OPT.depth}) — {pctFound.toFixed(1)}% found
            </div>
          </>
        ) : 'No evaluations yet.'}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Background shading is the (normally hidden) true validation-score surface — darker means better. Grid Search lays points on a fixed lattice, Random Search samples uniformly, and Bayesian Optimization explores a few spread-out points first (hollow markers) before biasing later samples toward the best region found so far (filled markers).
      </p>
    </div>
  )
}
