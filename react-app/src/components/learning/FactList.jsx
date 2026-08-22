/* A compact term/definition grid for the handful of facts that define a thing —
 * an architecture, a model family, an algorithm. Denser than prose and easier
 * to scan back to than a bullet list, because the terms form a fixed left column.
 *
 * <FactList items={[{ t: 'Encoder', d: 'Bidirectional self-attention, xN.' }]} />
 *
 * `accent` tints the term column, so a module covering several architectures
 * can colour-code them consistently with its diagrams. ponytail: a CSS custom
 * property rather than a class per colour — callers pass any hex.
 */
export default function FactList({ items = [], accent }) {
  if (!items.length) return null
  return (
    <dl className="lc-facts" style={accent ? { '--facts-accent': accent } : undefined}>
      {items.map(({ t, d }, i) => (
        <div className="lc-facts-row" key={i}>
          <dt>{t}</dt>
          <dd>{d}</dd>
        </div>
      ))}
    </dl>
  )
}
