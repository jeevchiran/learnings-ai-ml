export default function ConceptBox({ title, children }) {
  // ponytail: no separate TLDR component — a title starting "TL;DR" just picks a denser style.
  const tldr = typeof title === 'string' && title.startsWith('TL;DR')
  return (
    <div className={tldr ? 'lc-concept-box lc-tldr' : 'lc-concept-box'}>
      {title && <h4 className="lc-concept-title">{title}</h4>}
      <div>{children}</div>
    </div>
  )
}
