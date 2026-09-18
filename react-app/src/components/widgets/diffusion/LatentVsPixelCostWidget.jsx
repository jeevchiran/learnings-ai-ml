import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#7c2d12'
const ALT = '#0f766e'

/* The Stable Diffusion move, as arithmetic. Denoising in a compressed space is
 * cheaper by the square of the downscale factor, which is the difference between
 * a research demo and something that runs on a consumer card. */

export default function LatentVsPixelCostWidget() {
  const [res, setRes] = useState(512)
  const [f, setF] = useState(8)

  const pixels = res * res
  const latent = (res / f) * (res / f)
  const saving = pixels / latent
  const barMax = 512 * 512

  const Bar = ({ label, value, color }) => (
    <div style={{ marginBottom: '0.45rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'monospace', color }}>{Math.round(value).toLocaleString()} positions</span>
      </div>
      <div style={{ height: 12, background: 'var(--bg-hover)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, (value / barMax) * 100)}%`, height: '100%', background: color, transition: 'width .2s' }} />
      </div>
    </div>
  )

  return (
    <Accent value={COLOR}>
      <div>
        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
          <Slider label="image side" value={res} onChange={setRes} min={128} max={1024} step={64} width={150} />
          <Slider label="downscale factor" value={f} onChange={setF} min={2} max={16} step={2} width={130} />
        </div>

        <Bar label="denoising in pixel space" value={pixels} color={COLOR} />
        <Bar label="denoising in latent space" value={latent} color={ALT} />

        <Readout items={[
          ['latent grid', `${res / f} x ${res / f}`],
          ['work saved', `${saving.toFixed(0)}x`],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          The saving is the square of the downscale factor, because the grid shrinks in both directions at once,
          and that cost is paid again at every one of the sampling steps. An autoencoder compresses the image
          first, the whole diffusion process runs on the small grid, and the decoder expands the result back.
          That one rearrangement is what moved image generation from a cluster to a laptop.
        </p>
      </div>
    </Accent>
  )
}
