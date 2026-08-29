import React, { useState } from 'react';
import { toyImage, toyNoise, linearAlphaBar, forwardNoise, clamp01 } from './diffusionUtils.js';

const T = 20;
const SIZE = 10;
const x0 = toyImage(SIZE);
const noise = toyNoise(SIZE);
const alphaBars = linearAlphaBar(T);

function Grid({ grid, cell = 18 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${grid.length}, ${cell}px)`, gap: '1px', background: '#0f172a', padding: '6px', borderRadius: '6px' }}>
      {grid.flatMap((row, r) =>
        row.map((v, c) => {
          const g = Math.round(clamp01(v) * 255);
          return <div key={`${r}-${c}`} style={{ width: cell, height: cell, backgroundColor: `rgb(${g},${g},${g})`, borderRadius: '1px' }} />;
        })
      )}
    </div>
  );
}

export default function ForwardNoisingWidget() {
  const [t, setT] = useState(0);
  const xt = forwardNoise(x0, noise, alphaBars[t]);

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          The Forward Process — Destroying x₀ in One Formula, Not T Steps
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          x<sub>t</sub> = √ᾱ<sub>t</sub> · x₀ + √(1-ᾱ<sub>t</sub>) · ε — computed directly for any t, no iteration needed.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Grid grid={xt} />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <input type="range" min="0" max={T} value={t} onChange={(e) => setT(+e.target.value)} style={{ width: '100%', accentColor: '#7c2d12' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
          <span>t = 0 (clean x₀)</span>
          <span style={{ fontFamily: 'monospace', color: '#7c2d12', fontWeight: 600 }}>t = {t}, ᾱ_t = {alphaBars[t].toFixed(3)}</span>
          <span>t = {T} (≈ pure noise)</span>
        </div>
      </div>
    </div>
  );
}
