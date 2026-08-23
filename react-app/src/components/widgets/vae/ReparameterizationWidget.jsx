import React, { useState } from 'react';

export default function ReparameterizationWidget() {
  const [useReparameterization, setUseReparameterization] = useState(true);
  const [isBackprop, setIsBackprop] = useState(false);

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
            The Reparameterization Trick & Gradient Flow
          </h4>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
            Compare standard stochastic sampling with the differentiable pathwise reparameterization trick.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => { setUseReparameterization(false); setIsBackprop(false); }}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: !useReparameterization ? '2px solid #ef4444' : '1px solid #cbd5e1',
              background: !useReparameterization ? '#fef2f2' : 'transparent',
              color: !useReparameterization ? '#b91c1c' : 'inherit',
              fontWeight: !useReparameterization ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Direct Sampling (Non-differentiable)
          </button>
          <button
            onClick={() => { setUseReparameterization(true); setIsBackprop(false); }}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: useReparameterization ? '2px solid #10b981' : '1px solid #cbd5e1',
              background: useReparameterization ? '#f0fdf4' : 'transparent',
              color: useReparameterization ? '#15803d' : 'inherit',
              fontWeight: useReparameterization ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Reparameterized: z = μ + σ ⊙ ε
          </button>
        </div>
      </div>

      {/* Action to trigger Backpropagation flow animation */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button
          onClick={() => setIsBackprop(!isBackprop)}
          style={{
            padding: '0.45rem 1.2rem',
            background: isBackprop ? '#4338ca' : '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.85rem',
            boxShadow: '0 2px 4px rgba(99, 102, 241, 0.25)'
          }}
        >
          {isBackprop ? 'Reset to Forward Pass' : '▶ Simulate Backward Pass (∂Loss/∂ϕ)'}
        </button>
      </div>

      {/* SVG Computational Graph */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '540px', margin: '0 auto' }}>
        <svg viewBox="0 0 540 220" style={{ width: '100%', height: 'auto', background: 'var(--bg-canvas, #f8fafc)', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Forward / Backward Nodes */}
          {/* Input X */}
          <rect x="20" y="90" width="60" height="40" rx="6" fill="#3b82f6" fillOpacity="0.15" stroke="#2563eb" strokeWidth="1.5" />
          <text x="50" y="115" fontSize="12" fill="#1e40af" fontWeight="600" textAnchor="middle">Input x</text>

          {/* Encoder */}
          <rect x="110" y="75" width="80" height="70" rx="6" fill="#6366f1" fillOpacity="0.15" stroke="#4f46e5" strokeWidth="1.5" />
          <text x="150" y="110" fontSize="11" fill="#3730a3" fontWeight="600" textAnchor="middle">Encoder</text>
          <text x="150" y="125" fontSize="9" fill="#4f46e5" textAnchor="middle">q_ϕ(z|x)</text>

          {/* Forward connection x -> Encoder */}
          <line x1="80" y1="110" x2="105" y2="110" stroke={isBackprop ? '#10b981' : '#64748b'} strokeWidth="2" markerEnd={isBackprop ? '' : 'url(#arrow)'} />

          {!useReparameterization ? (
            /* Direct Stochastic Sampling Node */
            <>
              <circle cx="270" cy="110" r="28" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
              <text x="270" y="106" fontSize="10" fill="#991b1b" fontWeight="600" textAnchor="middle">Sample z</text>
              <text x="270" y="120" fontSize="8" fill="#b91c1c" textAnchor="middle">~ 𝒩(μ, σ²)</text>

              {/* Arrow from encoder to sample */}
              <line x1="190" y1="110" x2="238" y2="110" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Arrow from sample to decoder */}
              <line x1="300" y1="110" x2="345" y2="110" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Backprop blocked indicator */}
              {isBackprop && (
                <g>
                  <line x1="345" y1="110" x2="305" y2="110" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow-green)" />
                  <line x1="260" y1="80" x2="280" y2="140" stroke="#ef4444" strokeWidth="3" />
                  <line x1="280" y1="80" x2="260" y2="140" stroke="#ef4444" strokeWidth="3" />
                  <text x="270" y="160" fontSize="10" fill="#dc2626" fontWeight="700" textAnchor="middle">
                    ⛔ Gradient BLOCKED
                  </text>
                </g>
              )}
            </>
          ) : (
            /* Reparameterized Graph */
            <>
              {/* μ and logσ² output nodes */}
              <rect x="215" y="55" width="45" height="28" rx="4" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="1.5" />
              <text x="237" y="73" fontSize="11" fill="#312e81" fontWeight="600" textAnchor="middle">μ</text>

              <rect x="215" y="135" width="45" height="28" rx="4" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="1.5" />
              <text x="237" y="153" fontSize="11" fill="#312e81" fontWeight="600" textAnchor="middle">σ</text>

              {/* Noise node ε */}
              <circle cx="295" cy="195" r="16" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="295" y="199" fontSize="11" fill="#334155" fontWeight="600" textAnchor="middle">ε</text>
              <text x="295" y="215" fontSize="8" fill="#64748b" textAnchor="middle">~𝒩(0, I)</text>

              {/* Arithmetic Node z = μ + σ ⊙ ε */}
              <circle cx="310" cy="110" r="22" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
              <text x="310" y="114" fontSize="11" fill="#14532d" fontWeight="700" textAnchor="middle">z</text>

              {/* Connectors */}
              <line x1="190" y1="90" x2="210" y2="72" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <line x1="190" y1="130" x2="210" y2="145" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />

              <line x1="260" y1="72" x2="295" y2="95" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <line x1="260" y1="145" x2="295" y2="125" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <line x1="295" y1="180" x2="305" y2="135" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" markerEnd="url(#arrow)" />

              {/* To Decoder */}
              <line x1="335" y1="110" x2="370" y2="110" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Backpropagation arrows */}
              {isBackprop && (
                <g>
                  {/* Flow through z */}
                  <line x1="370" y1="110" x2="338" y2="110" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow-green)" />
                  {/* Split to mu and sigma */}
                  <line x1="295" y1="95" x2="262" y2="74" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                  <line x1="295" y1="125" x2="262" y2="143" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                  {/* Flow into encoder */}
                  <line x1="210" y1="72" x2="192" y2="88" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                  <line x1="210" y1="145" x2="192" y2="132" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                  <line x1="110" y1="110" x2="85" y2="110" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow-green)" />
                </g>
              )}
            </>
          )}

          {/* Decoder Node */}
          <rect x="375" y="75" width="80" height="70" rx="6" fill="#a855f7" fillOpacity="0.15" stroke="#9333ea" strokeWidth="1.5" />
          <text x="415" y="110" fontSize="11" fill="#581c87" fontWeight="600" textAnchor="middle">Decoder</text>
          <text x="415" y="125" fontSize="9" fill="#9333ea" textAnchor="middle">p_θ(x|z)</text>

          {/* Output x_hat */}
          <line x1="455" y1="110" x2="475" y2="110" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
          <rect x="480" y="90" width="50" height="40" rx="6" fill="#10b981" fillOpacity="0.15" stroke="#059669" strokeWidth="1.5" />
          <text x="505" y="115" fontSize="12" fill="#065f46" fontWeight="600" textAnchor="middle">x̂</text>
        </svg>
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: useReparameterization ? '#f0fdf4' : '#fef2f2', border: `1px solid ${useReparameterization ? '#bbf7d0' : '#fecaca'}`, fontSize: '0.85rem' }}>
        {useReparameterization ? (
          <div>
            <strong style={{ color: '#166534' }}>✓ Differentiable Pathwise Derivative:</strong> Since <code style={{ color: '#15803d' }}>z = μ + σ ⊙ ε</code> is a deterministic function of <code style={{ color: '#15803d' }}>μ</code> and <code style={{ color: '#15803d' }}>σ</code> with stochasticity pushed into an external input <code style={{ color: '#15803d' }}>ε ~ 𝒩(0, I)</code>, gradients <code style={{ color: '#15803d' }}>∂z/∂μ = 1</code> and <code style={{ color: '#15803d' }}>∂z/∂σ = ε</code> flow continuously into encoder parameters <code style={{ color: '#15803d' }}>ϕ</code>.
          </div>
        ) : (
          <div>
            <strong style={{ color: '#991b1b' }}>⛔ Stochastic Bottleneck:</strong> Direct sampling <code style={{ color: '#b91c1c' }}>z ~ 𝒩(μ, σ²)</code> has no analytical derivative with respect to distribution parameters <code style={{ color: '#b91c1c' }}>μ</code> and <code style={{ color: '#b91c1c' }}>σ</code>, breaking standard backpropagation.
          </div>
        )}
      </div>
    </div>
  );
}
