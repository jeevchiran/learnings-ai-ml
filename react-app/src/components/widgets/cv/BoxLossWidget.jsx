import { useState } from 'react'
import { TRACK, l1Loss, l2Loss, smoothL1 } from './cvUtils.js'
import { Row, Slider, Toggle, Readout, Caption } from './cvUi.jsx'

const W = 360, H = 190, XMAX = 6, YMAX = 12

const CURVES = [
  { key: 'l2', name: 'L2  ½x²', color: '#dc2626', f: l2Loss, d: x => x },
  { key: 'sl1', name: 'smooth L1', color: TRACK, f: (x, b) => smoothL1(x, b), d: (x, b) => (Math.abs(x) < b ? x / b : Math.sign(x)) },
  { key: 'l1', name: 'L1  |x|', color: '#2563eb', f: l1Loss, d: x => Math.sign(x) },
]

export default function BoxLossWidget() {
  const [beta, setBeta] = useState(1)
  const [err, setErr] = useState(2.5)
  const [showGrad, setShowGrad] = useState(false)

  const sx = x => (x / XMAX) * (W - 30) + 25
  const sy = y => H - 22 - (Math.min(y, YMAX) / YMAX) * (H - 40)

  const path = (fn) => {
    const pts = []
    for (let i = 0; i <= 120; i++) {
      const x = (i / 120) * XMAX
      pts.push(`${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(Math.abs(fn(x, beta))).toFixed(1)}`)
    }
    return pts.join(' ')
  }

  return (
    <div>
      <Row style={{ marginBottom: '0.5rem' }}>
        <Slider label="β (transition)" value={beta} onChange={setBeta} min={0.2} max={3} step={0.1} fmt={v => v.toFixed(1)} />
        <Slider label="error x" value={err} onChange={setErr} min={0} max={6} step={0.1} fmt={v => v.toFixed(1)} />
        <Toggle label="show gradient instead" on={showGrad} onChange={setShowGrad} />
      </Row>

      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4 }}>
          <line x1={25} y1={H - 22} x2={W - 5} y2={H - 22} stroke="var(--border,#ccc)" />
          <line x1={25} y1={12} x2={25} y2={H - 22} stroke="var(--border,#ccc)" />
          <text x={W - 42} y={H - 7} fontSize="10" fill="var(--text-muted,#999)">|error|</text>
          <text x={2} y={18} fontSize="10" fill="var(--text-muted,#999)">{showGrad ? '|∂L|' : 'L'}</text>

          {/* β marker */}
          <line x1={sx(beta)} y1={12} x2={sx(beta)} y2={H - 22} stroke={TRACK} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <text x={sx(beta) + 3} y={22} fontSize="10" fill={TRACK}>β={beta.toFixed(1)}</text>

          {CURVES.map(c => (
            <path key={c.key} d={path(showGrad ? c.d : c.f)} fill="none" stroke={c.color} strokeWidth="2.2" />
          ))}

          <line x1={sx(err)} y1={12} x2={sx(err)} y2={H - 22} stroke="var(--text,#666)" strokeWidth="1" opacity="0.45" />
          {CURVES.map(c => {
            const yv = Math.abs((showGrad ? c.d : c.f)(err, beta))
            return <circle key={c.key} cx={sx(err)} cy={sy(yv)} r="4" fill={c.color} />
          })}
        </svg>

        <div style={{ fontSize: '0.8rem', minWidth: 250 }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.79rem' }}>
            <thead>
              <tr style={{ opacity: 0.7 }}>
                <th style={{ textAlign: 'left', padding: '2px 12px 4px 0' }}>at x={err.toFixed(1)}</th>
                <th style={{ textAlign: 'right', padding: '2px 12px 4px 0' }}>loss</th>
                <th style={{ textAlign: 'right', padding: '2px 0 4px' }}>|gradient|</th>
              </tr>
            </thead>
            <tbody>
              {CURVES.map(c => (
                <tr key={c.key}>
                  <td style={{ color: c.color, fontWeight: 700, padding: '2px 12px 2px 0' }}>{c.name}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', padding: '2px 12px 2px 0' }}>{c.f(err, beta).toFixed(3)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{Math.abs(c.d(err, beta)).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ fontSize: '0.76rem', opacity: 0.78, marginTop: '0.55rem', lineHeight: 1.65 }}>
            Push <strong>error</strong> past 4 — a mislabelled box or a wild early prediction. L2's
            gradient grows with the error, so one outlier can dominate the whole batch update. Smooth
            L1 caps its gradient at 1, and unlike plain L1 it is still differentiable and gentle at 0,
            so the box can settle instead of oscillating.
          </p>
        </div>
      </div>

      <Readout items={[
        ['transition β', beta.toFixed(1)],
        ['L2 / smoothL1 ratio', (l2Loss(err) / Math.max(1e-9, smoothL1(err, beta))).toFixed(2) + '×'],
        ['smoothL1 regime', err < beta ? 'quadratic (x²/2β)' : 'linear (x − β/2)'],
      ]} />

      <Caption>
        This is the <em>localisation</em> half of the detection loss. The full objective adds an
        objectness/class term and multiplies this one by a weight λ, so the two halves have to be
        commensurable — which is why boxes are regressed as <strong>normalised offsets</strong>, not raw
        pixels: a 40-pixel error on a 1024-wide image must not out-shout a cross-entropy term.
      </Caption>
    </div>
  )
}
