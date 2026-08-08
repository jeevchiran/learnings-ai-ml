import { useState } from 'react'
import { TRACK, prCurve } from './cvUtils.js'
import { Row, Slider, Readout, Caption } from './cvUi.jsx'

const INITIAL = [
  { score: 0.95, tp: true }, { score: 0.91, tp: true }, { score: 0.88, tp: false },
  { score: 0.80, tp: true }, { score: 0.74, tp: false }, { score: 0.68, tp: true },
  { score: 0.55, tp: false }, { score: 0.41, tp: false },
]

const W = 250, H = 190

export default function DetectionMetricWidget() {
  const [dets, setDets] = useState(INITIAL)
  const [nGT, setNGT] = useState(5)

  const { points, envelope, ap } = prCurve(dets, nGT)
  const sx = r => 34 + r * (W - 48)
  const sy = p => H - 28 - p * (H - 48)
  const toggle = i => setDets(d => d.map((x, j) => (j === i ? { ...x, tp: !x.tp } : x)))

  const nTP = dets.filter(d => d.tp).length
  const stair = envelope.map((p, i) => {
    const prev = i ? envelope[i - 1] : { recall: 0, precision: p.precision }
    return `L${sx(prev.recall).toFixed(1)},${sy(p.precision).toFixed(1)} L${sx(p.recall).toFixed(1)},${sy(p.precision).toFixed(1)}`
  }).join(' ')

  return (
    <div>
      <Row style={{ marginBottom: '0.5rem' }}>
        <Slider label="ground-truth objects" value={nGT} onChange={setNGT} min={3} max={8} width={110} />
        <span style={{ fontSize: '0.79rem', opacity: 0.75 }}>click a row to flip TP ⇄ FP</span>
      </Row>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '0.78rem' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>detections, sorted by score</div>
          <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ opacity: 0.65 }}>
                {['#', 'score', 'TP?', 'ΣTP', 'prec', 'rec'].map(h => (
                  <th key={h} style={{ padding: '2px 8px', textAlign: 'right' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.map((p, i) => (
                <tr key={i} onClick={() => toggle(i)} style={{ cursor: 'pointer', background: p.tp ? 'rgba(21,128,61,0.10)' : 'transparent' }}>
                  <td style={{ padding: '2px 8px', textAlign: 'right', opacity: 0.6 }}>{i + 1}</td>
                  <td style={{ padding: '2px 8px', textAlign: 'right' }}>{p.score.toFixed(2)}</td>
                  <td style={{ padding: '2px 8px', textAlign: 'right', fontWeight: 700, color: p.tp ? TRACK : '#dc2626' }}>{p.tp ? 'TP' : 'FP'}</td>
                  <td style={{ padding: '2px 8px', textAlign: 'right' }}>{points.slice(0, i + 1).filter(q => q.tp).length}</td>
                  <td style={{ padding: '2px 8px', textAlign: 'right' }}>{p.precision.toFixed(3)}</td>
                  <td style={{ padding: '2px 8px', textAlign: 'right' }}>{p.recall.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4 }}>
            <line x1={34} y1={H - 28} x2={W - 8} y2={H - 28} stroke="var(--border,#ccc)" />
            <line x1={34} y1={14} x2={34} y2={H - 28} stroke="var(--border,#ccc)" />
            <text x={W / 2 - 14} y={H - 8} fontSize="10" fill="var(--text-muted,#999)">recall</text>
            <text x={2} y={22} fontSize="10" fill="var(--text-muted,#999)">prec</text>
            {[0, 0.5, 1].map(t => (
              <g key={t}>
                <text x={sx(t) - 7} y={H - 16} fontSize="9" fill="var(--text-muted,#999)">{t}</text>
                <text x={16} y={sy(t) + 3} fontSize="9" fill="var(--text-muted,#999)">{t}</text>
              </g>
            ))}
            <path d={`M${sx(0)},${sy(envelope[0]?.precision ?? 0)} ${stair} L${sx(envelope[envelope.length - 1]?.recall ?? 0)},${sy(0)} L${sx(0)},${sy(0)} Z`}
              fill={`${TRACK}22`} />
            <path d={`M${sx(0)},${sy(envelope[0]?.precision ?? 0)} ${stair}`} fill="none" stroke={TRACK} strokeWidth="2" />
            {points.map((p, i) => (
              <circle key={i} cx={sx(p.recall)} cy={sy(p.precision)} r="3.2" fill={p.tp ? TRACK : '#dc2626'} />
            ))}
          </svg>
          <div style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: 4 }}>
            AP = area under the staircase = <strong style={{ color: TRACK, fontSize: '1.05rem' }}>{ap.toFixed(4)}</strong>
          </div>
        </div>
      </div>

      <Readout items={[
        ['detections', dets.length], ['TP', nTP], ['FP', dets.length - nTP],
        ['missed (FN)', Math.max(0, nGT - nTP)],
        ['max recall', (Math.min(nTP, nGT) / nGT).toFixed(3)],
        ['AP', ap.toFixed(4)],
      ]} />

      <Caption>
        Recall can only rise and precision only wobbles, because the list is walked top-down: each new
        detection either adds a hit or spends precision. Push <strong>ground-truth objects</strong> to 8
        while keeping {nTP} true positives — AP collapses even though the detector output did not change,
        because recall is now capped at {(Math.min(nTP, 8) / 8).toFixed(2)}. <strong>mAP</strong> is this
        number averaged over classes (and, for COCO, over IoU thresholds 0.50:0.05:0.95).
      </Caption>
    </div>
  )
}
