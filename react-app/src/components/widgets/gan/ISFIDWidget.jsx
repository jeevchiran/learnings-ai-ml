import React, { useState } from 'react';
import { toyInceptionScore, toyFID } from './ganUtils.js';

export default function ISFIDWidget() {
  const [sharpness, setSharpness] = useState(85);
  const [diversity, setDiversity] = useState(90);

  const is = toyInceptionScore(sharpness, diversity);
  const fid = toyFID(sharpness, diversity);
  const collapseWarning = diversity < 40 && sharpness > 70;

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          Inception Score vs. FID — Same Generator, Different Verdicts
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          These are toy proxies, not the real formulas — built to show the qualitative gap: IS scores samples one at a time, FID compares whole distributions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
            Per-image sharpness: <strong>{sharpness}</strong>
          </label>
          <input type="range" min="0" max="100" value={sharpness} onChange={(e) => setSharpness(+e.target.value)} style={{ width: '100%', accentColor: '#a21caf' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
            Diversity / mode coverage: <strong>{diversity}</strong>
          </label>
          <input type="range" min="0" max="100" value={diversity} onChange={(e) => setDiversity(+e.target.value)} style={{ width: '100%', accentColor: '#a21caf' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ padding: '0.9rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>INCEPTION SCORE (higher = better)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0369a1' }}>{is}</div>
        </div>
        <div style={{ padding: '0.9rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>FID (lower = better)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626' }}>{fid}</div>
        </div>
      </div>

      {collapseWarning && (
        <div style={{ marginTop: '0.85rem', padding: '0.7rem 1rem', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '0.85rem' }}>
          <strong style={{ color: '#991b1b' }}>Try this combination deliberately:</strong> sharp images, low diversity — a generator that memorised a handful of crisp modes. IS stays respectable because it barely looks past per-image confidence. FID spikes, because comparing the fake feature distribution to the real one exposes the missing modes directly.
        </div>
      )}
    </div>
  );
}
