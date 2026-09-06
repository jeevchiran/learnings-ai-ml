import React, { useState } from 'react';

const CASES = [
  {
    id: 0,
    label: 'Summary adds a number',
    scenario: 'A summarisation model is given a report stating "revenue grew" and writes "revenue grew 14%". The source never mentions 14%.',
    source: 'intrinsic',
    kind: 'faithfulness',
    domain: 'closed',
    note: 'The claim contradicts nothing in the world necessarily — it might even be right by luck — but it is unsupported by the provided source. Closed-domain tasks are judged against the source, not against reality.',
  },
  {
    id: 1,
    label: 'Invented citation',
    scenario: 'Asked for research on a niche topic, the model produces a plausible-looking paper title, author list, and DOI that do not exist.',
    source: 'extrinsic',
    kind: 'factuality',
    domain: 'open',
    note: 'Nothing in the prompt is being contradicted — the model is generating new content that is simply false about the world. Fabricated references are the canonical open-domain factuality failure.',
  },
  {
    id: 2,
    label: 'Contradicts the passage',
    scenario: 'Given a passage saying a treaty was signed in 1919, the model answers "the treaty was signed in 1920".',
    source: 'intrinsic',
    kind: 'faithfulness',
    domain: 'closed',
    note: 'The output directly contradicts material that is right there in the context window. Intrinsic failures are the easiest class to detect automatically, because the ground truth was supplied.',
  },
  {
    id: 3,
    label: 'Confident wrong fact',
    scenario: 'Asked which element has atomic number 34, the model confidently answers "germanium" (it is selenium).',
    source: 'extrinsic',
    kind: 'factuality',
    domain: 'open',
    note: 'No source was given to contradict, and the claim is simply wrong about the world. Note the tone is identical to a correct answer — that decoupling is Module 5 subject matter.',
  },
];

const DIMENSIONS = [
  { key: 'source', title: 'Source relation', values: { intrinsic: 'Intrinsic — contradicts the supplied context', extrinsic: 'Extrinsic — unverifiable or false, but not contradicting the context' } },
  { key: 'kind', title: 'What is violated', values: { faithfulness: 'Faithfulness — unfaithful to the given source', factuality: 'Factuality — false about the world' } },
  { key: 'domain', title: 'Task domain', values: { closed: 'Closed-domain — judged against a provided source', open: 'Open-domain — judged against world knowledge' } },
];

export default function HallucinationTaxonomyWidget() {
  const [selected, setSelected] = useState(0);
  const c = CASES[selected];

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          Same Word, Four Different Failures
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          Pick a case and see where it lands on each dimension. The dimensions are independent — knowing one tells you little about the others.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
        {CASES.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item.id)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: selected === item.id ? '2px solid #b91c1c' : '1px solid #cbd5e1',
              background: selected === item.id ? '#fef2f2' : 'transparent',
              color: selected === item.id ? '#b91c1c' : 'inherit',
              fontWeight: selected === item.id ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.82rem',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0.8rem 1rem', borderRadius: '8px', background: 'var(--bg-canvas, #f8fafc)', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1rem' }}>
        {c.scenario}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {DIMENSIONS.map((dim) => (
          <div key={dim.key} style={{ padding: '0.7rem 0.85rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.03em', marginBottom: '0.3rem' }}>
              {dim.title.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#b91c1c', fontWeight: 600 }}>
              {dim.values[c[dim.key]]}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '0.85rem', padding: '0.7rem 1rem', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '0.85rem' }}>
        {c.note}
      </div>
    </div>
  );
}
