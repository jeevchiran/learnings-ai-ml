import { useState, useMemo } from 'react'
import { EVENTS, USERS, USER_IDS, DAY_CUTOFF, productName, mulberry32 } from './recsysUtils.js'

const TRACK = '#65a30d'
const LEAK = '#dc2626'

const MODES = {
  temporal: {
    name: 'Temporal (global cut-off)',
    blurb: `Everything on or before day ${DAY_CUTOFF} trains; everything after is the held-out future. This is the only split that matches how the model will actually be used.`,
  },
  loo: {
    name: 'Leave-one-out (last item per user)',
    blurb: 'Hold out each user\'s single most recent event. Popular in papers because every user contributes exactly one test case — but the cut-off is a different wall-clock time for every user, so one user\'s test event trains on another user\'s future.',
  },
  random: {
    name: 'Random 80/20',
    blurb: 'Shuffle every event and take 20% as test. Convenient, and wrong: a user\'s day-30 purchase can end up in train while their day-2 view is the test case.',
  },
}

/* Timeline of the whole event log with the split painted on it. Switch modes
 * and count the red events: each one is a training row the model could only
 * know by seeing the future. */
export default function SplitLeakageWidget() {
  const [mode, setMode] = useState('temporal')

  const marked = useMemo(() => {
    if (mode === 'temporal') {
      return EVENTS.map(e => ({ ...e, set: e.day <= DAY_CUTOFF ? 'train' : 'test' }))
    }
    if (mode === 'loo') {
      const lastDay = {}
      for (const e of EVENTS) lastDay[e.u] = Math.max(lastDay[e.u] ?? 0, e.day)
      return EVENTS.map(e => ({ ...e, set: e.day === lastDay[e.u] ? 'test' : 'train' }))
    }
    const rnd = mulberry32(11)
    return EVENTS.map(e => ({ ...e, set: rnd() < 0.2 ? 'test' : 'train' }))
  }, [mode])

  // Leak = a TRAIN event that happens at or after the earliest TEST event.
  // Train on it and the model has literally read the answer sheet.
  const earliestTest = Math.min(...marked.filter(e => e.set === 'test').map(e => e.day))
  const withLeak = marked.map(e => ({ ...e, leak: e.set === 'train' && e.day >= earliestTest }))
  const nLeak = withLeak.filter(e => e.leak).length
  const nTest = withLeak.filter(e => e.set === 'test').length

  const DAYS = 30
  const x = d => ((d - 0.5) / DAYS) * 100

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
        {Object.entries(MODES).map(([k, m]) => (
          <button key={k} onClick={() => setMode(k)}
            style={{
              padding: '0.28rem 0.7rem', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer',
              fontFamily: 'inherit', border: `1px solid ${mode === k ? TRACK : 'var(--border, #ccc)'}`,
              background: mode === k ? TRACK : 'transparent', color: mode === k ? '#fff' : 'var(--text)',
            }}>{m.name.split(' ')[0]}</button>
        ))}
      </div>

      <div style={{ position: 'relative', marginLeft: 62 }}>
        {mode === 'temporal' && (
          <div style={{ position: 'absolute', left: `${(DAY_CUTOFF / DAYS) * 100}%`, top: 0, bottom: 16, width: 2, background: '#7c3aed', opacity: 0.7 }} />
        )}
        {USER_IDS.map((u, i) => (
          <div key={u} style={{ position: 'relative', height: 22 }}>
            <span style={{ position: 'absolute', left: -62, top: 3, fontSize: '0.75rem', width: 58 }}>
              {u} {USERS[i].name}
            </span>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 11, height: 1, background: 'var(--border, #ddd)' }} />
            {withLeak.filter(e => e.u === u).map((e, j) => (
              <span key={j} title={`day ${e.day} · ${e.type} · ${productName(e.p)} · ${e.set}${e.leak ? ' · LEAK' : ''}`}
                style={{
                  position: 'absolute', left: `${x(e.day)}%`, top: e.set === 'test' ? 2 : 5,
                  width: e.set === 'test' ? 11 : 8, height: e.set === 'test' ? 11 : 8,
                  transform: 'translateX(-50%)', borderRadius: '50%',
                  background: e.set === 'test' ? '#7c3aed' : e.leak ? LEAK : TRACK,
                  border: e.set === 'test' ? '2px solid #fff' : 'none',
                  boxShadow: e.set === 'test' ? '0 0 0 1px #7c3aed' : 'none',
                }} />
            ))}
          </div>
        ))}
        <div style={{ position: 'relative', height: 16, fontSize: '0.68rem', opacity: 0.6 }}>
          {[1, 10, 20, 30].map(d => (
            <span key={d} style={{ position: 'absolute', left: `${x(d)}%`, transform: 'translateX(-50%)' }}>d{d}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', margin: '0.4rem 0 0.6rem' }}>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: TRACK, marginRight: 4 }} />train</span>
        <span><span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: '#7c3aed', marginRight: 4 }} />test</span>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: LEAK, marginRight: 4 }} />train event from the test period — <strong>leak</strong></span>
      </div>

      <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: '0 0 0.4rem' }}>{MODES[mode].blurb}</p>

      <div style={{
        fontSize: '0.85rem', padding: '0.5rem 0.7rem', borderRadius: 6,
        background: nLeak ? 'rgba(220,38,38,0.10)' : 'rgba(101,163,13,0.12)',
        border: `1px solid ${nLeak ? LEAK : TRACK}`,
      }}>
        {nTest} test events ·{' '}
        {nLeak === 0
          ? <strong style={{ color: TRACK }}>0 leaked training events — the model never sees past day {DAY_CUTOFF}.</strong>
          : <strong style={{ color: LEAK }}>{nLeak} training events sit at or after the first test event (day {earliestTest}).</strong>}
        {nLeak > 0 && ' Offline scores from this split will be optimistic, and the gap will only show up in the A/B test.'}
      </div>
    </div>
  )
}
