import { useState } from 'react'
import { TRACK, affineMatrix, applyMat, det3 } from './cvUtils.js'
import { Row, Slider, Btn, Readout, Caption } from './cvUi.jsx'

const W = 320, H = 230
// A capital F: asymmetric under both rotation and reflection, so you can always
// tell what the matrix actually did.
const F = [[0, 0], [0, 60], [34, 60], [34, 48], [12, 48], [12, 36], [30, 36], [30, 24], [12, 24], [12, 0]]
const ORIGIN = [90, 130]

const PRESETS = {
  Identity:    { tx: 0, ty: 0, deg: 0, sx: 1, sy: 1, shx: 0, p0: 0, p1: 0 },
  Translate:   { tx: 70, ty: -30, deg: 0, sx: 1, sy: 1, shx: 0, p0: 0, p1: 0 },
  Rotate:      { tx: 0, ty: 0, deg: 35, sx: 1, sy: 1, shx: 0, p0: 0, p1: 0 },
  Scale:       { tx: 0, ty: 0, deg: 0, sx: 1.6, sy: 0.7, shx: 0, p0: 0, p1: 0 },
  Shear:       { tx: 0, ty: 0, deg: 0, sx: 1, sy: 1, shx: 0.6, p0: 0, p1: 0 },
  Perspective: { tx: 0, ty: 0, deg: 0, sx: 1, sy: 1, shx: 0, p0: 0.004, p1: -0.002 },
}

export default function AffineWidget() {
  const [p, setP] = useState(PRESETS.Rotate)
  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }))

  const M = affineMatrix(p)
  const isAffine = p.p0 === 0 && p.p1 === 0
  const dof = isAffine ? 6 : 8
  const pts = F.map(([x, y]) => applyMat(M, [x, y]))
  const path = a => a.map(([x, y], i) => `${i ? 'L' : 'M'}${(ORIGIN[0] + x).toFixed(1)},${(ORIGIN[1] - y).toFixed(1)}`).join(' ') + ' Z'
  // Exact area of the F outline: stem + top arm + middle arm (shoelace agrees).
  const area0 = 12 * 60 + 22 * 12 + 18 * 12   // = 1200 px²
  const detM = det3(M)

  return (
    <div>
      <Row style={{ marginBottom: '0.5rem' }}>
        {Object.keys(PRESETS).map(k => (
          <Btn key={k} onClick={() => setP(PRESETS[k])} primary={JSON.stringify(p) === JSON.stringify(PRESETS[k])}>{k}</Btn>
        ))}
      </Row>
      <Row style={{ marginBottom: '0.6rem' }}>
        <Slider label="tx" value={p.tx} onChange={v => set('tx', v)} min={-80} max={120} width={80} />
        <Slider label="ty" value={p.ty} onChange={v => set('ty', v)} min={-80} max={80} width={80} />
        <Slider label="θ°" value={p.deg} onChange={v => set('deg', v)} min={-180} max={180} width={90} />
        <Slider label="sx" value={p.sx} onChange={v => set('sx', v)} min={0.2} max={2} step={0.05} fmt={v => v.toFixed(2)} width={80} />
        <Slider label="sy" value={p.sy} onChange={v => set('sy', v)} min={0.2} max={2} step={0.05} fmt={v => v.toFixed(2)} width={80} />
        <Slider label="shear" value={p.shx} onChange={v => set('shx', v)} min={-1} max={1} step={0.05} fmt={v => v.toFixed(2)} width={80} />
      </Row>

      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4 }}>
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i} stroke="rgba(128,128,128,0.16)" strokeWidth="1">
              <line x1={i * 40} y1={0} x2={i * 40} y2={H} />
              <line x1={0} y1={i * 30} x2={W} y2={i * 30} />
            </g>
          ))}
          <path d={path(F)} fill="rgba(128,128,128,0.18)" stroke="rgba(128,128,128,0.7)" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d={path(pts)} fill={`${TRACK}33`} stroke={TRACK} strokeWidth="2" />
          <circle cx={ORIGIN[0]} cy={ORIGIN[1]} r="3.5" fill={TRACK} />
          <text x={ORIGIN[0] + 6} y={ORIGIN[1] + 14} fontSize="10" fill="var(--text-muted,#888)">origin (0,0)</text>
        </svg>

        <div style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontFamily: 'inherit' }}>M (3×3 homogeneous)</div>
          <table style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {M.map((row, i) => (
                <tr key={i}>
                  {row.map((v, j) => (
                    <td key={j} style={{
                      padding: '3px 9px', textAlign: 'right', minWidth: 58,
                      border: '1px solid var(--border,#d4d4d8)',
                      color: i === 2 && j < 2 && v !== 0 ? '#dc2626' : 'inherit',
                      background: i === 2 && j < 2 && v !== 0 ? 'rgba(220,38,38,0.10)' : 'transparent',
                    }}>{v.toFixed(3)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontFamily: 'inherit', fontSize: '0.75rem', opacity: 0.72, marginTop: '0.45rem', maxWidth: 230 }}>
            Bottom row <code>[0 0 1]</code> ⇒ affine: parallel lines stay parallel.
            Make it non-zero (Perspective preset) and you have a homography — parallel
            lines can now meet, which is exactly what a camera does to railway tracks.
          </p>
        </div>
      </div>

      <Readout items={[
        ['type', isAffine ? 'affine' : 'projective (homography)'],
        ['DoF', dof],
        ['det(M)', detM.toFixed(3)],
        ['area scale', `${Math.abs(p.sx * p.sy).toFixed(2)}×`],
        ['area', `${area0} px² → ${(area0 * Math.abs(p.sx * p.sy)).toFixed(0)} px²`],
      ]} />

      <Caption>
        Rotation and translation never change <code>det(M)</code>; only scale and shear do, and
        <code> |det|</code> <em>is</em> the area factor. Note the grey dashed original stays put —
        OpenCV actually computes this <strong>backwards</strong>: for each output pixel it applies
        <code> M⁻¹</code> to find where to sample from the input, because forward-mapping would leave
        unwritten holes wherever the transform stretches.
      </Caption>
    </div>
  )
}
