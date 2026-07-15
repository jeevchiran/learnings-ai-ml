import { useState } from 'react'

const COLOR = '#f59e0b'
const SAVE = '#16a34a'

// Same expensive lineage reused by N actions, with vs without cache().
export default function CachingWidget() {
  const [actions, setActions] = useState(3)
  const [cached, setCached] = useState(false)
  const lineageCost = 10  // cost to recompute the chain once
  const cacheWrite = 2

  const noCache = actions * lineageCost
  const withCache = lineageCost + cacheWrite + (actions - 1) * 1  // first materializes+caches, rest read cache (cost 1)
  const saved = noCache - withCache

  const bar = (label, cost, color, max) => (
    <div style={{ margin: '0.35rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 2 }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <strong style={{ color, fontVariantNumeric: 'tabular-nums' }}>{cost} units</strong>
      </div>
      <div style={{ height: 18, background: 'var(--bg-hover)', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${(cost / max) * 100}%`, background: color, borderRadius: 3, transition: 'width 0.25s' }} />
      </div>
    </div>
  )
  const max = Math.max(noCache, withCache)

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', marginBottom: '0.7rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Actions reusing the DataFrame</span>
        <input type="range" min={1} max={8} value={actions} onChange={e => setActions(+e.target.value)} style={{ flex: 1, accentColor: COLOR }} />
        <strong style={{ color: COLOR, width: 20, textAlign: 'right' }}>{actions}</strong>
      </label>

      {bar('Without cache — recompute every action', noCache, '#dc2626', max)}
      {bar('With .cache() — compute once, reuse', withCache, COLOR, max)}

      <div style={{ marginTop: '0.7rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${saved > 0 ? SAVE : COLOR}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        {saved > 0
          ? <>Caching saves <strong style={{ color: SAVE }}>{saved} units</strong> across {actions} actions — each extra action re-reads memory (cost ~1) instead of replaying the whole lineage (cost {lineageCost}).</>
          : <>With a single action, <code>.cache()</code> doesn't pay off — you add the cache-write cost but never reuse it. Cache only when a DataFrame is reused.</>
        }
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        Spark recomputes a DataFrame's whole lineage on every action by default. <code>.cache()</code>/<code>.persist()</code> pays off exactly when the same result feeds two or more actions.
      </p>
    </div>
  )
}
