import { useState } from 'react'

const TRACK = '#65a30d'
const BAD = '#dc2626'
const WARN = '#ca8a04'

/* A day of raw NovaCart clickstream, warts included. Toggle each contract rule
 * and watch how many rows survive. The number at the bottom is the one nobody
 * checks until the model underperforms for a month. */

const RAW = [
  { id: 1, user: 'U2',   item: 'P4', type: 'view',     ts: '2026-03-04T09:12:03Z', sess: 's1', src: 'web',  note: null },
  { id: 2, user: 'U2',   item: 'P4', type: 'view',     ts: '2026-03-04T09:12:03Z', sess: 's1', src: 'web',  note: 'duplicate — retry after a 500, identical timestamp' },
  { id: 3, user: null,   item: 'P8', type: 'view',     ts: '2026-03-04T09:14:41Z', sess: 's2', src: 'web',  note: 'logged out — no user id, only a session' },
  { id: 4, user: 'U2',   item: 'P4', type: 'cart',     ts: '2026-03-04T09:15:10Z', sess: 's1', src: 'web',  note: null },
  { id: 5, user: 'bot7', item: 'P1', type: 'view',     ts: '2026-03-04T09:15:11Z', sess: 's3', src: 'crawler', note: 'price-scraper: 4,200 views in one hour' },
  { id: 6, user: 'U3',   item: 'P3', type: 'purchase', ts: '2026-03-04T09:31:00Z', sess: 's4', src: 'web',  note: null },
  { id: 7, user: 'U3',   item: 'P3', type: 'refund',   ts: '2026-03-06T11:02:00Z', sess: 's9', src: 'ops',  note: 'returned two days later — the purchase above is now a NEGATIVE' },
  { id: 8, user: 'U5',   item: 'P6', type: 'cart',     ts: '2026-03-04T08:59:59Z', sess: 's5', src: 'ios',  note: 'arrived late from an offline mobile queue, out of order' },
  { id: 9, user: 'U4',   item: 'P7', type: 'view',     ts: '2026-03-04T09:44:12Z', sess: 's6', src: 'web',  note: null },
  { id: 10, user: 'U4',  item: 'PX', type: 'view',     ts: '2026-03-04T09:44:19Z', sess: 's6', src: 'web',  note: 'item id not in the catalog — delisted mid-session' },
]

const RULES = [
  { key: 'dedupe',  label: 'Dedupe on (user, item, type, ts)', color: TRACK,
    drop: r => r.id === 2,
    why: 'At-least-once delivery means retries. Without a dedupe key your popularity counts are inflated by whatever your error rate is.' },
  { key: 'ident',   label: 'Require a resolvable user id', color: WARN,
    drop: r => r.user === null,
    why: 'Logged-out traffic is often the majority of views. Dropping it is honest; silently mapping it to one “anonymous” user creates a phantom shopper who likes everything.' },
  { key: 'bots',    label: 'Filter non-human traffic', color: BAD,
    drop: r => r.src === 'crawler',
    why: 'One scraper can outweigh every real shopper in your popularity table. This is the single highest-leverage filter in the whole pipeline.' },
  { key: 'catalog', label: 'Join must resolve against the catalog', color: BAD,
    drop: r => r.item === 'PX',
    why: 'An unjoinable item id becomes a null feature row, and most training code will happily learn from it.' },
  { key: 'refund',  label: 'Reconcile late-arriving reversals', color: BAD,
    drop: r => r.type === 'refund' || r.id === 6,
    why: 'A refund retroactively flips a positive to a negative. If your label is written the day of the purchase, you train on it as a success forever.' },
  { key: 'order',   label: 'Order by event time, not arrival time', color: WARN,
    drop: () => false,
    why: 'Mobile clients queue events offline. Row 8 has a 08:59 event time but arrived after 09:15 — sort by arrival and your "sequence of actions" feature is fiction.' },
]

export default function EventContractWidget() {
  const [on, setOn] = useState({ dedupe: true, ident: false, bots: true, catalog: true, refund: false, order: true })
  const active = RULES.filter(r => on[r.key])

  const status = row => {
    for (const r of active) if (r.drop(row)) return r
    return null
  }
  const kept = RAW.filter(r => !status(r))

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <p style={{ fontSize: '0.85rem', opacity: 0.82, margin: '0 0 0.6rem' }}>
        Ten consecutive rows from NovaCart's raw <code>events</code> topic. Toggle the contract rules.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.7rem' }}>
        {RULES.map(r => (
          <label key={r.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.8rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={on[r.key]} onChange={e => setOn(p => ({ ...p, [r.key]: e.target.checked }))}
              style={{ marginTop: 3 }} />
            <span>
              <strong style={{ color: on[r.key] ? r.color : 'var(--text-muted, #999)' }}>{r.label}</strong>
              {on[r.key] && <span style={{ display: 'block', opacity: 0.72, fontSize: '0.75rem', lineHeight: 1.5 }}>{r.why}</span>}
            </span>
          </label>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.73rem', width: '100%' }}>
          <thead>
            <tr style={{ opacity: 0.75 }}>
              {['#', 'user', 'item', 'type', 'event_ts', 'session', 'source'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '2px 5px', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RAW.map(row => {
              const dropped = status(row)
              return (
                <tr key={row.id} title={row.note ?? ''} style={{
                  background: dropped ? 'rgba(220,38,38,0.10)' : 'transparent',
                  textDecoration: dropped ? 'line-through' : 'none',
                  opacity: dropped ? 0.6 : 1,
                }}>
                  <td style={{ padding: '2px 5px' }}>{row.id}</td>
                  <td style={{ padding: '2px 5px', color: row.user === null ? BAD : 'inherit' }}>{row.user ?? '∅'}</td>
                  <td style={{ padding: '2px 5px', color: row.item === 'PX' ? BAD : 'inherit' }}>{row.item}</td>
                  <td style={{ padding: '2px 5px', fontWeight: row.type === 'refund' ? 700 : 400, color: row.type === 'refund' ? BAD : 'inherit' }}>{row.type}</td>
                  <td style={{ padding: '2px 5px', fontFamily: 'monospace' }}>{row.ts.slice(11, 19)}</td>
                  <td style={{ padding: '2px 5px', opacity: 0.7 }}>{row.sess}</td>
                  <td style={{ padding: '2px 5px', color: row.src === 'crawler' ? BAD : 'inherit' }}>{row.src}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: '0.6rem', padding: '0.5rem 0.7rem', borderRadius: 6, fontSize: '0.83rem',
        border: `1px solid ${TRACK}`, background: 'rgba(101,163,13,0.11)',
      }}>
        <strong style={{ color: TRACK }}>{kept.length} of {RAW.length} rows survive</strong> under {active.length} rule
        {active.length === 1 ? '' : 's'}.
        {' '}Every one of these rules is a decision about what "a shopper liked this" <em>means</em>. Write them
        down next to the schema, version them, and assert them in the pipeline — because when the number moves,
        you need to know whether shopper behaviour changed or a client release did.
      </div>

      <p style={{ fontSize: '0.78rem', opacity: 0.72, marginTop: '0.4rem' }}>
        Hover a row for why it is there. Note that the two rules left off by default (identity, refunds) are
        the ones with no obviously right answer — which is exactly why they belong in a written contract
        rather than in one engineer's head.
      </p>
    </div>
  )
}
