import { useState } from 'react'
import { TRACK, dice, iou, diceFromIoU } from './tlUtils.js'
import { Accent, Row, Slider, Btn, Readout, Caption } from '../shared/ui.jsx'

const N = 12, CELL = 20

/** A blob-ish ground-truth mask: a disc, so the boundary is not axis-aligned. */
function disc(cx, cy, r, n = N) {
  return Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x) => ((x - cx) ** 2 + (y - cy) ** 2 <= r * r ? 1 : 0)))
}

const GT = disc(5.5, 5.5, 3.6)

const PRESETS = {
  'perfect':    { cx: 5.5, cy: 5.5, r: 3.6 },
  'shifted':    { cx: 7.0, cy: 6.5, r: 3.6 },
  'too small':  { cx: 5.5, cy: 5.5, r: 2.2 },
  'too big':    { cx: 5.5, cy: 5.5, r: 5.0 },
  'miss':       { cx: 9.5, cy: 9.5, r: 2.0 },
}

export default function DiceWidget() {
  const [p, setP] = useState(PRESETS.shifted)

  const PRED = disc(p.cx, p.cy, p.r)
  const d = dice(PRED, GT), j = iou(PRED, GT)
  const inter = PRED.flat().reduce((s, v, i) => s + v * GT.flat()[i], 0)
  const sp = PRED.flat().reduce((a, b) => a + b, 0)
  const sg = GT.flat().reduce((a, b) => a + b, 0)

  const cellColor = (r, c) => {
    const g = GT[r][c], q = PRED[r][c]
    if (g && q) return TRACK                        // true positive
    if (g && !q) return 'rgba(37,99,235,0.45)'      // false negative
    if (!g && q) return 'rgba(217,119,6,0.55)'      // false positive
    return 'rgba(128,128,128,0.08)'
  }

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.5rem' }}>
          <Slider label="x" value={p.cx} onChange={v => setP(s => ({ ...s, cx: v }))} min={0} max={11} step={0.5} width={90} />
          <Slider label="y" value={p.cy} onChange={v => setP(s => ({ ...s, cy: v }))} min={0} max={11} step={0.5} width={90} />
          <Slider label="radius" value={p.r} onChange={v => setP(s => ({ ...s, r: v }))} min={0.5} max={6} step={0.1} fmt={v => v.toFixed(1)} width={90} />
          {Object.keys(PRESETS).map(k => <Btn key={k} onClick={() => setP(PRESETS[k])}>{k}</Btn>)}
        </Row>

        <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <svg width={N * CELL} height={N * CELL} style={{ display: 'block', shapeRendering: 'crispEdges' }}>
              {Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (
                <rect key={`${r}-${c}`} x={c * CELL} y={r * CELL} width={CELL} height={CELL}
                  fill={cellColor(r, c)} stroke="rgba(128,128,128,0.2)" strokeWidth={0.5} />
              )))}
            </svg>
            <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.72rem', marginTop: 5, flexWrap: 'wrap' }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: TRACK, marginRight: 4 }} />TP {inter}</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'rgba(37,99,235,0.45)', marginRight: 4 }} />FN {sg - inter}</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'rgba(217,119,6,0.55)', marginRight: 4 }} />FP {sp - inter}</span>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', minWidth: 260 }}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.79rem', lineHeight: 1.95 }}>
              |P ∩ G| = {inter}<br />
              |P| = {sp} &nbsp; |G| = {sg}<br />
              <br />
              Dice = 2·{inter} / ({sp} + {sg}) = <strong style={{ color: TRACK, fontSize: '1.05rem' }}>{d.toFixed(4)}</strong><br />
              IoU &nbsp;= {inter} / {sp + sg - inter} = <strong>{j.toFixed(4)}</strong>
            </div>
            <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.7rem', borderRadius: 4,
                          background: 'var(--bg-hover, rgba(128,128,128,0.09))', fontSize: '0.77rem' }}>
              <strong>Dice = 2·IoU / (1 + IoU)</strong><br />
              <span style={{ fontFamily: 'monospace' }}>
                2·{j.toFixed(4)} / {(1 + j).toFixed(4)} = {diceFromIoU(j).toFixed(4)} ✓
              </span>
              <div style={{ opacity: 0.72, marginTop: 4 }}>
                They always rank identically — Dice is just kinder about the number it prints.
              </div>
            </div>
          </div>
        </div>

        <Readout items={[
          ['Dice', d.toFixed(4)],
          ['IoU', j.toFixed(4)],
          ['Dice − IoU', (d - j).toFixed(4)],
          ['precision', sp ? (inter / sp).toFixed(3) : '—'],
          ['recall', sg ? (inter / sg).toFixed(3) : '—'],
        ]} />

        <Caption>
          Dice is the F1 score of the pixels: <code>2TP / (2TP + FP + FN)</code>, the harmonic mean of precision
          and recall. It counts the intersection <strong>twice</strong> — once in each mask's area — which is why
          it always reads higher than IoU for the same prediction, and why quoting "Dice 0.85" next to someone
          else's "IoU 0.85" compares two different things (IoU 0.85 is Dice 0.919).
          <br /><br />
          Press <strong>miss</strong>: both scores go to exactly 0 and stay there, however far you drag. That flat
          region is why Dice is unusable as a raw loss on an empty prediction — the <em>soft</em> Dice used for
          training adds an epsilon to both numerator and denominator precisely so the gradient survives that case.
        </Caption>
      </div>
    </Accent>
  )
}
