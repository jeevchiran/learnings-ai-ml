import { useState } from 'react'
import { TRACK, softDice, bce, pixelAccuracy } from './tlUtils.js'
import { Accent, Row, Slider, Readout, Caption } from '../shared/ui.jsx'

const N = 24

/** A ground truth with a controllable foreground fraction — the whole point is
 *  what happens when that fraction gets small. */
function makeGT(fgPct) {
  const r = Math.sqrt((fgPct / 100) * N * N / Math.PI)
  return Array.from({ length: N }, (_, y) =>
    Array.from({ length: N }, (_, x) => (((x - N / 2) ** 2 + (y - N / 2) ** 2) <= r * r ? 1 : 0)))
}

export default function SegLossWidget() {
  const [fgPct, setFgPct] = useState(4)
  const [conf, setConf] = useState(0.15)

  const gt = makeGT(fgPct)
  const actualFg = gt.flat().reduce((a, b) => a + b, 0) / (N * N)

  // Two candidate predictions: "predict background everywhere" vs a real attempt.
  const allBg = gt.map(row => row.map(() => 0.01))
  const attempt = gt.map(row => row.map(v => (v ? 0.5 + conf : 0.5 - conf)))

  const rows = [
    { name: 'predict all background', pred: allBg },
    { name: 'a real attempt', pred: attempt },
  ].map(r => ({
    ...r,
    bce: bce(r.pred, gt),
    dice: softDice(r.pred, gt),
    diceLoss: 1 - softDice(r.pred, gt),
    acc: pixelAccuracy(r.pred, gt),
  }))

  const cheatWins = rows[0].bce < rows[1].bce

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          <Slider label="foreground %" value={fgPct} onChange={setFgPct} min={1} max={50} width={130} />
          <Slider label="attempt confidence" value={conf} onChange={setConf} min={0.05} max={0.49} step={0.01}
            fmt={v => v.toFixed(2)} width={120} />
        </Row>

        <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>
              ground truth — {(actualFg * 100).toFixed(1)}% foreground
            </div>
            <svg width={N * 7} height={N * 7} style={{ display: 'block', shapeRendering: 'crispEdges' }}>
              {gt.map((row, r) => row.map((v, c) => (
                <rect key={`${r}-${c}`} x={c * 7} y={r * 7} width={7} height={7}
                  fill={v ? TRACK : 'rgba(128,128,128,0.10)'} />
              )))}
            </svg>
          </div>

          <div style={{ fontSize: '0.79rem', minWidth: 340 }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '0.77rem', width: '100%' }}>
              <thead><tr style={{ opacity: 0.65 }}>
                <th style={{ textAlign: 'left', padding: '3px 8px 5px 0' }}>prediction</th>
                <th style={{ textAlign: 'right', padding: '3px 8px 5px' }}>pixel acc</th>
                <th style={{ textAlign: 'right', padding: '3px 8px 5px' }}>BCE ↓</th>
                <th style={{ textAlign: 'right', padding: '3px 0 5px' }}>Dice loss ↓</th>
              </tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.name}>
                    <td style={{ padding: '3px 8px 3px 0' }}>{r.name}</td>
                    <td style={{ padding: '3px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{(r.acc * 100).toFixed(1)}%</td>
                    <td style={{ padding: '3px 8px', textAlign: 'right', fontFamily: 'monospace',
                                 color: r.bce === Math.min(...rows.map(x => x.bce)) ? TRACK : 'inherit',
                                 fontWeight: r.bce === Math.min(...rows.map(x => x.bce)) ? 700 : 400 }}>
                      {r.bce.toFixed(4)}</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontFamily: 'monospace',
                                 color: r.diceLoss === Math.min(...rows.map(x => x.diceLoss)) ? TRACK : 'inherit',
                                 fontWeight: r.diceLoss === Math.min(...rows.map(x => x.diceLoss)) ? 700 : 400 }}>
                      {r.diceLoss.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '0.7rem', padding: '0.55rem 0.7rem', borderRadius: 4,
                          background: cheatWins ? 'rgba(220,38,38,0.10)' : 'var(--bg-hover, rgba(128,128,128,0.09))',
                          fontSize: '0.77rem', lineHeight: 1.6 }}>
              {cheatWins
                ? <><strong style={{ color: '#dc2626' }}>BCE prefers the cheat.</strong> Predicting background
                    everywhere scores {(rows[0].acc * 100).toFixed(1)}% pixel accuracy and a lower BCE than
                    genuinely trying — so a model trained on BCE alone will collapse to an empty mask.</>
                : <>At this foreground fraction BCE still prefers the real attempt. Drag the foreground below
                    ~10% and watch it flip.</>}
              <br /><br />
              <strong>Dice loss never prefers the cheat</strong>: an empty prediction has zero intersection, so
              its Dice is ~0 and its loss ~1, regardless of how much background it got right.
            </div>
          </div>
        </div>

        <Readout items={[
          ['foreground', `${(actualFg * 100).toFixed(1)}%`],
          ['background', `${((1 - actualFg) * 100).toFixed(1)}%`],
          ['imbalance', `1 : ${((1 - actualFg) / Math.max(actualFg, 1e-9)).toFixed(0)}`],
          ['BCE picks', cheatWins ? 'the empty mask ✗' : 'the real attempt ✓'],
          ['Dice picks', 'the real attempt ✓'],
        ]} />

        <Caption>
          This is the argument for Dice in one table. Cross-entropy averages over <em>pixels</em>, so when 96% of
          them are background it is dominated by the easy class and the fastest way to lower it is to predict
          nothing. Dice is a <em>set overlap</em> — it has no background term at all, so an empty mask scores 0
          however large the image is.
          <br /><br />
          In practice you use both: <code>L = BCE + (1 − Dice)</code>. BCE gives well-behaved per-pixel gradients
          early in training when Dice is nearly flat, and Dice supplies the shape objective that stops the
          collapse. Focal loss attacks the same imbalance from the cross-entropy side instead.
        </Caption>
      </div>
    </Accent>
  )
}
