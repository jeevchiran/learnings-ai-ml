import { useState } from 'react'
import { Slider } from '../shared/ui.jsx'

const COLOR = '#1e3a8a'
const SUB = ['Multi-Head Attention', 'Add & Norm', 'Feed Forward', 'Add & Norm']

function Box({ children, tone = 'plain', small }) {
  const bg = tone === 'accent' ? COLOR : tone === 'mid' ? 'var(--bg-hover)' : 'var(--bg)'
  const color = tone === 'accent' ? '#fff' : 'var(--text)'
  return (
    <div style={{
      background: bg, color, border: `1px solid ${tone === 'accent' ? COLOR : 'var(--border)'}`,
      borderRadius: 5, padding: small ? '3px 8px' : '5px 10px', fontSize: small ? '0.68rem' : '0.78rem',
      textAlign: 'center', margin: '2px 0',
    }}>
      {children}
    </div>
  )
}

export default function TransformerBlockWidget() {
  const [n, setN] = useState(2)
  const [expanded, setExpanded] = useState(0)

  return (
    <div>
      <Slider label="number of stacked blocks (N)" value={n} onChange={setN} min={1} max={6} width={160} />

      <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', marginTop: '0.7rem', maxWidth: 320, marginInline: 'auto' }}>
        <Box small>token embedding + positional encoding</Box>
        {Array.from({ length: n }, (_, b) => (
          <div key={b} onClick={() => setExpanded(b)} style={{
            cursor: 'pointer', width: '100%', border: `1px dashed ${expanded === b ? COLOR : 'var(--border)'}`,
            borderRadius: 6, padding: '4px 8px', margin: '2px 0',
          }}>
            {expanded === b ? (
              <>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: COLOR, marginBottom: 2 }}>block {b + 1} (click another to expand it)</div>
                {SUB.map(s => <Box key={s} small tone={s.includes('Attention') ? 'accent' : 'mid'}>{s}</Box>)}
              </>
            ) : (
              <Box small>block {b + 1} — click to expand</Box>
            )}
          </div>
        ))}
        <Box small>linear + softmax → next-token probabilities</Box>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
        Every block is the same shape: attention lets tokens read each other, the feed-forward layer processes each
        position independently afterward. Stack N of them and the model reasons over longer, more abstract
        relationships at each level — GPT-3 stacks 96.
      </p>
    </div>
  )
}
