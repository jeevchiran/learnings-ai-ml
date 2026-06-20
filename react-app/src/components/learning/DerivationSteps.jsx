export function DerivationStep({ number, title, children }) {
  return (
    <div className="lc-derivation-step">
      <div className="lc-step-number">{number}</div>
      <div className="lc-step-content">
        {title && <strong>{title}</strong>}
        <div className="lc-step-body">{children}</div>
      </div>
    </div>
  )
}

export default function DerivationSteps({ children }) {
  return <div className="lc-derivation">{children}</div>
}
