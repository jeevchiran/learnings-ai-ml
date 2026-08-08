import { useState } from 'react'
import { SAMPLE_IMAGES, TRACK, imageStats } from './cvUtils.js'
import { PixelGrid, Row, Select, Slider, Toggle, Readout, Caption } from './cvUi.jsx'

/* A region of interest is just an array slice. This widget insists on that:
 * move the box, read the exact NumPy line that would produce the crop. */
export default function ROIWidget() {
  const [name, setName] = useState('Bright square')
  const [x, setX] = useState(3)
  const [y, setY] = useState(3)
  const [w, setW] = useState(6)
  const [h, setH] = useState(6)
  const [maskMode, setMaskMode] = useState(false)

  const img = SAMPLE_IMAGES[name]
  const N = img.length
  const x2 = Math.min(N, x + w), y2 = Math.min(N, y + h)
  const crop = img.slice(y, y2).map(row => row.slice(x, x2))

  const inside = imageStats(crop)
  const outsidePix = img.flat().filter((_, i) => {
    const r = Math.floor(i / N), c = i % N
    return !(r >= y && r < y2 && c >= x && c < x2)
  })
  const outMean = outsidePix.reduce((a, b) => a + b, 0) / outsidePix.length

  const masked = img.map((row, r) => row.map((v, c) =>
    (r >= y && r < y2 && c >= x && c < x2) ? v : 0))

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        <Select label="image" value={name} onChange={setName} options={Object.keys(SAMPLE_IMAGES)} />
        <Slider label="x" value={x} onChange={v => setX(Math.min(v, N - 1))} min={0} max={N - 1} width={80} />
        <Slider label="y" value={y} onChange={v => setY(Math.min(v, N - 1))} min={0} max={N - 1} width={80} />
        <Slider label="w" value={w} onChange={setW} min={1} max={N} width={80} />
        <Slider label="h" value={h} onChange={setH} min={1} max={N} width={80} />
        <Toggle label="mask instead of crop" on={maskMode} onChange={setMaskMode} />
      </Row>

      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ position: 'relative' }}>
          <PixelGrid img={img} cell={22}
            tint={(r, c) => (r >= y && r < y2 && c >= x && c < x2 ? 'rgba(21,128,61,0.28)' : 'rgba(0,0,0,0.32)')}
            title={`image ${N}×${N}`} />
          <svg width={N * 22} height={N * 22} style={{ position: 'absolute', left: 0, top: 17, pointerEvents: 'none' }}>
            <rect x={x * 22} y={y * 22} width={(x2 - x) * 22} height={(y2 - y) * 22}
              fill="none" stroke={TRACK} strokeWidth="2.5" />
            <text x={x * 22 + 3} y={y * 22 - 4} fontSize="10" fill={TRACK} fontWeight="700">
              ROI {x2 - x}×{y2 - y}
            </text>
          </svg>
        </div>

        <div>
          <PixelGrid img={maskMode ? masked : crop} cell={maskMode ? 22 : 30} showValues={!maskMode}
            title={maskMode ? 'masked (shape preserved)' : `crop → shape (${y2 - y}, ${x2 - x})`} />
          <pre style={{
            marginTop: '0.5rem', fontSize: '0.76rem', padding: '0.5rem 0.7rem', borderRadius: 4,
            background: 'var(--bg-hover, rgba(128,128,128,0.09))', overflowX: 'auto',
          }}>
{maskMode
  ? `mask = np.zeros_like(img)\nmask[${y}:${y2}, ${x}:${x2}] = 255\nout = cv2.bitwise_and(img, img, mask=mask)`
  : `roi = img[${y}:${y2}, ${x}:${x2}]   # y first!\nroi.shape  # (${y2 - y}, ${x2 - x})\n# box format (x, y, w, h) = (${x}, ${y}, ${x2 - x}, ${y2 - y})`}
          </pre>
        </div>
      </div>

      <Readout items={[
        ['ROI area', `${(x2 - x) * (y2 - y)} px`],
        ['of image', `${(((x2 - x) * (y2 - y)) / (N * N) * 100).toFixed(1)}%`],
        ['mean inside', inside.mean.toFixed(1)],
        ['mean outside', outMean.toFixed(1)],
        ['xyxy', `(${x}, ${y}, ${x2}, ${y2})`],
        ['cxcywh', `(${(x + (x2 - x) / 2).toFixed(1)}, ${(y + (y2 - y) / 2).toFixed(1)}, ${x2 - x}, ${y2 - y})`],
      ]} />

      <Caption>
        <strong>Crop</strong> changes the array shape; <strong>mask</strong> keeps it and zeroes the
        outside. Detectors need the first (a fixed-size crop to feed a classifier), segmentation needs
        the second. Notice the three box formats in the readout — <code>xywh</code>, <code>xyxy</code>,
        <code> cxcywh</code>. Mixing them up is the most common bug in a detection pipeline, and it
        fails silently: your boxes just land in the wrong place.
      </Caption>
    </div>
  )
}
