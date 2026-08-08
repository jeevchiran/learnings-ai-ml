import { useState } from 'react'
import { TRACK } from './cvUtils.js'
import { Row, Slider, Select, Readout, Caption, svgPoint } from './cvUi.jsx'

const IW = 300, IH = 200          // "image" pixels
const CLASSES = ['0 crack', '1 rust', '2 dent']

/* Drag the box, read the exact line that belongs in labels/<image>.txt.
 * Every field is normalised — the single most common labelling bug is shipping
 * pixels here, and it fails quietly: the model just learns nothing. */
export default function YoloLabelWidget() {
  const [b, setB] = useState({ x: 96, y: 58, w: 108, h: 82 })
  const [cls, setCls] = useState(CLASSES[1])
  const [drag, setDrag] = useState(null)

  const cx = (b.x + b.w / 2) / IW, cy = (b.y + b.h / 2) / IH
  const nw = b.w / IW, nh = b.h / IH
  const id = cls.split(' ')[0]
  const line = `${id} ${cx.toFixed(6)} ${cy.toFixed(6)} ${nw.toFixed(6)} ${nh.toFixed(6)}`

  function onDown(e) {
    const [px, py] = svgPoint(e)
    const corner = Math.abs(px - (b.x + b.w)) < 14 && Math.abs(py - (b.y + b.h)) < 14
    setDrag({ mode: corner ? 'resize' : 'move', ox: px - b.x, oy: py - b.y })
  }
  function onMove(e) {
    if (!drag) return
    const [px, py] = svgPoint(e)
    setB(p => drag.mode === 'resize'
      ? { ...p, w: Math.max(16, Math.min(IW - p.x, px - p.x)), h: Math.max(16, Math.min(IH - p.y, py - p.y)) }
      : { ...p, x: Math.max(0, Math.min(IW - p.w, px - drag.ox)), y: Math.max(0, Math.min(IH - p.h, py - drag.oy)) })
  }

  return (
    <div>
      <Row style={{ marginBottom: '0.5rem' }}>
        <Select label="class" value={cls} onChange={setCls} options={CLASSES} />
        <Slider label="box w" value={b.w} onChange={v => setB(p => ({ ...p, w: Math.min(v, IW - p.x) }))} min={16} max={IW} width={90} />
        <Slider label="box h" value={b.h} onChange={v => setB(p => ({ ...p, h: Math.min(v, IH - p.y) }))} min={16} max={IH} width={90} />
        <span style={{ fontSize: '0.78rem', opacity: 0.72 }}>drag the box or its corner</span>
      </Row>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <svg width={IW} height={IH} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => setDrag(null)}
          style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4, touchAction: 'none', cursor: drag ? 'grabbing' : 'grab', background: 'rgba(128,128,128,0.07)' }}>
          <path d="M40,150 Q110,60 160,110 T270,70" fill="none" stroke="rgba(128,128,128,0.55)" strokeWidth="7" />
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={`${TRACK}22`} stroke={TRACK} strokeWidth="2.5" />
          <rect x={b.x + b.w - 7} y={b.y + b.h - 7} width={14} height={14} fill={TRACK} rx={2} />
          <line x1={b.x + b.w / 2} y1={0} x2={b.x + b.w / 2} y2={IH} stroke={TRACK} strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
          <line x1={0} y1={b.y + b.h / 2} x2={IW} y2={b.y + b.h / 2} stroke={TRACK} strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
          <text x={4} y={13} fontSize="10" fill="var(--text-muted,#888)">{IW} × {IH} px</text>
        </svg>

        <div style={{ minWidth: 300 }}>
          <div style={{ fontSize: '0.79rem', fontWeight: 700, marginBottom: 4 }}>labels/img_0001.txt</div>
          <pre style={{
            fontSize: '0.8rem', padding: '0.55rem 0.75rem', borderRadius: 4, margin: 0,
            background: 'var(--bg-hover, rgba(128,128,128,0.09))', overflowX: 'auto',
            border: `1px solid ${TRACK}55`,
          }}>{line}</pre>
          <div style={{ fontFamily: 'monospace', fontSize: '0.74rem', opacity: 0.75, marginTop: 4, lineHeight: 1.7 }}>
            class_id  = {id}<br />
            x_center  = {b.x + b.w / 2} / {IW} = {cx.toFixed(6)}<br />
            y_center  = {b.y + b.h / 2} / {IH} = {cy.toFixed(6)}<br />
            width&nbsp;&nbsp;&nbsp;&nbsp; = {b.w} / {IW} = {nw.toFixed(6)}<br />
            height&nbsp;&nbsp;&nbsp;&nbsp;= {b.h} / {IH} = {nh.toFixed(6)}
          </div>

          <div style={{ fontSize: '0.79rem', fontWeight: 700, margin: '0.7rem 0 4px' }}>data.yaml</div>
          <pre style={{
            fontSize: '0.76rem', padding: '0.55rem 0.75rem', borderRadius: 4, margin: 0,
            background: 'var(--bg-hover, rgba(128,128,128,0.09))', overflowX: 'auto',
          }}>{`path: ./weld-defects
train: images/train
val:   images/val
names:
  0: crack
  1: rust
  2: dent`}</pre>
        </div>
      </div>

      <Readout items={[
        ['format', 'class cx cy w h'],
        ['units', 'fractions of image size, all in [0, 1]'],
        ['origin', 'top-left'],
        ['file', 'one .txt per image, one line per object'],
        ['empty file', 'valid — means "background, no objects"'],
      ]} />

      <Caption>
        Three failure modes this format invites: writing <strong>pixels</strong> instead of fractions
        (values &gt; 1, and the loss quietly explodes); writing <strong>corner</strong> coordinates instead
        of the centre (every box lands up-left of its object); and forgetting that
        <code> images/train/x.jpg</code> must pair with <code>labels/train/x.txt</code> — the loader
        derives the label path by string substitution, so a renamed folder silently yields an
        all-background dataset that trains to 0 mAP without a single error message.
      </Caption>
    </div>
  )
}
