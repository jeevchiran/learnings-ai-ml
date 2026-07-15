import { useState } from 'react'

const COLOR = '#f59e0b'
const DONE = '#16a34a'

// A chain of transformations (lazy) ending in an action (triggers execution).
const STEPS = [
  { op: 'textFile("logs")', kind: 'source' },
  { op: '.filter(is_error)', kind: 'transform' },
  { op: '.map(parse_line)', kind: 'transform' },
  { op: '.filter(recent)', kind: 'transform' },
  { op: '.count()', kind: 'action' },
]

export default function LazyEvaluationWidget() {
  const [ran, setRan] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {STEPS.map((s, i) => {
          const isAction = s.kind === 'action'
          const active = ran || !isAction  // transforms always "defined"; execution highlight only after run
          const executed = ran
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: 22, textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{i + 1}</span>
              <code style={{ flex: 1, padding: '0.35rem 0.6rem', borderRadius: 5, fontSize: '0.82rem',
                border: `1.5px solid ${isAction ? COLOR : 'var(--border)'}`,
                background: executed ? `${DONE}18` : isAction ? `${COLOR}18` : 'var(--bg-hover)',
                color: 'var(--text)' }}>
                {s.op}
              </code>
              <span style={{ width: 96, fontSize: '0.72rem', color: isAction ? COLOR : 'var(--text-muted)' }}>
                {isAction ? 'ACTION' : 'transform (lazy)'}
                {executed && !isAction && <span style={{ color: DONE }}> ✓</span>}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem', alignItems: 'center' }}>
        <button onClick={() => setRan(true)} disabled={ran}
          style={{ padding: '0.35rem 0.9rem', borderRadius: 5, border: 'none', cursor: ran ? 'default' : 'pointer',
            background: ran ? 'var(--border)' : COLOR, color: '#fff', fontWeight: 600, fontSize: '0.82rem' }}>
          {ran ? 'Executed ✓' : 'Trigger .count()'}
        </button>
        {ran && <button onClick={() => setRan(false)} style={{ padding: '0.35rem 0.7rem', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.8rem' }}>Reset</button>}
      </div>

      <div style={{ marginTop: '0.7rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        {ran
          ? <>The action fired the whole DAG at once — Spark fused the three transforms into one pass over the data (no intermediate copies written).</>
          : <>The transforms only <em>record</em> a plan — nothing has run yet. Spark waits for an <strong style={{ color: COLOR }}>action</strong> (count, collect, save), then optimizes and executes the entire chain.</>
        }
      </div>
    </div>
  )
}
