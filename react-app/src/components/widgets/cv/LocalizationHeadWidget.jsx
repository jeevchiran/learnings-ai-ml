import { useState } from 'react'
import { TRACK, smoothL1, iou } from './cvUtils.js'
import { Row, Slider, Toggle, Select, Readout, Caption } from './cvUi.jsx'

const CW = 250, CH = 190
const CLASSES = ['cat', 'dog', 'bird']
const GT = { x: 78, y: 52, w: 96, h: 104 }
const GT_CLASS = 1        // dog

/* One image, one object: the localisation head emits
 *   y = [p_obj, bx, by, bw, bh, c1..cC]
 * and the loss masks the box and class terms whenever the target p_obj = 0.
 * That mask is the whole trick — grid cells with no object must not be asked
 * to regress a box that does not exist. */
export default function LocalizationHeadWidget() {
  const [present, setPresent] = useState(true)
  const [pred, setPred] = useState({ x: 96, y: 68, w: 88, h: 96 })
  const [pObj, setPObj] = useState(0.82)
  const [predClass, setPredClass] = useState('dog')
  const [lambda, setLambda] = useState(5)

  const nb = b => [b.x / CW, b.y / CH, b.w / CW, b.h / CH]
  const [gx, gy, gw, gh] = nb(GT)
  const [px, py, pw, ph] = nb(pred)

  const boxTerms = [['bx', px, gx], ['by', py, gy], ['bw', pw, gw], ['bh', ph, gh]]
  const lBox = boxTerms.reduce((s, [, p, g]) => s + smoothL1(p - g, 1), 0)
  const clsIdx = CLASSES.indexOf(predClass)
  // one-hot target vs a soft prediction: 0.7 on the picked class, rest split
  const probs = CLASSES.map((_, i) => (i === clsIdx ? 0.70 : 0.15))
  const lCls = -Math.log(probs[GT_CLASS])
  const target = present ? 1 : 0
  const lObj = -(target * Math.log(Math.max(1e-9, pObj)) + (1 - target) * Math.log(Math.max(1e-9, 1 - pObj)))
  const total = lObj + (present ? lambda * lBox + lCls : 0)
  const ov = iou(GT, pred)

  const vec = present
    ? [1, gx.toFixed(2), gy.toFixed(2), gw.toFixed(2), gh.toFixed(2), ...CLASSES.map((_, i) => (i === GT_CLASS ? 1 : 0))]
    : [0, '?', '?', '?', '?', '?', '?', '?']

  return (
    <div>
      <Row style={{ marginBottom: '0.5rem' }}>
        <Toggle label="object present in this region" on={present} onChange={setPresent} />
        <Slider label="predicted p_obj" value={pObj} onChange={setPObj} min={0.01} max={0.99} step={0.01} fmt={v => v.toFixed(2)} />
        <Select label="predicted class" value={predClass} onChange={setPredClass} options={CLASSES} />
        <Slider label="λ_coord" value={lambda} onChange={setLambda} min={0} max={10} step={0.5} fmt={v => v.toFixed(1)} width={90} />
      </Row>
      <Row style={{ marginBottom: '0.6rem' }}>
        <Slider label="box x" value={pred.x} onChange={v => setPred(p => ({ ...p, x: v }))} min={0} max={CW - 40} width={90} />
        <Slider label="box y" value={pred.y} onChange={v => setPred(p => ({ ...p, y: v }))} min={0} max={CH - 40} width={90} />
        <Slider label="box w" value={pred.w} onChange={v => setPred(p => ({ ...p, w: v }))} min={20} max={CW} width={90} />
        <Slider label="box h" value={pred.h} onChange={v => setPred(p => ({ ...p, h: v }))} min={20} max={CH} width={90} />
      </Row>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <svg width={CW} height={CH} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4, background: 'rgba(128,128,128,0.06)' }}>
          {present && <>
            <ellipse cx={126} cy={116} rx={38} ry={44} fill="rgba(128,128,128,0.35)" />
            <circle cx={126} cy={72} r={22} fill="rgba(128,128,128,0.35)" />
            <rect x={GT.x} y={GT.y} width={GT.w} height={GT.h} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="6 4" />
            <text x={GT.x} y={GT.y - 5} fontSize="10" fill="#2563eb" fontWeight="700">target ({CLASSES[GT_CLASS]})</text>
          </>}
          {!present && <text x={CW / 2} y={CH / 2} textAnchor="middle" fontSize="12" fill="var(--text-muted,#999)">background — no object</text>}
          <rect x={pred.x} y={pred.y} width={pred.w} height={pred.h} fill={`${TRACK}18`} stroke={TRACK} strokeWidth="2.5" />
          <text x={pred.x + 3} y={pred.y + 13} fontSize="10" fill={TRACK} fontWeight="700">
            pred {predClass} {pObj.toFixed(2)}
          </text>
        </svg>

        <div style={{ fontSize: '0.79rem', minWidth: 300 }}>
          <div style={{ fontWeight: 700, marginBottom: 3 }}>target vector y</div>
          <div style={{ display: 'flex', gap: 2, marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            {['p_obj', 'bx', 'by', 'bw', 'bh', ...CLASSES].map((lbl, i) => (
              <div key={lbl} style={{
                border: '1px solid var(--border,#d4d4d8)', borderRadius: 3, padding: '2px 5px',
                fontFamily: 'monospace', fontSize: '0.7rem', textAlign: 'center', minWidth: 40,
                opacity: !present && i > 0 ? 0.35 : 1,
                background: i === 0 ? `${TRACK}22` : 'transparent',
              }}>
                <div style={{ opacity: 0.6, fontSize: '0.62rem' }}>{lbl}</div>
                <strong>{vec[i]}</strong>
              </div>
            ))}
          </div>

          <table style={{ borderCollapse: 'collapse', fontSize: '0.77rem', width: '100%' }}>
            <tbody>
              {[
                ['objectness  BCE(p_obj, ' + target + ')', lObj, true],
                [`box  λ·Σ smoothL1  (λ=${lambda})`, lambda * lBox, present],
                ['class  cross-entropy', lCls, present],
              ].map(([lbl, v, on]) => (
                <tr key={lbl} style={{ opacity: on ? 1 : 0.35 }}>
                  <td style={{ padding: '3px 10px 3px 0' }}>{lbl}</td>
                  <td style={{ padding: '3px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                    {on ? v.toFixed(4) : '— masked out'}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--border,#ccc)' }}>
                <td style={{ padding: '4px 10px 0 0', fontWeight: 700 }}>total</td>
                <td style={{ padding: '4px 0 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: TRACK }}>
                  {total.toFixed(4)}
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: '0.74rem', opacity: 0.74, marginTop: '0.5rem', lineHeight: 1.6 }}>
            L = L_obj + <strong>1[object]</strong>·(λ·L_box + L_cls). Flip the toggle: the box and class
            rows go dark. There is no "correct box" for background, so asking for one would train the
            network on noise.
          </p>
        </div>
      </div>

      <Readout items={[
        ['IoU with target', present ? ov.toFixed(3) : 'n/a'],
        ['L_box (raw)', lBox.toFixed(4)],
        ['λ·L_box', present ? (lambda * lBox).toFixed(4) : '0'],
        ['L_obj', lObj.toFixed(4)],
        ['total', total.toFixed(4)],
      ]} />

      <Caption>
        Set <strong>λ_coord = 0</strong>: the box terms stop contributing and the network is free to
        emit any box while still scoring perfectly on objectness — localisation stops being learned.
        Set λ to 10 and box error swamps classification. YOLO v1 used λ_coord = 5 and λ_noobj = 0.5 for
        exactly this balancing reason: cells containing objects are rare, so their gradients need
        amplifying and the background cells' need damping.
      </Caption>
    </div>
  )
}
