import React, { useState } from 'react';
import { gaussianPdf, calculateKLGaussian } from './vaeUtils.js';

export default function KLGaussianWidget() {
  const [mu, setMu] = useState(1.2);
  const [logVar, setLogVar] = useState(-0.5);

  const sigma = Math.sqrt(Math.exp(logVar));
  const klValue = calculateKLGaussian(mu, logVar);

  // Generate curves from x = -4 to +4
  const points = 100;
  const xMin = -4;
  const xMax = 4;
  const priorCurve = [];
  const posteriorCurve = [];

  for (let i = 0; i <= points; i++) {
    const x = xMin + (i / points) * (xMax - xMin);
    const yPrior = gaussianPdf(x, 0, 1);
    const yPost = gaussianPdf(x, mu, sigma);
    
    // SVG coordinate mapping (SVG width: 400, height: 180)
    const svgX = ((x - xMin) / (xMax - xMin)) * 360 + 20;
    const svgYPrior = 160 - yPrior * 280;
    const svgYPost = 160 - yPost * 280;

    priorCurve.push(`${svgX},${svgYPrior}`);
    posteriorCurve.push(`${svgX},${svgYPost}`);
  }

  const priorPath = `M ${priorCurve.join(' L ')}`;
  const postPath = `M ${posteriorCurve.join(' L ')}`;

  // Decompose KL terms
  const termMu = Math.pow(mu, 2);
  const termVar = Math.exp(logVar);
  const termLogVar = logVar;

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          Interactive Gaussian KL Divergence Explorer
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          Observe how the encoder's predicted distribution <span style={{ color: '#ec4899', fontWeight: 600 }}>q(z|x) = 𝒩(μ, σ²)</span> is pulled toward the standard prior <span style={{ color: '#6366f1', fontWeight: 600 }}>p(z) = 𝒩(0, 1)</span>.
        </p>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            <span>Mean (μ):</span>
            <strong style={{ color: '#ec4899' }}>{mu.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.1"
            value={mu}
            onChange={(e) => setMu(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
        </div>

        <div style={{ padding: '0.75rem', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            <span>Log-Variance (log σ²):</span>
            <strong style={{ color: '#ec4899' }}>{logVar.toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(σ = {sigma.toFixed(2)})</span></strong>
          </div>
          <input
            type="range"
            min="-2.0"
            max="1.5"
            step="0.1"
            value={logVar}
            onChange={(e) => setLogVar(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
        </div>
      </div>

      {/* Probability Density Plot */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
        <svg viewBox="0 0 400 180" style={{ width: '100%', height: 'auto', background: 'var(--bg-canvas, #f8fafc)', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          {/* Baseline */}
          <line x1="20" y1="160" x2="380" y2="160" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="200" y1="10" x2="200" y2="160" stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="1" />
          <text x="200" y="174" fontSize="9" fill="#64748b" textAnchor="middle">0 (Prior Center)</text>

          {/* Prior curve p(z) */}
          <path d={priorPath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="4 2" />

          {/* Posterior curve q(z|x) */}
          <path d={postPath} fill="none" stroke="#ec4899" strokeWidth="3" />

          {/* Legend */}
          <g transform="translate(25, 25)">
            <line x1="0" y1="0" x2="16" y2="0" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="4 2" />
            <text x="22" y="4" fontSize="10" fill="#6366f1" fontWeight="600">Prior p(z) = 𝒩(0, 1)</text>

            <line x1="0" y1="16" x2="16" y2="16" stroke="#ec4899" strokeWidth="3" />
            <text x="22" y="20" fontSize="10" fill="#ec4899" fontWeight="600">Encoder q(z|x) = 𝒩(μ, σ²)</text>
          </g>
        </svg>
      </div>

      {/* KL Formula Output and Math Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: '#0f172a', padding: '1rem', borderRadius: '8px', color: '#f8fafc' }}>
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
            KL Divergence Value
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: klValue < 0.2 ? '#4ade80' : klValue < 1.5 ? '#facc15' : '#f87171' }}>
            D_KL = {klValue.toFixed(4)}
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', lineHeight: '1.4', color: '#cbd5e1' }}>
          <div><code>-½ [ 1 + log σ² - μ² - σ² ]</code></div>
          <div style={{ marginTop: '0.2rem', color: '#94a3b8' }}>
            = -0.5 × [1 + ({termLogVar.toFixed(2)}) - {termMu.toFixed(2)} - {termVar.toFixed(2)}]
          </div>
        </div>
      </div>
    </div>
  );
}
