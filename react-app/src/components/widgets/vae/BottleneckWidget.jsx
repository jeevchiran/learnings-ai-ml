import { useState } from 'react'
import { Slider, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#6366f1'
const DIM = 784   // 28x28

/* A bottleneck is a claim about how much structure the data has. Shrinking the
 * code visibly trades fidelity for compression, which is the whole reason a
 * narrow middle layer forces the network to learn something rather than copy. */

export default function BottleneckWidget() {
  const [k, setK] = useState(32)
  const ratio = DIM / k
  // A rough stand-in for reconstruction quality: information retained saturates,
  // because the data's own intrinsic dimension is far below 784.
  const quality = 1 - Math.exp(-k / 12)

  return (
    <Accent value={COLOR}>
      <div>
        <Slider label="code size" value={k} onChange={setK} min={1} max={128} width={190} />

        <svg viewBox="0 0 400 120" style={{ width: '100%', maxWidth: 400, height: 'auto', marginTop: '0.6rem' }}
          role="img" aria-label={"An encoder narrows 784 inputs to a code of " + k + " numbers, and a decoder expands it back to 784."}>
          <rect x={6} y={20} width={44} height={80} rx={4} fill="var(--bg-hover)" stroke="var(--border)" />
          <text x={28} y={64} fontSize={10.5} textAnchor="middle" fill="var(--text)">784</text>

          <path d="M50,20 L170,55 L170,85 L50,100 Z" fill={COLOR} opacity={0.18} stroke={COLOR} />
          <text x={108} y={16} fontSize={10} textAnchor="middle" fill="var(--text-muted)">encoder</text>

          <rect x={172} y={55 - Math.min(30, k / 3)} width={26} height={30 + 2 * Math.min(30, k / 3)} rx={3}
            fill={COLOR} />
          <text x={185} y={112} fontSize={10.5} textAnchor="middle" fill={COLOR} fontFamily="monospace">{k}</text>

          <path d="M200,55 L200,85 L320,100 L320,20 Z" fill={COLOR} opacity={0.18} stroke={COLOR} />
          <text x={260} y={16} fontSize={10} textAnchor="middle" fill="var(--text-muted)">decoder</text>

          <rect x={322} y={20} width={44} height={80} rx={4} fill="var(--bg-hover)" stroke="var(--border)" />
          <text x={344} y={64} fontSize={10.5} textAnchor="middle" fill="var(--text)">784</text>
        </svg>

        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.76rem', marginBottom: 3 }}>reconstruction fidelity</div>
          <div style={{ height: 10, background: 'var(--bg-hover)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: `${quality * 100}%`, height: '100%', background: COLOR, transition: 'width .2s' }} />
          </div>
        </div>

        <Readout items={[
          ['compression', `${ratio.toFixed(0)}x`],
          ['code size', `${k} numbers`],
        ]} />

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Widen the code and fidelity climbs, then flattens. The flattening is the point: past a certain width
          the extra dimensions have nothing left to carry, because the data really does live on a
          low-dimensional surface. A code narrow enough to hurt is what forces the network to find that surface
          instead of memorising pixels.
        </p>
      </div>
    </Accent>
  )
}
