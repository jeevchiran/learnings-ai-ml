import { useState, useMemo } from 'react'

const COLOR = '#ca8a04'
const C1 = '#2563eb'  // class 1 (blue)
const C0 = '#f59e0b'  // class 0 (amber)

// True black-box boundary: class 1 when y > g(x), a wavy nonlinear frontier.
const g = x => 0.5 + 0.18 * Math.sin(2 * Math.PI * x)
const classify = (x, y) => (y > g(x) ? 1 : 0)

// Deterministic pseudo-random so points don't jump on every re-render.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Solve 3x3 linear system A x = b (Gaussian elimination).
function solve3(A, b) {
  const M = A.map((r, i) => [...r, b[i]])
  for (let c = 0; c < 3; c++) {
    let p = c
    for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    ;[M[c], M[p]] = [M[p], M[c]]
    if (Math.abs(M[c][c]) < 1e-9) return null
    for (let r = 0; r < 3; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]
    }
  }
  return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]]
}

export default function LIMEWidget() {
  const [ix, setIx] = useState(0.35)
  const [iy, setIy] = useState(0.62)
  const [kernel, setKernel] = useState(0.12)
  const [n, setN] = useState(120)

  const W = 340, H = 300
  const px = x => x * W
  const py = y => H - y * H

  const { samples, coef } = useMemo(() => {
    const rnd = mulberry32(42)
    const samples = []
    // Weighted normal equations for [w1,w2,b] fitting label ~ w1*x + w2*y + b
    const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
    const rhs = [0, 0, 0]
    for (let i = 0; i < n; i++) {
      // gaussian perturbation via Box-Muller
      const u1 = rnd(), u2 = rnd()
      const r = Math.sqrt(-2 * Math.log(u1 + 1e-9)) * 0.18
      const sx = Math.min(1, Math.max(0, ix + r * Math.cos(2 * Math.PI * u2)))
      const sy = Math.min(1, Math.max(0, iy + r * Math.sin(2 * Math.PI * u2)))
      const label = classify(sx, sy)
      const d2 = (sx - ix) ** 2 + (sy - iy) ** 2
      const w = Math.exp(-d2 / (2 * kernel * kernel))
      samples.push({ sx, sy, label, w })
      const feat = [sx, sy, 1]
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) A[a][b] += w * feat[a] * feat[b]
        rhs[a] += w * feat[a] * label
      }
    }
    // tiny ridge for stability
    A[0][0] += 1e-4; A[1][1] += 1e-4; A[2][2] += 1e-4
    const coef = solve3(A, rhs)
    return { samples, coef }
  }, [ix, iy, kernel, n])

  // Surrogate boundary: w1*x + w2*y + b = 0.5  → line in (x,y)
  let line = null
  if (coef) {
    const [w1, w2, b] = coef
    const yAt = x => (0.5 - b - w1 * x) / (w2 || 1e-9)
    line = [{ x: 0, y: yAt(0) }, { x: 1, y: yAt(1) }]
  }

  const trueCurve = Array.from({ length: 41 }, (_, i) => ({ x: i / 40, y: g(i / 40) }))

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ overflowX: 'auto' }}>
          <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)' }}>
            {/* true boundary */}
            <polyline points={trueCurve.map(p => `${px(p.x)},${py(p.y)}`).join(' ')}
              fill="none" stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="4,3" />
            {/* surrogate line */}
            {line && (
              <line x1={px(line[0].x)} y1={py(line[0].y)} x2={px(line[1].x)} y2={py(line[1].y)}
                stroke={COLOR} strokeWidth={2.5} />
            )}
            {/* perturbation samples */}
            {samples.map((s, i) => (
              <circle key={i} cx={px(s.sx)} cy={py(s.sy)} r={2 + s.w * 4}
                fill={s.label ? C1 : C0} opacity={0.25 + s.w * 0.7} />
            ))}
            {/* instance */}
            <circle cx={px(ix)} cy={py(iy)} r={7} fill="none" stroke="var(--text)" strokeWidth={2} />
            <circle cx={px(ix)} cy={py(iy)} r={3} fill="var(--text)" />
          </svg>
        </div>

        <div style={{ fontSize: '0.8rem', minWidth: 180, flex: 1 }}>
          <Slider label="Instance x" v={ix} set={setIx} min={0.05} max={0.95} step={0.01} color={COLOR} />
          <Slider label="Instance y" v={iy} set={setIy} min={0.05} max={0.95} step={0.01} color={COLOR} />
          <Slider label="Kernel width" v={kernel} set={setKernel} min={0.04} max={0.30} step={0.01} color={COLOR} />
          <Slider label="Samples" v={n} set={setN} min={30} max={300} step={10} color={COLOR} int />
          {coef && (
            <div style={{ marginTop: '0.5rem', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>
              Local rule:<br />
              <code style={{ color: COLOR }}>{coef[0].toFixed(2)}·x + {coef[1].toFixed(2)}·y + {coef[2].toFixed(2)}</code>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        <span><span style={{ color: C1 }}>●</span> class 1</span>
        <span><span style={{ color: C0 }}>●</span> class 0</span>
        <span style={{ color: 'var(--text-muted)' }}>╌╌ true boundary</span>
        <span style={{ color: COLOR }}>▬ LIME surrogate</span>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        LIME ignores the whole wavy boundary. Near the instance (○) it fits <strong>one straight line</strong> to nearby perturbations, each weighted by proximity (bigger dot = higher weight). Widen the kernel and the surrogate captures more of the curve but explains the instance less faithfully — the core locality trade-off.
      </p>
    </div>
  )
}

function Slider({ label, v, set, min, max, step, color, int }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.3rem 0' }}>
      <span style={{ width: 92, color: 'var(--text-muted)' }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={v} onChange={e => set(+e.target.value)} style={{ flex: 1, accentColor: color }} />
      <strong style={{ color, width: 38, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{int ? v : v.toFixed(2)}</strong>
    </label>
  )
}
