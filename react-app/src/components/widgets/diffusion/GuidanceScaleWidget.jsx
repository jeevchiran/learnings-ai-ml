import React, { useState } from 'react';
import { toyAdherence, toyDiversity } from './diffusionUtils.js';

export default function GuidanceScaleWidget() {
  const [w, setW] = useState(3);
  const adherence = toyAdherence(w);
  const diversity = toyDiversity(w);

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          The Guidance Scale Dial
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          Toy proxies, not the real extrapolation formula — built to show the qualitative trade-off as w moves away from 1.
        </p>
      </div>

      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
        Guidance scale w = <strong>{w.toFixed(1)}</strong>
        {w === 0 && ' (unconditional)'}{w === 1 && ' (standard conditional)'}{w > 1 && ' (extrapolated / over-guided)'}
      </label>
      <input type="range" min="0" max="10" step="0.5" value={w} onChange={(e) => setW(+e.target.value)} style={{ width: '100%', accentColor: '#7c2d12' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.3rem' }}>PROMPT ADHERENCE</div>
          <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: `${adherence}%`, height: '100%', background: '#7c2d12' }} />
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: '#7c2d12', fontWeight: 600 }}>{adherence}%</div>
        </div>
        <div style={{ padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.3rem' }}>SAMPLE DIVERSITY</div>
          <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: `${diversity}%`, height: '100%', background: '#0369a1' }} />
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: '#0369a1', fontWeight: 600 }}>{diversity}%</div>
        </div>
      </div>

      {w > 7 && (
        <div style={{ marginTop: '0.75rem', padding: '0.7rem 1rem', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '0.85rem' }}>
          <strong style={{ color: '#991b1b' }}>Over-guided:</strong> pushed this far, samples over-saturate and lose diversity almost entirely — extrapolating too aggressively past the conditional prediction stops helping fidelity and starts just narrowing the output distribution.
        </div>
      )}
    </div>
  );
}
