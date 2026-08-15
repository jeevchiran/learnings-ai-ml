// ponytail: native <details> for click-to-reveal — no state, no deps.
export default function Recall({ items = [] }) {
  if (!items.length) return null
  return (
    <div className="lc-recall">
      <h4 className="lc-recall-title">Quick recall check</h4>
      {items.map((it, i) => (
        <details key={i} className="lc-recall-item">
          <summary>{it.q}</summary>
          <div className="lc-recall-a">{it.a}</div>
        </details>
      ))}
    </div>
  )
}
