import React, { useState } from 'react';

const T = 40;
const DDIM_STRIDE = 5;

export default function DDPMvsDDIMWidget() {
  const [ddim, setDdim] = useState(false);
  const steps = ddim
    ? Array.from({ length: Math.floor(T / DDIM_STRIDE) + 1 }, (_, i) => T - i * DDIM_STRIDE).filter((t) => t >= 0)
    : Array.from({ length: T + 1 }, (_, i) => T - i);

  const evalCount = steps.length;
  const fullCount = T + 1;
  const speedup = (fullCount / evalCount).toFixed(1);

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.9rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
            Same Trained Model, Two Sampling Schedules
          </h4>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
            Every dot is one network evaluation on the path from t = {T} down to t = 0.
          </p>
        </div>
        <button
          onClick={() => setDdim((d) => !d)}
          style={{ padding: '0.45rem 1rem', borderRadius: '6px', border: 'none', background: ddim ? '#7c2d12' : '#0369a1', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
        >
          {ddim ? 'Using DDIM (skipped steps)' : 'Using DDPM (every step)'}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '0.75rem', background: 'var(--bg-canvas, #f8fafc)', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: 40, alignItems: 'center' }}>
        {steps.map((t) => (
          <div
            key={t}
            title={`t = ${t}`}
            style={{ width: 10, height: 10, borderRadius: '50%', background: ddim ? '#7c2d12' : '#0369a1' }}
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>NETWORK EVALUATIONS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: ddim ? '#7c2d12' : '#0369a1' }}>{evalCount}</div>
        </div>
        <div style={{ padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>SPEEDUP vs. FULL DDPM</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#166534' }}>{ddim ? `${speedup}×` : '1.0×'}</div>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', padding: '0.7rem 1rem', borderRadius: '8px', background: '#fef9f0', border: '1px solid #fde68a', fontSize: '0.85rem' }}>
        DDIM reuses the exact same trained model — nothing about the network changes. It skips intermediate timesteps using a non-Markovian reformulation of the reverse process, trading a small amount of sample quality for far fewer evaluations.
      </div>
    </div>
  );
}
