import React, { useState } from 'react';
import { decodeToyLatent } from './vaeUtils.js';

export default function LatentManifoldWidget() {
  const [interpAlpha, setInterpAlpha] = useState(0.5);
  const [selectedCell, setSelectedCell] = useState({ z1: 0, z2: 0 });

  // Grid of latent samples: 5x5 grid from -2.0 to +2.0
  const steps = [-2.0, -1.0, 0.0, 1.0, 2.0];

  // Two endpoints for interpolation
  const ptA = { z1: -2.0, z2: 2.0, label: 'Shape A (Elongated 0)' };
  const ptB = { z1: 2.0, z2: -2.0, label: 'Shape B (Compact 8)' };

  const interpZ1 = ptA.z1 + interpAlpha * (ptB.z1 - ptA.z1);
  const interpZ2 = ptA.z2 + interpAlpha * (ptB.z2 - ptA.z2);
  const interpGrid = decodeToyLatent(interpZ1, interpZ2);

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          Latent Space Manifold & Continuous Interpolation
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          Because the VAE latent space is continuous and Gaussian-regularized, every coordinate decodes to a valid, realistic synthesis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
        {/* 5x5 Manifold Grid */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '0.5rem' }}>
            5×5 DECODER MANIFOLD MESHGRID (z₁, z₂)
          </div>
          <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${steps.length}, auto)`, gap: '4px', background: '#0f172a', padding: '8px', borderRadius: '8px' }}>
            {steps.map((z2) =>
              steps.map((z1) => {
                const grid = decodeToyLatent(z1, -z2);
                const isSelected = selectedCell.z1 === z1 && selectedCell.z2 === -z2;
                return (
                  <div
                    key={`${z1}-${z2}`}
                    onClick={() => setSelectedCell({ z1, z2: -z2 })}
                    style={{
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #ec4899' : '1px solid #334155',
                      borderRadius: '4px',
                      padding: '2px',
                      background: '#1e293b'
                    }}
                    title={`z1: ${z1}, z2: ${-z2}`}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 4px)', gridTemplateRows: 'repeat(8, 4px)', gap: '0.5px' }}>
                      {grid.flatMap((row, r) =>
                        row.map((v, c) => (
                          <div
                            key={`${r}-${c}`}
                            style={{
                              width: '4px',
                              height: '4px',
                              backgroundColor: `rgb(${Math.round(v * 255)}, ${Math.round(v * 255)}, ${Math.round(v * 255)})`
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
            Click any thumbnail to inspect coordinate: <code style={{ color: '#ec4899' }}>[{selectedCell.z1.toFixed(1)}, {selectedCell.z2.toFixed(1)}]</code>
          </div>
        </div>

        {/* Linear Interpolation Section */}
        <div style={{ padding: '1rem', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)', marginBottom: '0.5rem' }}>
            Continuous Latent Walk: z(α) = (1-α)z_A + α z_B
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
            <span>Shape A (α = 0.0)</span>
            <span>Morph: {(interpAlpha * 100).toFixed(0)}%</span>
            <span>Shape B (α = 1.0)</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={interpAlpha}
            onChange={(e) => setInterpAlpha(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#6366f1', marginBottom: '1rem' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 14px)',
                gridTemplateRows: 'repeat(8, 14px)',
                gap: '1px',
                background: '#0f172a',
                padding: '6px',
                borderRadius: '6px',
                width: 'fit-content'
              }}
            >
              {interpGrid.flatMap((row, r) =>
                row.map((v, c) => (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: `rgb(${Math.round(v * 255)}, ${Math.round(v * 255)}, ${Math.round(v * 255)})`,
                      borderRadius: '1px'
                    }}
                  />
                ))
              )}
            </div>

            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
              <div><strong>Interpolated Latent Vector:</strong></div>
              <div style={{ fontFamily: 'monospace', color: '#6366f1', marginTop: '0.2rem' }}>
                z₁ = {interpZ1.toFixed(2)}<br />
                z₂ = {interpZ2.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.4rem', fontWeight: 500 }}>
                ✓ Smooth morphological transformation without artifacts
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
