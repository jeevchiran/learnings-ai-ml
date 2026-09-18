import { useState } from 'react'
import { Toggle, Accent } from '../shared/ui.jsx'

const COLOR = '#a21caf'
const ALT = '#0f766e'
const WARN = '#b45309'

/* The round trip, with the option to remove the adversarial loss. Removing it
 * shows the identity-mapping trap: a pair of generators that change nothing
 * satisfies cycle consistency perfectly and translates nothing. */

export default function CycleConsistencyWidget() {
  const [adv, setAdv] = useState(true)

  return (
    <Accent value={COLOR}>
      <div>
        <Toggle label="keep the adversarial loss" on={adv} onChange={setAdv} />

        <svg viewBox="0 0 380 160" style={{ width: '100%', maxWidth: 380, height: 'auto', marginTop: '0.6rem' }}
          role="img" aria-label={adv
            ? "A photo is translated to a painting and back to a photo. The adversarial loss forces the middle image to look like a real painting."
            : "Without the adversarial loss, both generators can copy their input unchanged and still satisfy the round trip perfectly."}>
          <defs>
            <marker id="ccArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke={COLOR} strokeWidth={1.8} strokeLinecap="round" />
            </marker>
          </defs>

          <rect x={10} y={40} width={76} height={54} rx={5} fill="var(--bg-hover)" stroke="var(--border)" />
          <text x={48} y={64} fontSize={11} textAnchor="middle" fill="var(--text)">photo</text>
          <text x={48} y={80} fontSize={9} textAnchor="middle" fill="var(--text-muted)">input</text>

          <line x1={86} y1={52} x2={146} y2={52} stroke={COLOR} strokeWidth={1.7} markerEnd="url(#ccArrow)" />
          <text x={116} y={44} fontSize={9.5} textAnchor="middle" fill={COLOR}>G</text>

          <rect x={150} y={40} width={80} height={54} rx={5}
            fill={adv ? 'rgba(14,128,116,0.14)' : 'rgba(169,103,12,0.14)'}
            stroke={adv ? ALT : WARN} strokeDasharray={adv ? undefined : '5 4'} />
          <text x={190} y={64} fontSize={11} textAnchor="middle" fill={adv ? ALT : WARN}>
            {adv ? 'painting' : 'photo again'}
          </text>
          <text x={190} y={80} fontSize={9} textAnchor="middle" fill="var(--text-muted)">
            {adv ? 'judged by a critic' : 'nothing checks it'}
          </text>

          <line x1={230} y1={82} x2={290} y2={82} stroke={COLOR} strokeWidth={1.7} markerEnd="url(#ccArrow)" />
          <text x={260} y={100} fontSize={9.5} textAnchor="middle" fill={COLOR}>F</text>

          <rect x={294} y={40} width={76} height={54} rx={5} fill="var(--bg-hover)" stroke="var(--border)" />
          <text x={332} y={64} fontSize={11} textAnchor="middle" fill="var(--text)">photo</text>
          <text x={332} y={80} fontSize={9} textAnchor="middle" fill="var(--text-muted)">reconstructed</text>

          <path d="M48,94 L48,132 L332,132 L332,98" fill="none" stroke={COLOR} strokeWidth={1.4} strokeDasharray="4 4" />
          <text x={190} y={147} fontSize={10} textAnchor="middle" fill={COLOR}>cycle loss: these two must match</text>
        </svg>

        <p style={{ fontSize: '0.78rem', color: adv ? 'var(--text-muted)' : WARN, marginTop: '0.5rem', lineHeight: 1.6 }}>
          {adv
            ? 'Two losses hold this together. The cycle loss says the round trip must return the original, and the adversarial loss says the middle image must pass as a genuine painting. Neither works alone.'
            : 'Drop the adversarial loss and watch the trap appear: if both generators simply copy their input, the round trip is perfect and the cycle loss is zero. The model has satisfied its objective completely while translating nothing at all.'}
        </p>
      </div>
    </Accent>
  )
}
