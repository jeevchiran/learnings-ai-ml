import { useState } from 'react'
import { TRACK } from './tlUtils.js'
import { Accent, Row, Slider, Toggle, Readout, Caption } from '../shared/ui.jsx'

const W = 380, H = 200

/* Two different jobs share one name. Residual skips (ResNet, x + f(x)) exist to
 * carry GRADIENT. Concatenative skips (U-Net, [x, f(x)]) exist to carry DETAIL.
 * The widget shows both, because conflating them is the usual confusion. */
export default function SkipConnectionWidget() {
  const [depth, setDepth] = useState(24)
  const [skips, setSkips] = useState(true)
  const [factor, setFactor] = useState(0.75)

  // gradient magnitude reaching layer L, counting backwards from the loss
  const grad = L => (skips ? Math.pow(factor, L) + 1 : Math.pow(factor, L))
  const layers = Array.from({ length: depth + 1 }, (_, i) => i)
  const sx = i => 40 + (i / depth) * (W - 56)
  const sy = g => H - 30 - (Math.log10(Math.max(1e-8, g)) + 8) / 8.3 * (H - 48)

  const atInput = grad(depth)
  const withoutSkips = Math.pow(factor, depth)

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          <Slider label="depth" value={depth} onChange={setDepth} min={4} max={60} width={110} />
          <Slider label="per-layer factor" value={factor} onChange={setFactor} min={0.4} max={1.1} step={0.05}
            fmt={v => v.toFixed(2)} width={110} />
          <Toggle label="residual skips (x + f(x))" on={skips} onChange={setSkips} />
        </Row>

        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4 }}>
            <line x1={40} y1={H - 30} x2={W - 10} y2={H - 30} stroke="var(--border,#ccc)" />
            <line x1={40} y1={12} x2={40} y2={H - 30} stroke="var(--border,#ccc)" />
            {[1, 1e-2, 1e-4, 1e-6].map(g => (
              <g key={g}>
                <line x1={40} y1={sy(g)} x2={W - 10} y2={sy(g)} stroke="rgba(128,128,128,0.14)" />
                <text x={4} y={sy(g) + 3} fontSize="8" fill="var(--text-muted,#999)">{g.toExponential(0)}</text>
              </g>
            ))}
            <path d={layers.map((L, i) => `${i ? 'L' : 'M'}${sx(L)},${sy(Math.pow(factor, L))}`).join(' ')}
              fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray={skips ? '4 3' : 'none'} />
            {skips && (
              <path d={layers.map((L, i) => `${i ? 'L' : 'M'}${sx(L)},${sy(grad(L))}`).join(' ')}
                fill="none" stroke={TRACK} strokeWidth="2.4" />
            )}
            <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--text-muted,#999)">
              layers back from the loss →
            </text>
            <text x={46} y={22} fontSize="9" fill="var(--text-muted,#999)">‖gradient‖</text>
          </svg>

          <div style={{ fontSize: '0.79rem', minWidth: 250 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Two skips, two jobs</div>
            <table style={{ borderCollapse: 'collapse', fontSize: '0.76rem' }}>
              <tbody>
                <tr><td style={{ padding: '3px 10px 3px 0', fontWeight: 700, color: TRACK }}>residual</td>
                    <td style={{ padding: '3px 0' }}><code>x + f(x)</code> — same shape, <strong>added</strong></td></tr>
                <tr><td /><td style={{ padding: '0 0 6px', opacity: 0.75 }}>carries gradient. ResNet. Channels unchanged.</td></tr>
                <tr><td style={{ padding: '3px 10px 3px 0', fontWeight: 700, color: '#2563eb' }}>concat</td>
                    <td style={{ padding: '3px 0' }}><code>[x, f(x)]</code> — <strong>stacked</strong> on channels</td></tr>
                <tr><td /><td style={{ padding: '0', opacity: 0.75 }}>carries detail. U-Net. Channels double, so the next conv is wider.</td></tr>
              </tbody>
            </table>
            <p style={{ fontSize: '0.75rem', opacity: 0.78, marginTop: '0.6rem', lineHeight: 1.65 }}>
              The <code>+1</code> in the residual curve is the identity path's derivative. Because
              <code> d/dx (x + f(x)) = 1 + f′(x)</code>, the gradient can never be smaller than the identity
              term — so it cannot vanish through depth, whatever <code>f</code> does.
            </p>
          </div>
        </div>

        <Readout items={[
          ['depth', depth],
          ['gradient at the input', atInput.toExponential(2)],
          ['without skips', withoutSkips.toExponential(2)],
          ['ratio', `${(atInput / withoutSkips).toExponential(1)}×`],
        ]} />

        <Caption>
          Set the factor to 0.75 and the depth to 50, then toggle the skips off: the gradient reaching the first
          layer falls to around 1e-7 — those layers are effectively frozen at their initial values, which is what
          "vanishing gradient" means in practice. Turn skips on and it sits at ~1, independent of depth.
          <br /><br />
          U-Net's long skips are the <em>other</em> kind. They are not fixing gradients — they concatenate the
          encoder's high-resolution feature map onto the decoder's upsampled one, handing back the exact edge
          positions that pooling destroyed. That is why removing them blurs boundaries rather than breaking
          training.
        </Caption>
      </div>
    </Accent>
  )
}
