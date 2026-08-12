import { useState } from 'react'
import { TRACK, l2, tripletLoss } from './tlUtils.js'
import { Accent, Row, Slider, Btn, Readout, Caption, svgPoint } from '../shared/ui.jsx'

const W = 330, H = 250

const PRESETS = {
  'easy (loss 0)':  { a: [165, 120], p: [200, 105], n: [70, 200] },
  'semi-hard':      { a: [165, 120], p: [215, 150], n: [110, 175] },
  'hard':           { a: [165, 120], p: [225, 160], n: [150, 145] },
  'violating':      { a: [165, 120], p: [255, 200], n: [172, 130] },
}

export default function TripletLossWidget() {
  const [pts, setPts] = useState(PRESETS['semi-hard'])
  const [margin, setMargin] = useState(40)
  const [drag, setDrag] = useState(null)

  const dp = l2(pts.a, pts.p), dn = l2(pts.a, pts.n)
  const loss = Math.max(0, dp - dn + margin)
  const regime = loss === 0 ? 'easy — no gradient'
    : dn > dp ? 'semi-hard — correct order, inside the margin'
    : 'hard — negative is closer than the positive'

  function onMove(e) {
    if (!drag) return
    const [x, y] = svgPoint(e)
    setPts(p => ({ ...p, [drag]: [Math.max(12, Math.min(W - 12, x)), Math.max(12, Math.min(H - 12, y))] }))
  }

  const NODES = [['a', 'anchor', '#111'], ['p', 'positive', TRACK], ['n', 'negative', '#2563eb']]

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.5rem' }}>
          <Slider label="margin" value={margin} onChange={setMargin} min={0} max={120} width={110} />
          {Object.keys(PRESETS).map(k => <Btn key={k} onClick={() => setPts(PRESETS[k])}>{k}</Btn>)}
        </Row>

        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <svg width={W} height={H} onPointerMove={onMove} onPointerUp={() => setDrag(null)}
            style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4,
                     touchAction: 'none', background: 'rgba(128,128,128,0.05)' }}>
            {/* the margin ring: the negative must sit outside it */}
            <circle cx={pts.a[0]} cy={pts.a[1]} r={dp} fill="none" stroke={TRACK} strokeWidth="1.2" strokeDasharray="4 3" />
            <circle cx={pts.a[0]} cy={pts.a[1]} r={dp + margin} fill="rgba(159,18,57,0.08)"
              stroke="#dc2626" strokeWidth="1.2" strokeDasharray="4 3" />
            <line x1={pts.a[0]} y1={pts.a[1]} x2={pts.p[0]} y2={pts.p[1]} stroke={TRACK} strokeWidth="2" />
            <line x1={pts.a[0]} y1={pts.a[1]} x2={pts.n[0]} y2={pts.n[1]} stroke="#2563eb" strokeWidth="2" />
            {NODES.map(([key, label, col]) => (
              <g key={key} onPointerDown={() => setDrag(key)} style={{ cursor: 'grab' }}>
                <circle cx={pts[key][0]} cy={pts[key][1]} r="9" fill={col} stroke="#fff" strokeWidth="2" />
                <text x={pts[key][0] + 12} y={pts[key][1] + 4} fontSize="10" fill={col} fontWeight="700">{label}</text>
              </g>
            ))}
            <text x={8} y={H - 8} fontSize="9" fill="var(--text-muted,#999)">
              red ring = d(a,p) + margin — the negative must be outside it
            </text>
          </svg>

          <div style={{ fontSize: '0.8rem', minWidth: 240 }}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 2 }}>
              d(a, p) = {dp.toFixed(1)}<br />
              d(a, n) = {dn.toFixed(1)}<br />
              margin &nbsp;= {margin}<br />
              <span style={{ opacity: 0.7 }}>L = max(0, d(a,p) − d(a,n) + m)</span><br />
              L = max(0, {dp.toFixed(1)} − {dn.toFixed(1)} + {margin}) = <strong style={{ color: loss > 0 ? '#dc2626' : TRACK, fontSize: '1.05rem' }}>{loss.toFixed(1)}</strong>
            </div>
            <div style={{ marginTop: '0.5rem', padding: '0.45rem 0.6rem', borderRadius: 4,
                          background: 'var(--bg-hover,rgba(128,128,128,0.09))', fontSize: '0.77rem' }}>
              <strong>{regime}</strong>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.5rem', lineHeight: 1.6 }}>
              A triplet with zero loss contributes <em>nothing</em> to the update. Once the model is decent, most
              randomly-sampled triplets are easy, so the average gradient goes to zero and training stalls — which
              is why triplet training needs <strong>mining</strong>, not just sampling.
            </p>
          </div>
        </div>

        <Readout items={[
          ['d(a,p)', dp.toFixed(2)], ['d(a,n)', dn.toFixed(2)],
          ['loss', loss.toFixed(2)],
          ['gradient', loss > 0 ? 'flows' : 'zero — triplet wasted'],
        ]} />

        <Caption>
          Drag the <strong>negative</strong> far away: the loss hits 0 and stays there however much further you
          drag. That flat region is the whole difficulty of metric learning — the loss stops caring once it is
          satisfied, which is correct behaviour and terrible for batch efficiency. Set the margin to 0 and even
          a barely-correct ordering scores 0, so the embedding never gets pushed to <em>separate</em> the classes,
          only to order them.
        </Caption>
      </div>
    </Accent>
  )
}
