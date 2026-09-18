import { useState } from 'react'
import { Row, Btn, Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#be185d'

/* Schedules are usually described in prose and then used as a config line. The
 * shapes are the whole point, and three of them on one axis is enough. */

const W = 340, H = 150, PAD = 30
const EPOCHS = 60

const SCHEDULES = {
  constant: { f: () => 1, note: 'No schedule at all. Simple, and it is what people reach for first — but a rate large enough to make early progress is usually too large to settle at the end.' },
  step: { f: e => Math.pow(0.1, Math.floor(e / 20)), note: 'Drop by a factor of ten at fixed milestones. The classic image-classification recipe: train fast, then twice more carefully. The cliffs are visible in the loss curve as sudden improvements.' },
  cosine: { f: e => 0.5 * (1 + Math.cos(Math.PI * e / EPOCHS)), note: 'A smooth decay to nearly zero. No milestones to tune and no discontinuities, which is why it has largely replaced step decay in modern recipes.' },
  warmup: { f: e => (e < 6 ? e / 6 : 0.5 * (1 + Math.cos(Math.PI * (e - 6) / (EPOCHS - 6)))), note: 'Ramp up first, then decay. Very deep or very wide models are unstable in the first few hundred steps, and starting small lets the weights settle before the rate is pushed up.' },
}
const KEYS = Object.keys(SCHEDULES)

export default function LrScheduleWidget() {
  const [k, setK] = useState('cosine')
  const [base, setBase] = useState(0.1)
  const s = SCHEDULES[k]

  const toX = e => PAD + (e / EPOCHS) * (W - 2 * PAD)
  const toY = v => H - PAD - v * (H - 2 * PAD)
  const path = 'M' + Array.from({ length: EPOCHS + 1 }, (_, e) => `${toX(e)},${toY(s.f(e))}`).join(' L')

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.5rem' }}>
          {KEYS.map(key => <Btn key={key} onClick={() => setK(key)} primary={k === key}>{key}</Btn>)}
        </Row>
        <Slider label="base learning rate" value={base} onChange={setBase} min={0.001} max={0.5} step={0.001}
          fmt={v => v.toFixed(3)} width={160} />

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', marginTop: '0.5rem' }}
          role="img" aria-label={"Learning rate against epoch for the " + k + " schedule."}>
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <line x1={PAD} y1={PAD - 12} x2={PAD} y2={H - PAD} stroke="var(--border)" />
          <text x={W - PAD} y={H - 9} fontSize={9.5} textAnchor="end" fill="var(--text-muted)">epoch →</text>
          <text x={PAD - 6} y={PAD - 16} fontSize={9.5} fill="var(--text-muted)">learning rate</text>
          <path d={path} fill="none" stroke={COLOR} strokeWidth={2} />
        </svg>

        <Readout items={[
          ['rate at epoch 0', (base * s.f(0)).toFixed(4)],
          ['rate at epoch 30', (base * s.f(30)).toFixed(4)],
          ['rate at the end', (base * s.f(EPOCHS)).toFixed(4)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {s.note}
        </p>
      </div>
    </Accent>
  )
}
