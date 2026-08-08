import { useState } from 'react'
import { TRACK, assignCell, yoloTensor } from './cvUtils.js'
import { Row, Slider, Readout, Caption, svgPoint } from './cvUi.jsx'

const SIZE = 280

const OBJECTS = [
  { label: 'dog',    cls: 0, x: 30,  y: 120, w: 110, h: 120, col: TRACK },
  { label: 'person', cls: 1, x: 160, y: 40,  w: 78,  h: 200, col: '#2563eb' },
]

export default function YOLOGridWidget() {
  const [S, setS] = useState(7)
  const [B, setB] = useState(2)
  const [C, setC] = useState(20)
  const [objs, setObjs] = useState(OBJECTS)
  const [drag, setDrag] = useState(null)

  const cell = SIZE / S
  const assigns = objs.map(o => ({ ...assignCell(o, S, SIZE), obj: o }))
  const t = yoloTensor(S, B, C)

  function onDown(e) {
    const [px, py] = svgPoint(e)
    const hit = objs.findIndex(o => px >= o.x && px <= o.x + o.w && py >= o.y && py <= o.y + o.h)
    if (hit >= 0) setDrag({ i: hit, ox: px - objs[hit].x, oy: py - objs[hit].y })
  }
  function onMove(e) {
    if (!drag) return
    const [px, py] = svgPoint(e)
    setObjs(list => list.map((o, i) => i === drag.i
      ? { ...o, x: Math.max(0, Math.min(SIZE - o.w, px - drag.ox)), y: Math.max(0, Math.min(SIZE - o.h, py - drag.oy)) }
      : o))
  }

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        <Slider label="grid S" value={S} onChange={setS} min={3} max={13} width={100} />
        <Slider label="boxes/cell B" value={B} onChange={setB} min={1} max={5} width={80} />
        <Slider label="classes C" value={C} onChange={setC} min={2} max={80} width={90} />
        <span style={{ fontSize: '0.78rem', opacity: 0.72 }}>drag an object</span>
      </Row>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <svg width={SIZE} height={SIZE} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => setDrag(null)}
          style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4, touchAction: 'none', cursor: drag ? 'grabbing' : 'grab', background: 'rgba(128,128,128,0.06)' }}>
          {assigns.map(a => (
            <rect key={`c${a.obj.label}`} x={a.col * cell} y={a.row * cell} width={cell} height={cell}
              fill={`${a.obj.col}33`} />
          ))}
          {Array.from({ length: S + 1 }, (_, i) => (
            <g key={i} stroke="rgba(128,128,128,0.45)" strokeWidth="1">
              <line x1={i * cell} y1={0} x2={i * cell} y2={SIZE} />
              <line x1={0} y1={i * cell} x2={SIZE} y2={i * cell} />
            </g>
          ))}
          {objs.map(o => (
            <g key={o.label}>
              <rect x={o.x} y={o.y} width={o.w} height={o.h} fill={`${o.col}22`} stroke={o.col} strokeWidth="2.5" />
              <text x={o.x + 3} y={o.y + 13} fontSize="11" fontWeight="700" fill={o.col}>{o.label}</text>
              <circle cx={o.x + o.w / 2} cy={o.y + o.h / 2} r="4.5" fill={o.col} stroke="#fff" strokeWidth="1.5" />
            </g>
          ))}
        </svg>

        <div style={{ fontSize: '0.79rem', minWidth: 265 }}>
          {assigns.map(a => (
            <div key={a.obj.label} style={{ marginBottom: '0.7rem' }}>
              <div style={{ fontWeight: 700, color: a.obj.col }}>{a.obj.label} → cell ({a.row}, {a.col})</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.7, opacity: 0.9 }}>
                centre (normalised) = ({a.cx.toFixed(3)}, {a.cy.toFixed(3)})<br />
                tx, ty (offset inside cell) = ({a.tx.toFixed(3)}, {a.ty.toFixed(3)})<br />
                tw, th (fraction of image) = ({a.tw.toFixed(3)}, {a.th.toFixed(3)})<br />
                target = [1, {a.tx.toFixed(2)}, {a.ty.toFixed(2)}, {a.tw.toFixed(2)}, {a.th.toFixed(2)}, … one-hot class {a.obj.cls}]
              </div>
            </div>
          ))}
          <p style={{ fontSize: '0.75rem', opacity: 0.75, lineHeight: 1.65 }}>
            tx and ty are always in [0, 1) — they are measured <em>inside</em> the responsible cell, which
            is why YOLO puts a sigmoid on them. tw and th are fractions of the whole image, so a
            prediction cannot depend on input resolution.
          </p>
        </div>
      </div>

      <Readout items={[
        ['output tensor', `${S}×${S}×${t.perCell}`],
        ['cells', t.cells],
        ['per cell', `B·5 + C = ${B}·5 + ${C} = ${t.perCell}`],
        ['numbers', t.total.toLocaleString()],
        ['max objects', `${t.cells} (1 per cell)`],
      ]} />

      <Caption>
        Set <strong>S = 7, B = 2, C = 20</strong> for the original YOLO v1 tensor: 7×7×30 = 1470 numbers,
        produced by one forward pass. Now drag both objects into the same cell — one of them is simply
        <em> lost</em>, because a v1 cell predicts a single class and commits to one object. That is the
        spatial-constraint failure on flocks and crowds the paper reports, and it is why v2 onward
        attaches predictions to <strong>anchors</strong> instead of to bare cells.
      </Caption>
    </div>
  )
}
