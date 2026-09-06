import React, { useState } from 'react';
import { residualRisk } from './genaiRisksUtils.js';

const LAYERS = [
  { id: 'grounding', name: 'Retrieval grounding', catchRate: 0.55, note: 'Supplies source text so the answer has something to be faithful to. Cannot help when retrieval returns nothing relevant.' },
  { id: 'decoding', name: 'Decoding constraints', catchRate: 0.2, note: 'Lower temperature, constrained formats. Reduces creative drift, but a confidently wrong greedy answer is still wrong.' },
  { id: 'consistency', name: 'Self-consistency checks', catchRate: 0.35, note: 'Sample several times and compare. Catches unstable fabrications; misses errors the model makes consistently.' },
  { id: 'citation', name: 'Citation verification', catchRate: 0.5, note: 'Programmatically check every claim resolves to real supporting text. Strong on fabricated references, weak on subtle misreadings.' },
  { id: 'human', name: 'Human review', catchRate: 0.6, note: 'A person checks before the output is acted on. Effective but expensive, and degraded by automation bias over time.' },
];

export default function MitigationLayersWidget() {
  const [active, setActive] = useState(['grounding']);

  const activeLayers = LAYERS.filter((l) => active.includes(l.id));
  const risk = residualRisk(activeLayers);

  function toggle(id) {
    setActive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          Stacking Mitigations — Diminishing, Never Zero
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          Illustrative catch rates. Toggle layers and watch residual risk fall steeply, then flatten — without ever reaching zero.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
        {LAYERS.map((layer) => {
          const on = active.includes(layer.id);
          return (
            <button
              key={layer.id}
              onClick={() => toggle(layer.id)}
              style={{
                textAlign: 'left',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: on ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                background: on ? '#fef2f2' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: on ? 600 : 400, color: on ? '#b91c1c' : 'inherit' }}>
                  {on ? '☑' : '☐'} {layer.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                  catches ~{Math.round(layer.catchRate * 100)}%
                </span>
              </div>
              {on && <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.35rem' }}>{layer.note}</div>}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '0.9rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '0.4rem' }}>
          <span>RESIDUAL RISK (relative, unmitigated = 100)</span>
          <span style={{ color: '#b91c1c' }}>{risk.toFixed(1)}</span>
        </div>
        <div style={{ height: 14, background: '#e2e8f0', borderRadius: 7, overflow: 'hidden' }}>
          <div style={{ width: `${risk}%`, height: '100%', background: '#b91c1c', transition: 'width 0.2s' }} />
        </div>
      </div>

      <div style={{ marginTop: '0.8rem', padding: '0.7rem 1rem', borderRadius: '8px', background: active.length === LAYERS.length ? '#fef2f2' : 'var(--bg-secondary, #f8fafc)', border: `1px solid ${active.length === LAYERS.length ? '#fecaca' : '#e2e8f0'}`, fontSize: '0.85rem' }}>
        {active.length === LAYERS.length
          ? 'Every layer enabled and risk is still not zero. That residue is why production systems pair mitigation with disclosure, logging, and a way for users to challenge an output — the goal is managing a known failure rate, not eliminating it.'
          : 'Each layer catches a different failure mode, so they compose multiplicatively rather than redundantly. No single layer is close to sufficient on its own.'}
      </div>
    </div>
  );
}
