import { useState } from 'react'
import { TRACK, SSD_LAYERS, ssdBoxCount } from './cvUtils.js'
import { Row, Slider, Readout, Caption } from './cvUi.jsx'

const TOTAL = ssdBoxCount()

export default function SSDPyramidWidget() {
  const [sel, setSel] = useState(1)
  const [objScale, setObjScale] = useState(0.30)

  const layer = SSD_LAYERS[sel]
  // A default box "fits" an object when their scales are within a factor of ~1.6.
  const fits = SSD_LAYERS.map(l => objScale / l.scale >= 0.62 && objScale / l.scale <= 1.6)
  const running = SSD_LAYERS.map((l, i) => SSD_LAYERS.slice(0, i + 1).reduce((s, x) => s + x.size * x.size * x.boxes, 0))

  const view = 150
  const cell = view / layer.size

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        <Slider label="object size (fraction of image)" value={objScale} onChange={setObjScale}
          min={0.05} max={0.95} step={0.05} fmt={v => v.toFixed(2)} width={140} />
        <span style={{ fontSize: '0.78rem', opacity: 0.72 }}>click a row to preview its feature map</span>
      </Row>

      <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '0.78rem' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.76rem' }}>
            <thead><tr style={{ opacity: 0.65 }}>
              {['layer', 'map', 'boxes/cell', 'scale sₖ', 'default boxes', 'running'].map(h => (
                <th key={h} style={{ padding: '3px 9px', textAlign: h === 'layer' ? 'left' : 'right' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {SSD_LAYERS.map((l, i) => (
                <tr key={l.name} onClick={() => setSel(i)} style={{
                  cursor: 'pointer',
                  background: i === sel ? 'rgba(21,128,61,0.13)' : fits[i] ? 'rgba(21,128,61,0.05)' : 'transparent',
                  fontWeight: fits[i] ? 700 : 400,
                }}>
                  <td style={{ padding: '3px 9px', fontFamily: 'monospace' }}>{l.name}{fits[i] ? ' ◀' : ''}</td>
                  <td style={{ padding: '3px 9px', textAlign: 'right', fontFamily: 'monospace' }}>{l.size}²</td>
                  <td style={{ padding: '3px 9px', textAlign: 'right', fontFamily: 'monospace' }}>{l.boxes}</td>
                  <td style={{ padding: '3px 9px', textAlign: 'right', fontFamily: 'monospace' }}>{l.scale.toFixed(3)}</td>
                  <td style={{ padding: '3px 9px', textAlign: 'right', fontFamily: 'monospace', color: TRACK, fontWeight: 700 }}>
                    {(l.size * l.size * l.boxes).toLocaleString()}
                  </td>
                  <td style={{ padding: '3px 9px', textAlign: 'right', fontFamily: 'monospace', opacity: 0.65 }}>
                    {running[i].toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--border,#ccc)' }}>
                <td colSpan={4} style={{ padding: '4px 9px', fontWeight: 700 }}>total (SSD300)</td>
                <td colSpan={2} style={{ padding: '4px 9px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: TRACK }}>
                  {TOTAL.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: '0.74rem', opacity: 0.72, marginTop: '0.45rem', maxWidth: 400, lineHeight: 1.6 }}>
            Rows marked ◀ are the layers whose default boxes are the right size for a
            {' '}{(objScale * 100).toFixed(0)}%-of-image object. Drag the slider: small objects are only
            findable on the <em>early, high-resolution</em> map, which is exactly the map a single-scale
            detector like YOLO v1 does not have.
          </p>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>
            {layer.name}: {layer.size}×{layer.size} map, {layer.boxes} boxes per cell
          </div>
          <svg width={view} height={view} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4, background: 'rgba(128,128,128,0.06)' }}>
            {Array.from({ length: layer.size + 1 }, (_, i) => (
              <g key={i} stroke="rgba(128,128,128,0.4)" strokeWidth={layer.size > 20 ? 0.4 : 0.9}>
                <line x1={i * cell} y1={0} x2={i * cell} y2={view} />
                <line x1={0} y1={i * cell} x2={view} y2={i * cell} />
              </g>
            ))}
            {/* the default boxes of the centre cell, at this layer's scale */}
            {[1, 2, 0.5, 3, 1 / 3, 1.4].slice(0, layer.boxes).map((ar, i) => {
              const w = view * layer.scale * Math.sqrt(ar), h = view * layer.scale / Math.sqrt(ar)
              return <rect key={i} x={view / 2 - w / 2} y={view / 2 - h / 2} width={w} height={h}
                fill="none" stroke={TRACK} strokeWidth="1.4" opacity={0.85} />
            })}
            <circle cx={view / 2} cy={view / 2} r="2.5" fill={TRACK} />
            {/* the object we are trying to detect */}
            <rect x={view / 2 - (view * objScale) / 2} y={view / 2 - (view * objScale) / 2}
              width={view * objScale} height={view * objScale}
              fill="rgba(37,99,235,0.16)" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          <p style={{ fontSize: '0.73rem', opacity: 0.7, marginTop: 4, maxWidth: 160, lineHeight: 1.55 }}>
            Green: the {layer.boxes} default boxes anchored at the centre cell. Blue dashed: the object.
          </p>
        </div>
      </div>

      <Readout items={[
        ['sₖ formula', 'sₘᵢₙ + (sₘₐₓ−sₘᵢₙ)(k−1)/(m−1)'],
        ['sₘᵢₙ, sₘₐₓ', '0.2, 0.9'],
        ['SSD300 boxes', TOTAL.toLocaleString()],
        ['YOLO v1 boxes', '7·7·2 = 98'],
        ['ratio', `${(TOTAL / 98).toFixed(0)}× more`],
      ]} />

      <Caption>
        SSD scores {TOTAL.toLocaleString()} boxes to YOLO v1's 98 — and gets 74.3 mAP against 63.4 at
        higher fps, because prediction happens at <strong>six resolutions</strong> instead of one. The
        price is a brutal class imbalance: almost every one of those {TOTAL.toLocaleString()} boxes is
        background, which is why SSD needs <strong>hard negative mining</strong> at a 3:1 ratio and why
        focal loss was invented two years later to fix the same problem in a principled way.
      </Caption>
    </div>
  )
}
