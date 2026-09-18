import { useState } from 'react'
import { Row, Btn, Toggle, Accent } from '../shared/ui.jsx'

const COLOR = '#a21caf'
const WARN = '#b45309'

/* The label has to reach both networks. Letting the reader switch it off on the
 * discriminator side shows why: the generator is then free to ignore it, because
 * nothing ever checks. */

export default function ConditionalLabelWidget() {
  const [label, setLabel] = useState('cat')
  const [toD, setToD] = useState(true)

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          {['cat', 'dog', 'bird'].map(l => (
            <Btn key={l} onClick={() => setLabel(l)} primary={label === l}>{l}</Btn>
          ))}
          <Toggle label="also give the label to the discriminator" on={toD} onChange={setToD} />
        </Row>

        <svg viewBox="0 0 400 150" style={{ width: '100%', maxWidth: 400, height: 'auto' }}
          role="img" aria-label={toD
            ? "The label reaches both the generator and the discriminator, so the discriminator can reject a sample that does not match its label."
            : "The label reaches only the generator, so the discriminator cannot tell whether a sample matches its label and the generator is free to ignore it."}>
          <defs>
            <marker id="cgArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke={COLOR} strokeWidth={1.8} strokeLinecap="round" />
            </marker>
            <marker id="cgWarn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke={WARN} strokeWidth={1.8} strokeLinecap="round" />
            </marker>
          </defs>

          <rect x={8} y={12} width={78} height={30} rx={5} fill={COLOR} />
          <text x={47} y={32} fontSize={12} textAnchor="middle" fill="#fff" fontFamily="monospace">{label}</text>
          <text x={47} y={56} fontSize={9.5} textAnchor="middle" fill="var(--text-muted)">label</text>

          <rect x={8} y={78} width={78} height={30} rx={5} fill="var(--bg-hover)" stroke="var(--border)" />
          <text x={47} y={98} fontSize={11} textAnchor="middle" fill="var(--text)">noise z</text>

          <rect x={120} y={45} width={96} height={46} rx={6} fill="rgba(162,28,175,0.12)" stroke={COLOR} />
          <text x={168} y={73} fontSize={12} textAnchor="middle" fill={COLOR}>generator</text>

          <line x1={86} y1={27} x2={116} y2={56} stroke={COLOR} strokeWidth={1.6} markerEnd="url(#cgArrow)" />
          <line x1={86} y1={93} x2={116} y2={80} stroke={COLOR} strokeWidth={1.6} markerEnd="url(#cgArrow)" />

          <line x1={216} y1={68} x2={254} y2={68} stroke={COLOR} strokeWidth={1.6} markerEnd="url(#cgArrow)" />
          <rect x={258} y={45} width={110} height={46} rx={6}
            fill={toD ? 'rgba(162,28,175,0.12)' : 'rgba(169,103,12,0.10)'} stroke={toD ? COLOR : WARN} />
          <text x={313} y={67} fontSize={12} textAnchor="middle" fill={toD ? COLOR : WARN}>discriminator</text>
          <text x={313} y={82} fontSize={9} textAnchor="middle" fill="var(--text-muted)">
            {toD ? 'real AND matching?' : 'real? (label unseen)'}
          </text>

          {toD && (
            <path d="M47,12 L47,4 L313,4 L313,41" fill="none" stroke={COLOR} strokeWidth={1.5}
              strokeDasharray="5 4" markerEnd="url(#cgArrow)" />
          )}
          {!toD && (
            <path d="M47,12 L47,4 L313,4 L313,41" fill="none" stroke={WARN} strokeWidth={1.3}
              strokeDasharray="2 6" opacity={0.5} />
          )}
        </svg>

        <p style={{ fontSize: '0.78rem', color: toD ? 'var(--text-muted)' : WARN, marginTop: '0.5rem', lineHeight: 1.6 }}>
          {toD
            ? 'With the label on both sides, the discriminator judges two things at once: is this real, and does it match the label it claims to be. A convincing cat submitted as a dog is rejected, so the generator has to honour the label.'
            : 'Switch the label off on the discriminator side and nothing checks whether the output matches. The generator can produce whatever it finds easiest and still pass, so the conditioning quietly stops working while the loss keeps looking healthy.'}
        </p>
      </div>
    </Accent>
  )
}
