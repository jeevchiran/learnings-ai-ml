import { useState } from 'react'
import { TRACK, nms, iou } from './cvUtils.js'
import { Row, Slider, Btn, Readout, Caption } from './cvUi.jsx'

const W = 400, H = 230

/* Three real objects, six raw detections — the usual output of a dense detector
 * before anything has cleaned it up. The scene is built so that no single IoU
 * threshold is correct: A/B/C are duplicates on ONE object at IoU 0.67 and 0.81,
 * while E and F are TWO occluding objects at IoU 0.56. */
const RAW = [
  { id: 'A', score: 0.94, x: 46, y: 44, w: 96, h: 118 },
  { id: 'B', score: 0.88, x: 58, y: 54, w: 96, h: 118 },
  { id: 'C', score: 0.79, x: 38, y: 36, w: 108, h: 130 },
  { id: 'E', score: 0.83, x: 226, y: 56, w: 84, h: 112 },
  { id: 'F', score: 0.71, x: 250, y: 56, w: 84, h: 112 },
  { id: 'G', score: 0.35, x: 150, y: 150, w: 62, h: 66 },
]

export default function NMSWidget() {
  const [thr, setThr] = useState(0.5)
  const [minScore, setMinScore] = useState(0.3)
  const [step, setStep] = useState(-1)

  const pool = RAW.filter(b => b.score >= minScore)
  const { kept, steps } = nms(pool, thr)
  const shown = step < 0 ? [] : steps.slice(0, step + 1)
  const keptSoFar = new Set(shown.map(s => s.keep))
  const killedSoFar = new Set(shown.flatMap(s => s.killed.map(k => k.id)))
  const done = step >= steps.length - 1

  return (
    <div>
      <Row style={{ marginBottom: '0.5rem' }}>
        <Slider label="IoU threshold" value={thr} onChange={v => { setThr(v); setStep(-1) }} min={0.05} max={0.95} step={0.05} fmt={v => v.toFixed(2)} />
        <Slider label="score cut" value={minScore} onChange={v => { setMinScore(v); setStep(-1) }} min={0} max={0.9} step={0.05} fmt={v => v.toFixed(2)} />
        <Btn onClick={() => setStep(-1)}>↺ reset</Btn>
        <Btn primary onClick={() => setStep(s => Math.min(s + 1, steps.length - 1))} disabled={done}>step →</Btn>
        <Btn onClick={() => setStep(steps.length - 1)} disabled={done}>run all</Btn>
      </Row>

      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4, background: 'rgba(128,128,128,0.06)' }}>
          <ellipse cx={95} cy={105} rx={40} ry={54} fill="rgba(128,128,128,0.32)" />
          {/* two objects, heavily occluding — the crowd case */}
          <ellipse cx={268} cy={112} rx={32} ry={52} fill="rgba(128,128,128,0.32)" />
          <ellipse cx={292} cy={112} rx={32} ry={52} fill="rgba(128,128,128,0.42)" />
          {pool.map(b => {
            const dead = killedSoFar.has(b.id)
            const win = keptSoFar.has(b.id)
            const pending = step < 0
            return (
              <g key={b.id} opacity={dead ? 0.3 : 1}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="none"
                  stroke={dead ? '#dc2626' : win ? TRACK : 'var(--text-muted,#888)'}
                  strokeWidth={win ? 3 : 1.6}
                  strokeDasharray={dead ? '4 3' : pending ? '3 3' : 'none'} />
                <text x={b.x + 3} y={b.y + 13} fontSize="11" fontWeight="700"
                  fill={dead ? '#dc2626' : win ? TRACK : 'var(--text-muted,#888)'}>
                  {b.id} {b.score.toFixed(2)}{dead ? ' ✕' : win ? ' ✓' : ''}
                </text>
              </g>
            )
          })}
        </svg>

        <div style={{ fontSize: '0.79rem', minWidth: 240 }}>
          <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>
            greedy loop {step < 0 ? '(not started)' : `— step ${step + 1} / ${steps.length}`}
          </div>
          {steps.map((s, i) => (
            <div key={s.keep} style={{
              padding: '0.3rem 0.5rem', marginBottom: 3, borderRadius: 4, fontFamily: 'monospace', fontSize: '0.76rem',
              opacity: i <= step ? 1 : 0.35,
              border: `1px solid ${i === step ? TRACK : 'var(--border,#d4d4d8)'}`,
              background: i === step ? 'rgba(21,128,61,0.10)' : 'transparent',
            }}>
              keep <strong style={{ color: TRACK }}>{s.keep}</strong> ({s.score.toFixed(2)})
              {s.killed.length
                ? <> → kill {s.killed.map(k => `${k.id}@IoU ${k.iou.toFixed(2)}`).join(', ')}</>
                : <> → nothing overlaps it</>}
            </div>
          ))}
          <p style={{ fontSize: '0.74rem', opacity: 0.72, marginTop: '0.45rem', lineHeight: 1.6 }}>
            Sort by score, take the top box, delete everything overlapping it more than the threshold,
            repeat. Class-wise: a person box never suppresses a dog box.
          </p>
        </div>
      </div>

      <Readout items={[
        ['candidates', pool.length],
        ['after NMS', kept.length],
        ['kept', kept.map(b => b.id).join(', ') || '—'],
        ['IoU(A,B)', iou(RAW[0], RAW[1]).toFixed(3)],
        ['IoU(A,C)', iou(RAW[0], RAW[2]).toFixed(3)],
        ['IoU(E,F)', iou(RAW[3], RAW[4]).toFixed(3)],
      ]} />

      <Caption>
        The scene has <strong>three</strong> objects. At the default 0.50, A correctly deletes its two
        duplicates — but it also deletes <strong>F</strong>, which is a second, occluded object, because
        NMS only measures overlap and has no idea how many objects exist. Raise the threshold to
        <strong> 0.70</strong> and F comes back, but now B survives as a duplicate on the left object.
        Only 0.60 happens to be right <em>for this scene</em>, and nothing tells you that in advance.
        Soft-NMS decays the neighbour's score instead of deleting it, for exactly this reason.
        Note also that <strong>G</strong> — a lone false positive overlapping nothing — survives every
        threshold: NMS cannot remove it, only the score cut can.
      </Caption>
    </div>
  )
}
