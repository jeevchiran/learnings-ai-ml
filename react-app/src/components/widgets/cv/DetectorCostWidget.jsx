import { useState } from 'react'
import { TRACK } from './cvUtils.js'
import { Row, Slider, Readout, Caption } from './cvUi.jsx'

/* Why sliding windows were abandoned, in arithmetic. Naive detection re-runs a
 * classifier on every crop; a fully-convolutional net computes all of them in
 * one pass because neighbouring windows share almost all of their receptive
 * field. The saving is exactly the overlap. */
export default function DetectorCostWidget() {
  const [size, setSize] = useState(512)
  const [win, setWin] = useState(64)
  const [stride, setStride] = useState(8)
  const [scales, setScales] = useState(4)

  const perScale = []
  let img = size
  for (let i = 0; i < scales; i++) {
    const n = Math.max(0, Math.floor((img - win) / stride) + 1)
    perScale.push({ level: i, img: Math.round(img), n: n * n })
    img /= 1.5
  }
  const windows = perScale.reduce((s, p) => s + p.n, 0)
  const areaRatio = (win * win) / (size * size)
  const fcnEquivalent = 1 / areaRatio            // one pass costs this many window-forwards
  const speedup = windows / (fcnEquivalent * scales)
  const maxN = Math.max(...perScale.map(p => p.n))

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        <Slider label="image" value={size} onChange={setSize} min={256} max={1024} step={64} fmt={v => `${v}px`} />
        <Slider label="window" value={win} onChange={setWin} min={32} max={160} step={16} fmt={v => `${v}px`} />
        <Slider label="stride" value={stride} onChange={setStride} min={2} max={32} step={2} />
        <Slider label="pyramid levels" value={scales} onChange={setScales} min={1} max={6} width={90} />
      </Row>

      <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '0.79rem' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>windows per pyramid level</div>
          {perScale.map(p => (
            <div key={p.level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 3 }}>
              <span style={{ width: 62, fontFamily: 'monospace', opacity: 0.7 }}>{p.img}px</span>
              <span style={{ width: 150, height: 11, background: 'var(--bg-hover,#eee)', borderRadius: 3, overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${(p.n / maxN) * 100}%`, height: '100%', background: TRACK }} />
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{p.n.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ marginTop: '0.4rem', fontFamily: 'monospace', fontSize: '0.78rem' }}>
            total = <strong style={{ color: TRACK }}>{windows.toLocaleString()}</strong> crops
          </div>
        </div>

        <div style={{ fontSize: '0.79rem', minWidth: 280 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>cost, in units of "one window forward pass"</div>
          {[
            { name: 'crop-and-classify (naive)', cost: windows, col: '#dc2626' },
            { name: 'fully convolutional', cost: fcnEquivalent * scales, col: TRACK },
          ].map(r => (
            <div key={r.name} style={{ marginBottom: '0.45rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{r.name}</span>
                <strong style={{ fontFamily: 'monospace', color: r.col }}>{Math.round(r.cost).toLocaleString()}</strong>
              </div>
              <div style={{ height: 9, background: 'var(--bg-hover,#eee)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${(r.cost / windows) * 100}%`, height: '100%', background: r.col }} />
              </div>
            </div>
          ))}
          <p style={{ fontSize: '0.75rem', opacity: 0.75, lineHeight: 1.65, marginTop: '0.4rem' }}>
            A conv layer costs roughly its input area, so one pass over the whole image costs
            <code> {size}²/{win}² = {Math.round(fcnEquivalent)}</code> window-forwards — and it emits a
            <em> map</em> of scores, one per window position, all at once. Neighbouring windows overlap
            by {(100 * (1 - stride / win)).toFixed(0)}% at this stride; the FCN computes that shared
            work once.
          </p>
        </div>
      </div>

      <Readout items={[
        ['crops', windows.toLocaleString()],
        ['FCN passes', scales],
        ['speed-up', `${speedup.toFixed(1)}×`],
        ['window overlap', `${(100 * (1 - stride / win)).toFixed(0)}%`],
        ['output stride', stride],
      ]} />

      <Caption>
        Halve the stride and the crop count <em>quadruples</em> while the FCN cost does not move at all —
        that asymmetry is the entire reason detection moved to dense feature maps. But notice the
        remaining problem: even at 4 pyramid levels you are still betting that some window happens to
        fit the object. Region proposals (R-CNN) and anchors (Faster R-CNN, YOLO, SSD) are two different
        answers to that leftover bet.
      </Caption>
    </div>
  )
}
