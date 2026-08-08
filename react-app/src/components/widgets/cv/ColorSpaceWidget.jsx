import { useState } from 'react'
import { TRACK } from './cvUtils.js'
import { Row, Select, Readout, Caption } from './cvUi.jsx'

/* An 8×8 colour patch built from four flat regions plus a gradient, so each
 * channel decomposition looks obviously different from the others. */
const N = 8
const RGB = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
  if (r < 4 && c < 4) return [220, 60, 55]      // red block
  if (r < 4) return [40, 140, 220]              // blue block
  if (c < 4) return [60, 175, 80]               // green block
  return [70 + c * 20, 70 + r * 18, 200 - c * 12] // gradient
}))

function rgb2hsv([R, G, B]) {
  const r = R / 255, g = G / 255, b = B / 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn
  let h = 0
  if (d !== 0) {
    if (mx === r) h = 60 * (((g - b) / d) % 6)
    else if (mx === g) h = 60 * ((b - r) / d + 2)
    else h = 60 * ((r - g) / d + 4)
  }
  if (h < 0) h += 360
  return [h, mx === 0 ? 0 : d / mx, mx]
}

// ITU-R BT.601 luma — the weights cv2.COLOR_BGR2GRAY actually uses.
const luma = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b

const VIEWS = {
  'RGB (colour)': p => `rgb(${p[0]},${p[1]},${p[2]})`,
  'R channel': p => `rgb(${p[0]},${p[0]},${p[0]})`,
  'G channel': p => `rgb(${p[1]},${p[1]},${p[1]})`,
  'B channel': p => `rgb(${p[2]},${p[2]},${p[2]})`,
  'Greyscale (luma)': p => { const v = Math.round(luma(p)); return `rgb(${v},${v},${v})` },
  'H channel (HSV)': p => { const h = rgb2hsv(p)[0]; return `hsl(${h},80%,50%)` },
  'S channel (HSV)': p => { const v = Math.round(rgb2hsv(p)[1] * 255); return `rgb(${v},${v},${v})` },
  'V channel (HSV)': p => { const v = Math.round(rgb2hsv(p)[2] * 255); return `rgb(${v},${v},${v})` },
}

export default function ColorSpaceWidget() {
  const [view, setView] = useState('RGB (colour)')
  const [sel, setSel] = useState([1, 1])

  const cell = 30
  const px = RGB[sel[0]][sel[1]]
  const [h, s, v] = rgb2hsv(px)
  const gy = luma(px)
  const paint = VIEWS[view]

  return (
    <div>
      <Row style={{ marginBottom: '0.7rem' }}>
        <Select label="view" value={view} onChange={setView} options={Object.keys(VIEWS)} />
        <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>click a pixel to inspect it</span>
      </Row>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <svg width={N * cell} height={N * cell} style={{ display: 'block', shapeRendering: 'crispEdges', cursor: 'crosshair' }}>
          {RGB.map((row, r) => row.map((p, c) => (
            <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell}
              fill={paint(p)} onClick={() => setSel([r, c])}
              stroke={sel[0] === r && sel[1] === c ? TRACK : 'rgba(128,128,128,0.2)'}
              strokeWidth={sel[0] === r && sel[1] === c ? 3 : 0.5} />
          )))}
        </svg>

        <div style={{ fontSize: '0.8rem', minWidth: 250 }}>
          <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>img[{sel[0]}, {sel[1]}]</div>
          {[['R', px[0], '#dc2626'], ['G', px[1], '#16a34a'], ['B', px[2], '#2563eb']].map(([lbl, val, col]) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 3 }}>
              <span style={{ width: 14, fontFamily: 'monospace', fontWeight: 700, color: col }}>{lbl}</span>
              <span style={{ flex: 1, height: 9, background: 'var(--bg-hover,#eee)', borderRadius: 3, overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${(val / 255) * 100}%`, height: '100%', background: col }} />
              </span>
              <span style={{ fontFamily: 'monospace', width: 30, textAlign: 'right' }}>{val}</span>
            </div>
          ))}
          <div style={{ fontFamily: 'monospace', fontSize: '0.76rem', marginTop: '0.5rem', lineHeight: 1.7 }}>
            grey = 0.299·{px[0]} + 0.587·{px[1]} + 0.114·{px[2]}<br />
            &nbsp;&nbsp;&nbsp;&nbsp; = <strong style={{ color: TRACK }}>{gy.toFixed(1)}</strong><br />
            HSV = ({h.toFixed(0)}°, {(s * 100).toFixed(0)}%, {(v * 100).toFixed(0)}%)
          </div>
        </div>
      </div>

      <Readout items={[
        ['shape', `(${N}, ${N}, 3)`],
        ['channels', 3],
        ['bytes', N * N * 3],
        ['as greyscale', `(${N}, ${N}) → ${N * N} bytes`],
      ]} />

      <Caption>
        Switch to <strong>H channel</strong> and look at the two flat blocks: hue barely moves when you
        change the lighting on an object, which is why colour-based segmentation is done in HSV and
        almost never in RGB. Note also that greyscale is not <code>(R+G+B)/3</code> — green carries most
        of the perceived brightness, so it gets 0.587 of the weight.
      </Caption>
    </div>
  )
}
