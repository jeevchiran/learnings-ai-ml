import { useState } from 'react'
import { Row, Btn, Toggle } from '../shared/ui.jsx'

/* Data-flow diagrams for the three architectures. The point of showing flow
 * rather than just stack diagrams: decoder-only only makes sense once you can
 * see the output looping back into the same sequence it was read from, and
 * cross-attention only makes sense once you can see K and V arriving from a
 * different box than Q. */

const ENCDEC = '#3454D1'
const DEC = '#A23E7B'
const ENC = '#0E8074'
const WARN = '#A9670C'

const N = 6

function Box({ x, y, w, h, title, sub, stroke, fill, bold }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={7}
        fill={fill || 'var(--bg-hover)'} stroke={stroke || 'var(--border)'} strokeWidth={1.2} />
      <text x={x + 13} y={y + 22} fontSize={12.5} fontWeight={bold ? 600 : 500} fill={stroke || 'var(--text)'}>
        {title}
      </text>
      {sub && (
        <text x={x + 13} y={y + 39} fontSize={11} fill={stroke ? stroke : 'var(--text-muted)'} opacity={stroke ? 0.85 : 1}>
          {sub}
        </text>
      )}
    </g>
  )
}

function Arrow({ x1, y1, x2, y2, color, dashed, id }) {
  const c = color || 'var(--text-muted)'
  return (
    <>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={1.5}
        strokeDasharray={dashed ? '5 4' : undefined} markerEnd={`url(#${id})`} />
    </>
  )
}

function EncDecFlow() {
  return (
    <svg viewBox="0 0 640 285" style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img" aria-label="The input sequence passes through the encoder stack to produce the encoder output. The decoder stack, fed by its own prior outputs, pulls keys and values from that encoder output through cross-attention while producing the next token.">
      <Box x={12} y={58} w={140} h={52} title="input sequence" sub="I love cats" />
      <Arrow id="ed1" x1={152} y1={84} x2={186} y2={84} />
      <Box x={188} y={40} w={215} h={88} title="encoder ×N" sub="bidirectional self-attention" stroke={ENCDEC} fill="rgba(52,84,209,0.10)" bold />
      <Arrow id="ed2" x1={403} y1={84} x2={437} y2={84} />
      <Box x={439} y={58} w={145} h={52} title="encoder output" sub="1 vector / input token" />

      {/* the only place the two stacks meet */}
      <path d="M511,110 L511,146 L340,146 L340,170" fill="none" stroke={ENCDEC} strokeWidth={1.7}
        strokeDasharray="5 4" markerEnd="url(#ed3)" />
      <defs>
        <marker id="ed3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke={ENCDEC} strokeWidth={1.8} strokeLinecap="round" />
        </marker>
      </defs>
      <text x={348} y={142} fontSize={12} fontFamily="var(--font-mono, monospace)" fontWeight={600} fill={ENCDEC}>K, V</text>

      <Box x={12} y={192} w={158} h={52} title="prior outputs" sub="j'aime les" />
      <Arrow id="ed4" x1={170} y1={218} x2={204} y2={218} />
      <Box x={206} y={170} w={240} h={88} title="decoder ×N" sub="masked self-attn → cross-attn" stroke={DEC} fill="rgba(162,62,123,0.10)" bold />
      <text x={219} y={247} fontSize={11} fill={DEC} opacity={0.85}>Q comes from here</text>
      <Arrow id="ed5" x1={446} y1={218} x2={480} y2={218} />
      <Box x={482} y={192} w={120} h={52} title="next token" sub="chats" />
    </svg>
  )
}

function DecOnlyFlow() {
  return (
    <svg viewBox="0 0 640 220" style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img" aria-label="A single sequence containing the prompt and the output so far passes through a decoder stack using causal self-attention to predict the next token, which loops back into that same sequence.">
      <Box x={12} y={62} w={196} h={56} title="prompt + output so far" sub="one shared sequence" />
      <Arrow id="d1" x1={208} y1={90} x2={242} y2={90} />
      <Box x={244} y={44} w={215} h={90} title="decoder ×N" sub="causal self-attention" stroke={DEC} fill="rgba(162,62,123,0.10)" bold />
      <text x={257} y={122} fontSize={11} fill={DEC} opacity={0.85}>no cross-attention layer</text>
      <Arrow id="d2" x1={459} y1={90} x2={493} y2={90} />
      <Box x={495} y={62} w={118} h={56} title="next token" sub="appended" />

      <path d="M554,118 C554,172 110,172 110,118" fill="none" stroke={DEC} strokeWidth={1.7}
        strokeDasharray="5 4" markerEnd="url(#d3)" />
      <defs>
        <marker id="d3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke={DEC} strokeWidth={1.8} strokeLinecap="round" />
        </marker>
      </defs>
      <text x={228} y={196} fontSize={11.5} fill="var(--text-muted)">fed back in, one token at a time</text>
    </svg>
  )
}

