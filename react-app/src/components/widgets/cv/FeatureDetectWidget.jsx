import { useState } from 'react'
import { SAMPLE_IMAGES, TRACK, harris, classifyHarris, sobelGradients } from './cvUtils.js'
import { PixelGrid, Row, Select, Slider, Toggle, Readout, Caption } from './cvUi.jsx'

const TINT = {
  corner: 'rgba(21,128,61,0.55)',
  edge: 'rgba(37,99,235,0.40)',
  flat: 'rgba(0,0,0,0)',
}

export default function FeatureDetectWidget() {
  const [name, setName] = useState('Bright square')
  const [frac, setFrac] = useState(0.02)
  const [k, setK] = useState(0.04)
  const [showGrad, setShowGrad] = useState(false)
  const [hover, setHover] = useState([3, 3])

  const img = SAMPLE_IMAGES[name]
  const { R, tensors } = harris(img, { k })
  const labels = classifyHarris(R, frac)
  const { mag } = sobelGradients(img)

  const [r, c] = hover
  const T = tensors[r][c]
  const counts = labels.flat().reduce((a, l) => ({ ...a, [l]: (a[l] || 0) + 1 }), { corner: 0, edge: 0, flat: 0 })

  // Eigenvalues of the 2×2 structure tensor — what "corner" actually means.
  const tr = T.sxx + T.syy
  const disc = Math.sqrt(Math.max(0, tr * tr - 4 * T.det))
  const l1 = (tr + disc) / 2, l2 = (tr - disc) / 2

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        <Select label="image" value={name} onChange={setName} options={Object.keys(SAMPLE_IMAGES)} />
        <Slider label="threshold" value={frac} onChange={setFrac} min={0.002} max={0.2} step={0.002} fmt={v => `${(v * 100).toFixed(1)}%`} />
        <Slider label="k" value={k} onChange={setK} min={0.02} max={0.15} step={0.01} fmt={v => v.toFixed(2)} width={90} />
        <Toggle label="gradient magnitude" on={showGrad} onChange={setShowGrad} />
      </Row>

      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <PixelGrid img={img} cell={22} title="image + Harris labels"
          tint={(i, j) => TINT[labels[i][j]]} onHover={p => p && setHover(p)} marked={hover} />
        {showGrad && <PixelGrid img={mag.map(row => row.map(v => Math.min(255, v / 4)))} cell={22} title="‖∇I‖ (Sobel)" />}

        <div style={{ fontSize: '0.8rem', minWidth: 250 }}>
          <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Structure tensor at [{r}, {c}]</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.77rem', lineHeight: 1.75 }}>
            M = [ {T.sxx.toFixed(3)} &nbsp; {T.sxy.toFixed(3)} ]<br />
            &nbsp;&nbsp;&nbsp;&nbsp;[ {T.sxy.toFixed(3)} &nbsp; {T.syy.toFixed(3)} ]<br />
            λ₁ = {l1.toFixed(3)} &nbsp; λ₂ = {l2.toFixed(3)}<br />
            det = {T.det.toFixed(4)} &nbsp; trace = {tr.toFixed(3)}<br />
            R = det − k·tr² = <strong style={{ color: TRACK }}>{R[r][c].toFixed(4)}</strong>
          </div>
          <div style={{ marginTop: '0.45rem', fontSize: '0.8rem' }}>
            verdict: <strong style={{
              color: labels[r][c] === 'corner' ? TRACK : labels[r][c] === 'edge' ? '#2563eb' : 'inherit',
            }}>{labels[r][c]}</strong>
          </div>
          <ul style={{ fontSize: '0.74rem', opacity: 0.75, marginTop: '0.4rem', paddingLeft: '1.1rem', lineHeight: 1.6 }}>
            <li>both λ small → flat, nothing to track</li>
            <li>one λ large → edge, slides along itself</li>
            <li>both λ large → corner, pinned in 2-D</li>
          </ul>
        </div>
      </div>

      <Readout items={[
        ['corners', counts.corner], ['edges', counts.edge], ['flat', counts.flat],
        ['k', k.toFixed(2)], ['threshold', `${(frac * 100).toFixed(1)}% of |R|max`],
      ]} />

      <Caption>
        Pick <strong>Bright square</strong> and hover a side versus a corner: on the side one eigenvalue
        is large and the other near zero, so R is negative — the patch can slide along the edge without
        changing, which is the <em>aperture problem</em>. At the corner both eigenvalues are large and R
        goes positive. Then try <strong>Ramp</strong>: a smooth gradient has a big gradient everywhere and
        <em> no</em> corners in its interior, which is why "high gradient" alone is not a feature detector.
        (The corners it does mark sit on the frame — padding is invented signal, so every detector has
        border artefacts.)
      </Caption>
    </div>
  )
}
