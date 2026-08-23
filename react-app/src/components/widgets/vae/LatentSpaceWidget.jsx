import React, { useState } from 'react';
import { decodeToyLatent } from './vaeUtils.js';

export default function LatentSpaceWidget() {
  const [mode, setMode] = useState('vae'); // 'ae' or 'vae'
  const [hoveredPoint, setHoveredPoint] = useState({ x: 0, y: 0, val: 'center' });

  // Predefined sample clusters for AE (disjoint islands with gaps)
  const aePoints = [
    { x: -2.2, y: 2.1, class: 'A', label: 'Digit 0' },
    { x: -2.0, y: 1.8, class: 'A', label: 'Digit 0' },
    { x: -2.4, y: 1.9, class: 'A', label: 'Digit 0' },
    { x: 2.1, y: 2.2, class: 'B', label: 'Digit 1' },
    { x: 2.3, y: 1.9, class: 'B', label: 'Digit 1' },
    { x: 1.9, y: 2.4, class: 'B', label: 'Digit 1' },
    { x: 0.1, y: -2.3, class: 'C', label: 'Digit 8' },
    { x: -0.2, y: -2.1, class: 'C', label: 'Digit 8' },
    { x: 0.3, y: -2.5, class: 'C', label: 'Digit 8' },
  ];

  // VAE points (smoothly distributed around (0,0) according to N(0, I))
  const vaePoints = [
    { x: -1.2, y: 1.1, class: 'A', label: 'Digit 0' },
    { x: -0.8, y: 0.9, class: 'A', label: 'Digit 0' },
    { x: -1.4, y: 0.6, class: 'A', label: 'Digit 0' },
    { x: 1.1, y: 1.0, class: 'B', label: 'Digit 1' },
    { x: 0.9, y: 0.7, class: 'B', label: 'Digit 1' },
    { x: 1.3, y: 1.2, class: 'B', label: 'Digit 1' },
    { x: 0.1, y: -1.1, class: 'C', label: 'Digit 8' },
    { x: -0.2, y: -0.9, class: 'C', label: 'Digit 8' },
    { x: 0.3, y: -1.3, class: 'C', label: 'Digit 8' },
  ];

  const currentPoints = mode === 'vae' ? vaePoints : aePoints;
  const decodedGrid = decodeToyLatent(hoveredPoint.x, hoveredPoint.y);

  // Convert latent (-3 to 3) to SVG viewBox (0 to 300)
  const mapCoord = (val) => ((val + 3) / 6) * 260 + 20;

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
            Latent Space Geometry: Standard AE vs. VAE
          </h4>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
            Hover or click anywhere in the latent plane to decode representation at <InlineCoord x={hoveredPoint.x} y={hoveredPoint.y} />
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setMode('ae')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: mode === 'ae' ? '2px solid #ef4444' : '1px solid #cbd5e1',
              background: mode === 'ae' ? '#fef2f2' : 'transparent',
              color: mode === 'ae' ? '#b91c1c' : 'inherit',
              fontWeight: mode === 'ae' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Standard Autoencoder (Discontinuous)
          </button>
          <button
            onClick={() => setMode('vae')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: mode === 'vae' ? '2px solid #6366f1' : '1px solid #cbd5e1',
              background: mode === 'vae' ? '#eef2ff' : 'transparent',
              color: mode === 'vae' ? '#4338ca' : 'inherit',
              fontWeight: mode === 'vae' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Variational Autoencoder (Smooth Prior)
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 200px', gap: '1.5rem', alignItems: 'center' }}>
        {/* Latent Space 2D Plot */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px', margin: '0 auto' }}>
          <svg
            viewBox="0 0 300 300"
            style={{
              width: '100%',
              height: 'auto',
              background: mode === 'vae' ? 'radial-gradient(circle at 150px 150px, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.02) 65%, transparent 100%)' : 'var(--bg-canvas, #f8fafc)',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              cursor: 'crosshair'
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const svgX = ((e.clientX - rect.left) / rect.width) * 300;
              const svgY = ((e.clientY - rect.top) / rect.height) * 300;
              const z1 = Number((((svgX - 20) / 260) * 6 - 3).toFixed(2));
              const z2 = Number((3 - ((svgY - 20) / 260) * 6).toFixed(2));
              setHoveredPoint({ x: Math.max(-3, Math.min(3, z1)), y: Math.max(-3, Math.min(3, z2)) });
            }}
          >
            {/* Grid Axes */}
            <line x1="20" y1="150" x2="280" y2="150" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="150" y1="20" x2="150" y2="280" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
            
            {/* Axis labels */}
            <text x="270" y="142" fontSize="10" fill="#64748b" textAnchor="end">z₁</text>
            <text x="156" y="32" fontSize="10" fill="#64748b">z₂</text>

            {/* Prior N(0, I) contour rings for VAE */}
            {mode === 'vae' && (
              <>
                <circle cx="150" cy="150" r="43" fill="none" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 4" />
                <circle cx="150" cy="150" r="86" fill="none" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 4" />
                <text x="195" y="145" fontSize="8" fill="#6366f1" opacity="0.7">1σ</text>
                <text x="238" y="145" fontSize="8" fill="#6366f1" opacity="0.6">2σ</text>
              </>
            )}

            {/* Dead zones label for AE */}
            {mode === 'ae' && (
              <text x="150" y="155" fontSize="11" fill="#ef4444" opacity="0.7" textAnchor="middle" fontWeight="500">
                ⚠️ Empty / Unmapped Gap
              </text>
            )}

            {/* Clustered Latent Points */}
            {currentPoints.map((pt, idx) => (
              <g key={idx}>
                {mode === 'vae' && (
                  <ellipse
                    cx={mapCoord(pt.x)}
                    cy={mapCoord(-pt.y)}
                    rx="14"
                    ry="14"
                    fill={pt.class === 'A' ? '#3b82f6' : pt.class === 'B' ? '#10b981' : '#f59e0b'}
                    fillOpacity="0.2"
                  />
                )}
                <circle
                  cx={mapCoord(pt.x)}
                  cy={mapCoord(-pt.y)}
                  r="5"
                  fill={pt.class === 'A' ? '#2563eb' : pt.class === 'B' ? '#059669' : '#d97706'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            ))}

            {/* Active inspection probe */}
            <circle
              cx={mapCoord(hoveredPoint.x)}
              cy={mapCoord(-hoveredPoint.y)}
              r="7"
              fill="none"
              stroke="#ec4899"
              strokeWidth="2.5"
            />
            <circle
              cx={mapCoord(hoveredPoint.x)}
              cy={mapCoord(-hoveredPoint.y)}
              r="2"
              fill="#ec4899"
            />
          </svg>
        </div>

        {/* Decoder Output Preview */}
        <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '0.5rem' }}>
            DECODER SYNTHESIS p(x|z)
          </div>

          {/* Render 8x8 Decoded Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 14px)',
              gridTemplateRows: 'repeat(8, 14px)',
              gap: '1px',
              justifyContent: 'center',
              margin: '0.5rem auto',
              background: '#0f172a',
              padding: '6px',
              borderRadius: '6px',
              width: 'fit-content'
            }}
          >
            {decodedGrid.flatMap((row, rIdx) =>
              row.map((val, cIdx) => {
                // If in AE mode and in gap, add noise/garbage
                const inGap = mode === 'ae' && Math.sqrt(hoveredPoint.x ** 2 + hoveredPoint.y ** 2) < 1.5;
                const displayVal = inGap ? (Math.random() > 0.6 ? 0.8 : 0.05) : val;
                const brightness = Math.round(displayVal * 255);
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: `rgb(${brightness}, ${brightness}, ${brightness})`,
                      borderRadius: '1px'
                    }}
                  />
                );
              })
            )}
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: mode === 'ae' && Math.sqrt(hoveredPoint.x ** 2 + hoveredPoint.y ** 2) < 1.5 ? '#b91c1c' : '#166534', fontWeight: 500 }}>
            {mode === 'ae' && Math.sqrt(hoveredPoint.x ** 2 + hoveredPoint.y ** 2) < 1.5 ? (
              <span>⚠️ Garbage output (unregularized space)</span>
            ) : (
              <span>✓ Smooth, valid decoded sample</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InlineCoord({ x, y }) {
  return (
    <code style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#4f46e5' }}>
      [{x.toFixed(2)}, {y.toFixed(2)}]
    </code>
  );
}
