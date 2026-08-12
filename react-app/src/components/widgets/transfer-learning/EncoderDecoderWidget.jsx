import { useState } from 'react'
import { TRACK, autoencoderTrajectory } from './tlUtils.js'
import { Accent, Row, Slider, Readout, Caption } from '../shared/ui.jsx'

export default function EncoderDecoderWidget() {
  const [latent, setLatent] = useState(128)
  const [depth, setDepth] = useState(4)

  const rows = autoencoderTrajectory({ input: 128, base: 32, depth, latent })
  const maxUnits = Math.max(...rows.map(r => r.units))
  const inputUnits = rows[0].units
  const compression = inputUnits / latent

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.7rem' }}>
          <Slider label="latent dim" value={latent} onChange={setLatent} min={8} max={2048} step={8} width={130} />
          <Slider label="depth" value={depth} onChange={setDepth} min={2} max={5} width={90} />
        </Row>

        <div style={{ fontSize: '0.78rem' }}>
          {rows.map((r, i) => {
            const w = (r.units / maxUnits) * 240
            const isLatent = r.name === 'latent'
            return (
              <div key={`${r.name}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: 2 }}>
                <span style={{ width: 62, fontFamily: 'monospace', opacity: 0.75 }}>{r.name}</span>
                <span style={{ width: 96, fontFamily: 'monospace', fontSize: '0.74rem', opacity: 0.7 }}>
                  {r.size}×{r.size}×{r.ch}
                </span>
                <span style={{ width: 244, height: 13, background: 'var(--bg-hover,#eee)', borderRadius: 3 }}>
                  <span style={{ display: 'block', width: Math.max(2, w), height: '100%', borderRadius: 3,
                                 background: isLatent ? '#dc2626' : TRACK, opacity: isLatent ? 1 : 0.75 }} />
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.74rem' }}>{r.units.toLocaleString()}</span>
              </div>
            )
          })}
        </div>

        <Readout items={[
          ['input', `${inputUnits.toLocaleString()} values`],
          ['latent', latent],
          ['compression', `${compression.toFixed(0)}×`],
          ['information kept', `${(100 / compression).toFixed(2)}%`],
        ]} />

        <Caption>
          The red bar is the bottleneck, and it is doing two jobs at once. Squeezing 49,152 numbers into
          {' '}{latent} forces the encoder to keep only what the decoder needs — that is the useful part, and it is
          why autoencoders learn features at all. But <strong>everything discarded is gone</strong>: the decoder is
          reconstructing from a summary, so fine spatial detail comes back blurred no matter how good the decoder
          is. Drag the latent dim down to 8 and read the compression figure.
          <br /><br />
          For <em>classification</em> that loss is fine — you wanted a summary. For <em>segmentation</em> you need
          a label at every original pixel, and a blurry reconstruction is a blurry mask. That gap is exactly what
          skip connections close, and why U-Net looks the way it does.
        </Caption>
      </div>
    </Accent>
  )
}
