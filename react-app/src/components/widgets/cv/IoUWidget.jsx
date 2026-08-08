import { useState } from 'react'
import { TRACK, iou, giou, intersection, boxArea, unionArea } from './cvUtils.js'
import { Row, Btn, Readout, Caption, svgPoint } from './cvUi.jsx'

const W = 340, H = 240
const GT_COLOR = '#2563eb'

const PRESETS = {
  'good match':  { x: 108, y: 66, w: 108, h: 122 },
  'loose':       { x: 84,  y: 46, w: 152, h: 168 },
  'shifted':     { x: 150, y: 100, w: 100, h: 118 },
  'miss':        { x: 250, y: 30, w: 70,  h: 70 },
}

export default function IoUWidget() {
  const [gt] = useState({ x: 100, y: 60, w: 110, h: 125 })
  const [pred, setPred] = useState(PRESETS['good match'])
  const [drag, setDrag] = useState(null)

  const inter = intersection(gt, pred)
  const iA = boxArea(inter), uA = unionArea(gt, pred)
  const v = iou(gt, pred), g = giou(gt, pred)

  function onDown(e) {
    const [px, py] = svgPoint(e)
    const onCorner = Math.abs(px - (pred.x + pred.w)) < 14 && Math.abs(py - (pred.y + pred.h)) < 14
    setDrag({ mode: onCorner ? 'resize' : 'move', ox: px - pred.x, oy: py - pred.y })
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  function onMove(e) {
    if (!drag) return
    const [px, py] = svgPoint(e)
    setPred(p => drag.mode === 'resize'
      ? { ...p, w: Math.max(20, Math.min(W - p.x, px - p.x)), h: Math.max(20, Math.min(H - p.y, py - p.y)) }
      : { ...p, x: Math.max(0, Math.min(W - p.w, px - drag.ox)), y: Math.max(0, Math.min(H - p.h, py - drag.oy)) })
  }

  const verdict = t => (v >= t ? 'TP' : 'FP')

  return (
    <div>
      <Row style={{ marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>drag the green box, or grab its bottom-right corner to resize:</span>
        {Object.keys(PRESETS).map(k => <Btn key={k} onClick={() => setPred(PRESETS[k])}>{k}</Btn>)}
      </Row>

      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <svg width={W} height={H} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => setDrag(null)}
          style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4, touchAction: 'none', cursor: drag ? 'grabbing' : 'grab', background: 'rgba(128,128,128,0.06)' }}>
          {/* a stand-in "object" so the boxes have something to be right or wrong about */}
          <ellipse cx={155} cy={122} rx={46} ry={58} fill="rgba(128,128,128,0.35)" />
          <circle cx={155} cy={78} r={22} fill="rgba(128,128,128,0.35)" />

          {iA > 0 && <rect x={inter.x} y={inter.y} width={inter.w} height={inter.h} fill={`${TRACK}55`} />}
          <rect x={gt.x} y={gt.y} width={gt.w} height={gt.h} fill="none" stroke={GT_COLOR} strokeWidth="2.5" strokeDasharray="6 4" />
          <text x={gt.x} y={gt.y - 5} fontSize="11" fill={GT_COLOR} fontWeight="700">ground truth</text>
          <rect x={pred.x} y={pred.y} width={pred.w} height={pred.h} fill="none" stroke={TRACK} strokeWidth="2.5" />
          <text x={pred.x} y={pred.y + pred.h + 13} fontSize="11" fill={TRACK} fontWeight="700">prediction</text>
          <rect x={pred.x + pred.w - 7} y={pred.y + pred.h - 7} width={14} height={14} fill={TRACK} rx={2} />
        </svg>

        <div style={{ minWidth: 210 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>IoU = intersection / union</div>
          <div style={{ height: 20, borderRadius: 4, background: 'var(--bg-hover,#eee)', overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ width: `${v * 100}%`, height: '100%', background: TRACK, transition: 'width 60ms' }} />
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
            {iA.toFixed(0)} / {uA.toFixed(0)} = <strong style={{ color: TRACK, fontSize: '1.05rem' }}>{v.toFixed(3)}</strong>
          </div>

          <table style={{ fontSize: '0.78rem', borderCollapse: 'collapse' }}>
            <tbody>
              {[0.5, 0.75, 0.95].map(t => (
                <tr key={t}>
                  <td style={{ padding: '2px 10px 2px 0', opacity: 0.75 }}>@ IoU&nbsp;{t}</td>
                  <td style={{ padding: '2px 0', fontWeight: 700, color: v >= t ? TRACK : '#dc2626' }}>{verdict(t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.74rem', opacity: 0.72, marginTop: '0.5rem', lineHeight: 1.6 }}>
            The same prediction is a hit or a miss depending only on the threshold you report at.
            COCO's headline mAP averages ten thresholds, 0.50 to 0.95.
          </p>
        </div>
      </div>

      <Readout items={[
        ['pred', `(${pred.x.toFixed(0)}, ${pred.y.toFixed(0)}, ${pred.w.toFixed(0)}, ${pred.h.toFixed(0)})`],
        ['∩', iA.toFixed(0)], ['∪', uA.toFixed(0)],
        ['IoU', v.toFixed(4)], ['GIoU', g.toFixed(4)],
      ]} />

      <Caption>
        Hit <strong>miss</strong>: IoU pins at exactly 0 and stays there however far you drag — a zero
        gradient, so a loss built on plain IoU cannot pull a badly-placed box back. GIoU keeps falling
        (it goes negative), because it also charges for the empty space in the smallest box enclosing
        both. That single fix is why GIoU / DIoU / CIoU replaced smooth-L1 in modern detectors.
      </Caption>
    </div>
  )
}
