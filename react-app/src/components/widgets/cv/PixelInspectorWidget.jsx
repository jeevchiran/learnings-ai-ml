import { useState } from 'react'
import { SAMPLE_IMAGES, IMG_N, clamp8 } from './cvUtils.js'
import { PixelGrid, Row, Select, Slider, Toggle, Readout, Caption, grey } from './cvUi.jsx'

/* An image is a 2-D array of numbers. Hover a cell to see the number; drop the
 * bit depth to watch how many distinct numbers you are actually allowed. */
export default function PixelInspectorWidget() {
  const [name, setName] = useState('Bright square')
  const [bits, setBits] = useState(8)
  const [showValues, setShowValues] = useState(true)
  const [hover, setHover] = useState([4, 5])

  const src = SAMPLE_IMAGES[name]
  const levels = 2 ** bits
  const stepSize = 256 / levels
  // Quantise: keep only `levels` distinct grey values, then stretch back to 0–255.
  const img = src.map(row => row.map(v => clamp8(Math.floor(v / stepSize) * stepSize * (255 / (256 - stepSize)))))

  const [r, c] = hover || [0, 0]
  const raw = src[r][c]
  const q = img[r][c]

  return (
    <div>
      <Row style={{ marginBottom: '0.7rem' }}>
        <Select label="image" value={name} onChange={setName} options={Object.keys(SAMPLE_IMAGES)} />
        <Slider label="bit depth" value={bits} onChange={setBits} min={1} max={8}
          fmt={v => `${v}-bit`} width={110} />
        <Toggle label="show values" on={showValues} onChange={setShowValues} />
        <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>{levels} grey level{levels === 1 ? '' : 's'}</span>
      </Row>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <PixelGrid img={img} cell={22} showValues={showValues} title={`${IMG_N}×${IMG_N} greyscale`}
          onHover={p => p && setHover(p)} marked={hover} />

        <div style={{ fontSize: '0.8rem', lineHeight: 1.75, minWidth: 230 }}>
          <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Pixel under the cursor</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{ width: 42, height: 42, background: grey(q), border: '1px solid var(--border,#ccc)', borderRadius: 3 }} />
            <code style={{ fontSize: '0.82rem' }}>img[{r}, {c}]</code>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
            row (y) = {r} &nbsp; col (x) = {c}<br />
            8-bit value &nbsp;= {raw}<br />
            {bits}-bit value = {q} &nbsp;<span style={{ opacity: 0.6 }}>({(q / 255).toFixed(3)} as float)</span><br />
            binary &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= {raw.toString(2).padStart(8, '0')}
          </div>
          <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>
            Row first, column second — NumPy indexes <code>[y, x]</code>, the opposite of the
            <code> (x, y)</code> order OpenCV drawing functions take.
          </p>
        </div>
      </div>

      <Readout items={[
        ['shape', `(${IMG_N}, ${IMG_N})`],
        ['dtype', bits === 8 ? 'uint8' : `uint8 (${bits} bits used)`],
        ['pixels', IMG_N * IMG_N],
        ['bytes', IMG_N * IMG_N],
        ['distinct levels', new Set(img.flat()).size],
      ]} />

      <Caption>
        Drag the bit depth down. At 4 bits the picture still reads fine; at 2 bits you get visible
        <em> banding</em>, and at 1 bit the image has become a binary mask. Quantisation is a lossy
        choice made before a model ever sees the data — the same choice JPEG makes, in the frequency
        domain instead of the spatial one.
      </Caption>
    </div>
  )
}