function EncOnlyFlow() {
  return (
    <svg viewBox="0 0 700 175" style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img" aria-label="A CLS token plus the input tokens pass through a bidirectional encoder stack. The CLS token's final vector, summarising the sequence, feeds a classifier head that produces a label.">
      <Box x={12} y={68} w={140} h={56} title="[CLS] + input" sub="the bank was…" />
      <Arrow id="e1" x1={152} y1={96} x2={186} y2={96} />
      <Box x={188} y={50} w={205} h={92} title="encoder ×N" sub="bidirectional self-attention" stroke={ENC} fill="rgba(14,128,116,0.10)" bold />
      <Arrow id="e2" x1={393} y1={96} x2={427} y2={96} />
      <Box x={429} y={68} w={132} h={56} title="[CLS] vector" sub="sequence summary" />
      <Arrow id="e3" x1={561} y1={96} x2={595} y2={96} />
      <Box x={597} y={68} w={92} h={56} title="classifier" sub="→ label" stroke={WARN} fill="rgba(169,103,12,0.10)" bold />
    </svg>
  )
}

function Pattern({ kind, color }) {
  const size = 14
  return (
    <svg width={N * size + 2} height={N * size + 2} style={{ display: 'block' }}>
      {Array.from({ length: N }, (_, r) =>
        Array.from({ length: N }, (_, c) => {
          const on = kind === 'causal' ? c <= r : true
          return (
            <rect key={`${r}-${c}`} x={c * size + 1} y={r * size + 1} width={size - 1} height={size - 1}
              fill={on ? color : 'transparent'} opacity={on ? 0.7 : 1}
              stroke="var(--border)" strokeWidth={0.5} />
          )
        })
      )}
    </svg>
  )
}

const VARIANTS = {
  'Encoder-decoder': {
    accent: ENCDEC,
    Flow: EncDecFlow,
    caption: 'The encoder runs once over the full input; the decoder runs repeatedly. Cross-attention is the only place the two stacks meet — queries from the decoder, keys and values from the encoder output.',
    patterns: [
      { kind: 'bi', label: 'encoder: bidirectional', color: ENCDEC },
      { kind: 'causal', label: 'decoder: causal', color: DEC },
    ],
  },
  'Decoder-only': {
    accent: DEC,
    Flow: DecOnlyFlow,
    caption: 'No separate encoder pass — the prompt is just the earliest positions of the same sequence the model is still writing. Causal masking already lets later tokens see all of it.',
    patterns: [{ kind: 'causal', label: 'causal only', color: DEC }],
  },
  'Encoder-only': {
    accent: ENC,
    Flow: EncOnlyFlow,
    caption: 'Nothing is generated. The [CLS] token starts with no meaning of its own, and bidirectional attention across N layers lets it accumulate the whole sequence into a usable summary.',
    patterns: [{ kind: 'bi', label: 'bidirectional only', color: ENC }],
  },
}

export default function VariantsWidget() {
  const [name, setName] = useState('Encoder-decoder')
  const [showPattern, setShowPattern] = useState(false)
  const v = VARIANTS[name]
  const Flow = v.Flow

  return (
    <div>
      <Row style={{ marginBottom: '0.7rem' }}>
        {Object.keys(VARIANTS).map(k => (
          <Btn key={k} onClick={() => setName(k)} primary={name === k}>{k}</Btn>
        ))}
        <Toggle label="attention pattern" on={showPattern} onChange={setShowPattern} />
      </Row>

      <Flow />

      {showPattern && (
        <div style={{ display: 'flex', gap: '1.4rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
          {v.patterns.map(p => (
            <div key={p.label} style={{ textAlign: 'center' }}>
              <Pattern kind={p.kind} color={p.color} />
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 3 }}>{p.label}</div>
            </div>
          ))}
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', maxWidth: '30ch', margin: 0, alignSelf: 'center' }}>
            Row = querying position, column = attended position. A filled cell means that pair is allowed to attend.
          </p>
        </div>
      )}

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem', lineHeight: 1.6, maxWidth: '62ch' }}>
        {v.caption}
      </p>
    </div>
  )
}
