import { useState } from 'react'
import {
  SAMPLE_IMAGES, TRACK, histogram, imageStats, equalize,
  gammaCorrect, brightnessContrast,
} from './cvUtils.js'
import { PixelGrid, Row, Select, Slider, Readout, Caption } from './cvUi.jsx'

const BINS = 32

const OPS = {
  'none': (img) => img,
  'histogram equalisation': (img) => equalize(img),
  'gamma': (img, p) => gammaCorrect(img, p.gamma),
  'linear stretch': (img) => {
    const { min, max } = imageStats(img)
    return brightnessContrast(img, 255 / Math.max(1, max - min), (-255 * min) / Math.max(1, max - min))
  },
}

function Hist({ h, label, color }) {
  const peak = Math.max(...h) || 1
  const W = 210, H = 74
  return (
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>{label}</div>
      <svg width={W} height={H + 14} style={{ display: 'block' }}>
        {h.map((v, i) => (
          <rect key={i} x={(i * W) / BINS} y={H - (v / peak) * H} width={W / BINS - 1}
            height={(v / peak) * H} fill={color} opacity={0.85} />
        ))}
        <line x1={0} y1={H} x2={W} y2={H} stroke="var(--border,#ccc)" />
        <text x={0} y={H + 11} fontSize="9" fill="var(--text-muted,#999)">0</text>
        <text x={W - 18} y={H + 11} fontSize="9" fill="var(--text-muted,#999)">255</text>
      </svg>
    </div>
  )
}

export default function HistogramWidget() {
  const [name, setName] = useState('Low contrast')
  const [op, setOp] = useState('histogram equalisation')
  const [gamma, setGamma] = useState(0.5)

  const src = SAMPLE_IMAGES[name]
  const out = OPS[op](src, { gamma })
  const s0 = imageStats(src), s1 = imageStats(out)
  // What torchvision would apply after ToTensor, using this image's own stats.
  const normMean = (s1.mean / 255).toFixed(3), normStd = (s1.std / 255).toFixed(3)

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        <Select label="image" value={name} onChange={setName} options={Object.keys(SAMPLE_IMAGES)} />
        <Select label="operation" value={op} onChange={setOp} options={Object.keys(OPS)} />
        {op === 'gamma' && <Slider label="γ" value={gamma} onChange={setGamma} min={0.2} max={3} step={0.1} fmt={v => v.toFixed(1)} />}
      </Row>

      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <PixelGrid img={src} cell={19} title="before" />
        <Hist h={histogram(src, BINS)} label="histogram before" color="rgba(128,128,128,0.85)" />
        <PixelGrid img={out} cell={19} title="after" />
        <Hist h={histogram(out, BINS)} label="histogram after" color={TRACK} />
      </div>

      <Readout items={[
        ['min→max before', `${s0.min}→${s0.max}`],
        ['after', `${s1.min}→${s1.max}`],
        ['mean', `${s0.mean.toFixed(1)} → ${s1.mean.toFixed(1)}`],
        ['std', `${s0.std.toFixed(1)} → ${s1.std.toFixed(1)}`],
        ['dynamic range used', `${((s0.max - s0.min) / 255 * 100).toFixed(0)}% → ${((s1.max - s1.min) / 255 * 100).toFixed(0)}%`],
      ]} />

      <pre style={{
        marginTop: '0.55rem', fontSize: '0.76rem', padding: '0.5rem 0.7rem', borderRadius: 4,
        background: 'var(--bg-hover, rgba(128,128,128,0.09))', overflowX: 'auto',
      }}>
{`# the same statistics, as a training-time transform
transforms.Normalize(mean=[${normMean}], std=[${normStd}])
# x_norm = (x/255 - mean) / std   →   mean 0, std 1`}
      </pre>

      <Caption>
        Start on <strong>Low contrast</strong>: the pixels occupy only {(s0.max - s0.min)} of 256 levels,
        so the picture looks washed out and a convolution's response barely varies. Equalisation
        redistributes them across the full range — but it is <em>data-dependent</em>: applied per image
        it changes what "brightness 120" means from sample to sample. That is why training pipelines
        normalise with <strong>fixed dataset statistics</strong> rather than equalising per image.
      </Caption>
    </div>
  )
}
