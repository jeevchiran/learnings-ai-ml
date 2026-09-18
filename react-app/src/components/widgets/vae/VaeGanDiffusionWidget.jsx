import { useState } from 'react'
import { Row, Btn, Accent } from '../shared/ui.jsx'

const COLOR = '#6366f1'

/* Three families scored on the axes that actually differ. A table would say the
 * same thing; the bars make the trade-off shape visible at a glance, which is
 * the point of a comparison module. */

const AXES = ['sample quality', 'sampling speed', 'mode coverage', 'training stability', 'usable latent space']

const FAMILIES = {
  VAE: {
    scores: [2, 5, 5, 5, 5],
    note: 'Trains reliably, samples in one pass, and gives a latent space you can interpolate through. The cost is blur: averaging over a distribution of plausible reconstructions produces something that is nobody’s idea of a sharp image.',
  },
  GAN: {
    scores: [5, 5, 2, 1, 3],
    note: 'Sharpest samples and instant sampling, because a discriminator punishes blur directly. The cost is a saddle-point optimisation that can collapse onto a handful of modes and is famously hard to keep stable.',
  },
  Diffusion: {
    scores: [5, 1, 5, 5, 2],
    note: 'Sharp and diverse with a plain regression loss, so training is as stable as the VAE. The cost is paid at sampling time: many sequential denoising steps instead of one forward pass.',
  },
}
const KEYS = Object.keys(FAMILIES)

export default function VaeGanDiffusionWidget() {
  const [k, setK] = useState(KEYS[0])
  const f = FAMILIES[k]

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.7rem' }}>
          {KEYS.map(key => <Btn key={key} onClick={() => setK(key)} primary={k === key}>{key}</Btn>)}
        </Row>

        {AXES.map((axis, i) => (
          <div key={axis} style={{ marginBottom: '0.45rem' }}>
            <div style={{ fontSize: '0.75rem', marginBottom: 2 }}>{axis}</div>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: 5 }, (_, j) => (
                <div key={j} style={{
                  flex: 1, height: 10, borderRadius: 2,
                  background: j < f.scores[i] ? COLOR : 'var(--bg-hover)',
                  opacity: j < f.scores[i] ? 1 : 1, transition: 'background .2s',
                }} />
              ))}
            </div>
          </div>
        ))}

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem', lineHeight: 1.6 }}>
          {f.note}
        </p>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.6 }}>
          Click between the three and watch which bar drops. No family is best on every axis, which is why all
          three are still in use rather than one having won.
        </p>
      </div>
    </Accent>
  )
}
