import React, { useState } from 'react';
import { toyImage, toyNoise, linearAlphaBar, forwardNoise, clamp01 } from './diffusionUtils.js';

const T = 20;
const SIZE = 10;
const x0 = toyImage(SIZE);
const noise = toyNoise(SIZE);
const alphaBars = linearAlphaBar(T);

function Grid({ grid, cell = 16 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${grid.length}, ${cell}px)`, gap: '1px', background: '#0f172a', padding: '5px', borderRadius: '6px' }}>
      {grid.flatMap((row, r) =>
        row.map((v, c) => {
          const g = Math.round(clamp01(v) * 255);
          return <div key={`${r}-${c}`} style={{ width: cell, height: cell, backgroundColor: `rgb(${g},${g},${g})`, borderRadius: '1px' }} />;
        })
      )}
    </div>
  );
}

export default function ReverseDenoisingWidget() {
  const [t, setT] = useState(T);
  const current = forwardNoise(x0, noise, alphaBars[t]);

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          Reverse Sampling — One Small Step at a Time
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          An idealized denoiser here — in practice p<sub>θ</sub>(x<sub>t-1</sub>|x<sub>t</sub>) is learned and only approximates this. Each click is one network evaluation.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Grid grid={current} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '1rem' }}>
        <button
          onClick={() => setT(T)}
          style={{ padding: '0.4rem 0.9rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Reset to pure noise
        </button>
        <button
          onClick={() => setT((v) => Math.max(0, v - 1))}
          disabled={t === 0}
          style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', background: '#7c2d12', color: '#fff', fontWeight: 600, cursor: t === 0 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', opacity: t === 0 ? 0.5 : 1 }}
        >
          Denoise one step ◀ (t = {t})
        </button>
      </div>

      <div style={{ marginTop: '0.85rem', padding: '0.7rem 1rem', borderRadius: '8px', background: t === 0 ? '#f0fdf4' : 'var(--bg-secondary, #f8fafc)', border: `1px solid ${t === 0 ? '#bbf7d0' : '#e2e8f0'}`, fontSize: '0.85rem' }}>
        {t === 0 ? (
          <span><strong style={{ color: '#166534' }}>Done:</strong> {T} network evaluations to go from pure noise to x₀ — compare this to a GAN's single forward pass through G.</span>
        ) : (
          <span><strong>{t}</strong> steps remaining. Every remaining click is one more pass through the same denoising network, conditioned on the current timestep.</span>
        )}
      </div>
    </div>
  );
}
