import React, { useState } from 'react';
import { decodeToyBlob } from './ganUtils.js';

function Grid({ grid, cell = 14 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${grid.length}, ${cell}px)`, gap: '1px', background: '#0f172a', padding: '6px', borderRadius: '6px' }}>
      {grid.flatMap((row, r) =>
        row.map((v, c) => (
          <div key={`${r}-${c}`} style={{ width: cell, height: cell, backgroundColor: `rgb(${Math.round(v * 255)}, ${Math.round(v * 235)}, ${Math.round(v * 250)})`, borderRadius: '1px' }} />
        ))
      )}
    </div>
  );
}

export default function LatentInterpolationWidget() {
  const [alpha, setAlpha] = useState(0.5);

  const zA = { z1: -2, z2: -1.5 };
  const zB = { z1: 2, z2: 1.5 };
  const z1 = zA.z1 + alpha * (zB.z1 - zA.z1);
  const z2 = zA.z2 + alpha * (zB.z2 - zA.z2);

  const gridA = decodeToyBlob(zA.z1, zA.z2);
  const gridB = decodeToyBlob(zB.z1, zB.z2);
  const gridMid = decodeToyBlob(z1, z2);

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          Walking Between Two Points in the Generator's Latent Space
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          A trained generator turns a continuous z into a continuous image — no jumps, even for z the generator never saw during training.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <Grid grid={gridA} />
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>z<sub>A</sub> = ({zA.z1}, {zA.z2})</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Grid grid={gridMid} cell={18} />
          <div style={{ fontSize: '0.75rem', color: '#a21caf', fontWeight: 600, marginTop: '0.3rem' }}>G(z), α = {alpha.toFixed(2)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Grid grid={gridB} />
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>z<sub>B</sub> = ({zB.z1}, {zB.z2})</div>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <input type="range" min="0" max="1" step="0.02" value={alpha} onChange={(e) => setAlpha(+e.target.value)} style={{ width: '100%', accentColor: '#a21caf' }} />
        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#a21caf', textAlign: 'center', marginTop: '0.3rem' }}>
          z(α) = (1-α)·z<sub>A</sub> + α·z<sub>B</sub> = ({z1.toFixed(2)}, {z2.toFixed(2)})
        </div>
      </div>
    </div>
  );
}
