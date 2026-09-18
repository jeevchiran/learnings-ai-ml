import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#a21caf'
const ALT = '#0f766e'

/* Two distributions dragged apart. Once they stop overlapping, the Jensen-Shannon
 * divergence pins at a constant and its gradient dies, while the Wasserstein
 * distance keeps growing linearly. That is the entire case for WGAN in one slider. */

const W = 340, H = 120, PAD = 22

function bump(cx, color, opacity) {
  const pts = []
  for (let i = 0; i <= 40; i++) {
    const x = cx - 1 + (i / 40) * 2
    const y = Math.exp(-((x - cx) ** 2) / 0.18)
    pts.push([x, y])
  }
  return { pts, color, opacity }
}

export default function WassersteinVsJsWidget() {
  const [gap, setGap] = useState(0.6)

  const overlap = Math.max(0, 1 - gap / 1.6)
  const js = overlap > 0.01 ? Math.log(2) * (1 - overlap) : Math.log(2)
  const wass = gap

  const toX = v => PAD + ((v + 2.6) / 5.2) * (W - 2 * PAD)
  const toY = v => H - PAD - v * (H - 2 * PAD)
  const draw = cx => 'M' + bump(cx).pts.map(([x, y]) => `${toX(x)},${toY(y)}`).join(' L')

  const disjoint = overlap <= 0.01

  return (
    <Accent value={COLOR}>
      <div>
        <Slider label="distance between the two distributions" value={gap} onChange={setGap}
          min={0} max={2.4} step={0.05} fmt={v => v.toFixed(2)} width={190} />

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', marginTop: '0.5rem' }}
          role="img" aria-label={"Two bell curves separated by " + gap.toFixed(2) + ". When they no longer overlap, the Jensen-Shannon divergence stops changing while the Wasserstein distance keeps growing."}>
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <path d={draw(-gap / 2)} fill="none" stroke={COLOR} strokeWidth={2} />
          <path d={draw(gap / 2)} fill="none" stroke={ALT} strokeWidth={2} strokeDasharray="5 4" />
          <text x={toX(-gap / 2)} y={PAD - 4} fontSize={10} textAnchor="middle" fill={COLOR}>real</text>
          <text x={toX(gap / 2)} y={PAD - 4} fontSize={10} textAnchor="middle" fill={ALT}>generated</text>
        </svg>

        <Readout items={[
          ['Jensen-Shannon', js.toFixed(3)],
          ['Wasserstein', wass.toFixed(3)],
          ['overlap', overlap.toFixed(2)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: disjoint ? COLOR : 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {disjoint
            ? 'The distributions no longer overlap. Jensen-Shannon has pinned at log 2 and stays there however much further you drag them apart, so its gradient is zero and the generator is told nothing about which direction to move. Wasserstein keeps rising, so it still points the way home.'
            : 'While the two overlap, both measures respond to the gap and either would train. Keep dragging until the curves separate — that is where they part company.'}
        </p>
      </div>
    </Accent>
  )
}
