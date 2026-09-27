import { useState } from 'react'

const deliveries = [
  { id: 'trip-1', value: 2 },
  { id: 'trip-2', value: 3 },
  { id: 'trip-1', value: 2 },
  { id: 'trip-3', value: 1 },
]

export default function DeliveryReplayWidget() {
  const [count, setCount] = useState(0)
  const [deduplicate, setDeduplicate] = useState(false)
  const seen = new Set()
  const rows = deliveries.slice(0, count).map(event => {
    const duplicate = seen.has(event.id)
    seen.add(event.id)
    return { ...event, skipped: duplicate && deduplicate }
  })
  const total = rows.reduce((sum, row) => sum + (row.skipped ? 0 : row.value), 0)
  const buttonStyle = { padding: '0.5rem 0.8rem', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-hover)', color: 'var(--text)', cursor: 'pointer' }

  return (
    <div>
      <p>Deliver four messages representing three unique trips. The third delivery repeats trip-1 after a lost acknowledgment.</p>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="checkbox" checked={deduplicate} onChange={event => { setDeduplicate(event.target.checked); setCount(0) }} />
        Deduplicate by event ID (restarts the experiment)
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '1rem 0' }}>
        <button style={buttonStyle} disabled={count === deliveries.length} onClick={() => setCount(value => Math.min(value + 1, deliveries.length))}>Deliver next message</button>
        <button style={buttonStyle} onClick={() => setCount(0)}>Reset deliveries</button>
      </div>
      <ol aria-label="Delivery log">
        {rows.map((row, index) => <li key={index}>{row.id}: {row.value} passengers — {row.skipped ? 'duplicate skipped' : 'added to total'}</li>)}
      </ol>
      <p role="status">Processed {count} of 4 deliveries. Passenger total: <strong>{total}</strong>. Expected after all unique trips: 6.</p>
      {count === 4 && <p>{deduplicate ? 'The replay did not change the result: 2 + 3 + 1 = 6.' : 'The repeated event inflated the result: 2 + 3 + 2 + 1 = 8. Enable deduplication and try again.'}</p>}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Teaching simulation: the event-ID check and write are treated as one atomic operation. A real consumer needs durable, transactional deduplication; an in-memory set cannot survive a restart.</p>
    </div>
  )
}
