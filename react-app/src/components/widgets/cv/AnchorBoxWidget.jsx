import { useMemo, useState } from 'react'
import { TRACK, lcg, anchorKMeans, shapeIoU } from './cvUtils.js'
import { Row, Slider, Toggle, Readout, Caption } from './cvUi.jsx'

/* A synthetic annotation set with the shape structure real datasets have:
 * upright people, wide vehicles, small square signs. Deterministic. */
function makeBoxes() {
  const rnd = lcg(23)
  const groups = [
    { n: 26, w: 0.11, h: 0.34, s: 0.035 },   // pedestrians — tall and thin
    { n: 24, w: 0.40, h: 0.20, s: 0.075 },   // vehicles — wide
    { n: 18, w: 0.09, h: 0.09, s: 0.025 },   // signs — small squares
  ]
  const out = []
  for (const g of groups) {
    for (let i = 0; i < g.n; i++) {
      out.push({
        w: Math.max(0.02, g.w + (rnd() - 0.5) * 2 * g.s),
        h: Math.max(0.02, g.h + (rnd() - 0.5) * 2 * g.s),
      })
    }
  }
  return out
}

const W = 270, H = 230
const PALETTE = [TRACK, '#2563eb', '#dc2626', '#f59e0b', '#7c3aed', '#0891b2', '#be185d', '#65a30d', '#0f766e']

export default function AnchorBoxWidget() {
  const boxes = useMemo(makeBoxes, [])
  const [k, setK] = useState(3)
  const [showRatios, setShowRatios] = useState(false)

  const { anchors, assign, meanIoU } = anchorKMeans(boxes, k)
  const sweep = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ k: i + 1, iou: anchorKMeans(boxes, i + 1).meanIoU })),
    [boxes],
  )
  const maxDim = 0.55
  const sx = v => 34 + (v / maxDim) * (W - 46)
  const sy = v => H - 26 - (v / maxDim) * (H - 40)

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        <Slider label="k (anchors)" value={k} onChange={setK} min={1} max={9} width={110} />
        <Toggle label="show aspect ratios" on={showRatios} onChange={setShowRatios} />
        <span style={{ fontSize: '0.78rem', opacity: 0.72 }}>{boxes.length} ground-truth boxes</span>
      </Row>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>box shapes (w, h), normalised</div>
          <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4 }}>
            <line x1={34} y1={H - 26} x2={W - 6} y2={H - 26} stroke="var(--border,#ccc)" />
            <line x1={34} y1={12} x2={34} y2={H - 26} stroke="var(--border,#ccc)" />
            <text x={W - 34} y={H - 10} fontSize="10" fill="var(--text-muted,#999)">width</text>
            <text x={2} y={20} fontSize="10" fill="var(--text-muted,#999)">height</text>
            <line x1={sx(0)} y1={sy(0)} x2={sx(maxDim)} y2={sy(maxDim)} stroke="rgba(128,128,128,0.4)" strokeDasharray="3 3" />
            <text x={sx(maxDim) - 40} y={sy(maxDim) + 12} fontSize="9" fill="var(--text-muted,#999)">square</text>
            {boxes.map((b, i) => (
              <circle key={i} cx={sx(b.w)} cy={sy(b.h)} r="3.2" fill={PALETTE[assign[i] % PALETTE.length]} opacity="0.65" />
            ))}
            {anchors.map((a, j) => (
              <g key={j}>
                <rect x={sx(a.w) - 6} y={sy(a.h) - 6} width={12} height={12} fill="none"
                  stroke={PALETTE[j % PALETTE.length]} strokeWidth="2.5" />
                <text x={sx(a.w) + 9} y={sy(a.h) + 4} fontSize="9" fontWeight="700" fill={PALETTE[j % PALETTE.length]}>a{j + 1}</text>
              </g>
            ))}
          </svg>
        </div>

        <div style={{ fontSize: '0.78rem', minWidth: 250 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>learned anchors</div>
          <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '0.75rem' }}>
            <thead><tr style={{ opacity: 0.65 }}>
              <th style={{ padding: '2px 9px', textAlign: 'left' }}>#</th>
              <th style={{ padding: '2px 9px', textAlign: 'right' }}>w</th>
              <th style={{ padding: '2px 9px', textAlign: 'right' }}>h</th>
              {showRatios && <th style={{ padding: '2px 9px', textAlign: 'right' }}>w:h</th>}
              <th style={{ padding: '2px 9px', textAlign: 'right' }}>members</th>
            </tr></thead>
            <tbody>
              {anchors.map((a, j) => (
                <tr key={j}>
                  <td style={{ padding: '2px 9px', color: PALETTE[j % PALETTE.length], fontWeight: 700 }}>a{j + 1}</td>
                  <td style={{ padding: '2px 9px', textAlign: 'right' }}>{a.w.toFixed(3)}</td>
                  <td style={{ padding: '2px 9px', textAlign: 'right' }}>{a.h.toFixed(3)}</td>
                  {showRatios && <td style={{ padding: '2px 9px', textAlign: 'right' }}>{(a.w / a.h).toFixed(2)}</td>}
                  <td style={{ padding: '2px 9px', textAlign: 'right' }}>{assign.filter(x => x === j).length}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontWeight: 700, margin: '0.7rem 0 4px' }}>mean IoU vs k</div>
          <svg width={230} height={78} style={{ display: 'block' }}>
            <path d={sweep.map((s, i) => `${i ? 'L' : 'M'}${18 + (s.k - 1) * 24},${70 - s.iou * 60}`).join(' ')}
              fill="none" stroke={TRACK} strokeWidth="2" />
            {sweep.map(s => (
              <circle key={s.k} cx={18 + (s.k - 1) * 24} cy={70 - s.iou * 60} r={s.k === k ? 4.5 : 2.5}
                fill={s.k === k ? TRACK : 'var(--text-muted,#999)'} />
            ))}
            <text x={0} y={14} fontSize="9" fill="var(--text-muted,#999)">1.0</text>
            <text x={0} y={70} fontSize="9" fill="var(--text-muted,#999)">0</text>
          </svg>
          <p style={{ fontSize: '0.74rem', opacity: 0.72, lineHeight: 1.6 }}>
            The curve knees where k matches the number of real shape families. Past that you buy
            almost no IoU and pay linearly in predictions and memory.
          </p>
        </div>
      </div>

      <Readout items={[
        ['k', k],
        ['mean IoU(box, its anchor)', meanIoU.toFixed(4)],
        ['gain over k−1', k > 1 ? `+${((meanIoU - sweep[k - 2].iou) * 100).toFixed(2)} pts` : '—'],
        ['best single box', sweep[0].iou.toFixed(4)],
        ['distance', 'd = 1 − IoU (not Euclidean)'],
      ]} />

      <Caption>
        Anchors are <strong>priors on shape</strong>: instead of regressing a box from nothing, the network
        picks an anchor and predicts a small correction to it — an easier, better-conditioned target.
        The distance here is <code>1 − IoU</code>, not Euclidean, precisely because Euclidean k-means
        would let large boxes dominate the error. Push k to 9 and you have the YOLO v3 anchor set;
        the mean-IoU curve shows exactly what that last anchor bought you.
      </Caption>
    </div>
  )
}
