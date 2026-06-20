export default function ConceptBox({ title, children }) {
  return (
    <div className="lc-concept-box">
      {title && <h4 className="lc-concept-title">{title}</h4>}
      <div>{children}</div>
    </div>
  )
}
