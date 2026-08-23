import React, { useState } from 'react';

export default function BetaVAETunableWidget() {
  const [beta, setBeta] = useState(1.0);

  // Derive metrics based on beta
  // Reconstruction quality (sharpness) drops as beta gets very large
  const reconQuality = Math.max(20, Math.min(98, 95 - (beta - 1.0) * 12));
  // Disentanglement score peaks around beta = 4.0 - 6.0
  const disentanglement = beta < 1.0 ? beta * 40 : Math.min(95, 40 + (beta - 1.0) * 14);
  // Risk of posterior collapse increases dramatically when beta > 8.0
  const posteriorCollapseRisk = beta > 5.0 ? Math.min(100, (beta - 5.0) * 20) : 0;

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          β-VAE Hyperparameter Tuner & Disentanglement Trade-Off
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          Adjust the KL regularization weighting <code style={{ color: '#6366f1' }}>β</code> in <code style={{ color: '#6366f1' }}>ℒ = Reconstruction - β · D_KL</code>.
        </p>
      </div>

      {/* Slider */}
      <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '8px', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Regularization Multiplier (β):</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6366f1', fontFamily: 'monospace' }}>
            β = {beta.toFixed(1)}
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="10.0"
          step="0.1"
          value={beta}
          onChange={(e) => setBeta(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#6366f1' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
          <span>β &lt; 1 (AE-like, Entangled)</span>
          <span>β = 1 (Standard VAE)</span>
          <span>β &gt; 1 (Disentangled Bottleneck)</span>
          <span>β ≫ 1 (Posterior Collapse)</span>
        </div>
      </div>

      {/* Metrics Bar Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {/* Metric 1 */}
        <div style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <span>Reconstruction Sharpness:</span>
            <strong>{reconQuality.toFixed(0)}%</strong>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${reconQuality}%`, height: '100%', background: '#3b82f6', transition: 'width 0.2s' }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <span>Factor Disentanglement:</span>
            <strong>{disentanglement.toFixed(0)}%</strong>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${disentanglement}%`, height: '100%', background: '#10b981', transition: 'width 0.2s' }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <span>Posterior Collapse Risk:</span>
            <strong style={{ color: posteriorCollapseRisk > 50 ? '#ef4444' : '#64748b' }}>{posteriorCollapseRisk.toFixed(0)}%</strong>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${posteriorCollapseRisk}%`, height: '100%', background: '#ef4444', transition: 'width 0.2s' }} />
          </div>
        </div>
      </div>

      {/* Regime Explanation */}
      <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: beta === 1.0 ? '#f0fdf4' : beta < 1.0 ? '#fffbeb' : beta <= 5.0 ? '#eef2ff' : '#fef2f2', border: '1px solid #cbd5e1', fontSize: '0.85rem', lineHeight: '1.4' }}>
        {beta < 1.0 && (
          <span style={{ color: '#b45309' }}>
            <strong>Under-regularized (β &lt; 1):</strong> Reconstruction loss dominates. The model creates sharp images but latents become entangled with correlated axes and non-Gaussian geometry.
          </span>
        )}
        {beta === 1.0 && (
          <span style={{ color: '#166534' }}>
            <strong>Exact ELBO (β = 1.0):</strong> Mathematically optimal lower bound on log-marginal likelihood log p(x). Balances faithful sample reconstruction with standard Gaussian prior matching.
          </span>
        )}
        {beta > 1.0 && beta <= 5.0 && (
          <span style={{ color: '#4338ca' }}>
            <strong>Information Bottleneck Disentanglement (1 &lt; β ≤ 5):</strong> Tightened capacity forces independent generative factors (e.g. rotation, thickness, scale) to align neatly onto single coordinate axes with minimal mutual information.
          </span>
        )}
        {beta > 5.0 && (
          <span style={{ color: '#991b1b' }}>
            <strong>Over-regularized / Posterior Collapse (β &gt; 5):</strong> The KL term overwhelms reconstruction. The encoder collapses to predicting q(z|x) = 𝒩(0, I) for all inputs, causing the decoder to ignore the latent code z and output blurry average templates.
          </span>
        )}
      </div>
    </div>
  );
}
