import React, { useState } from 'react';

const STAGES = [
  { id: 0, label: 'z', shape: '(100,)', detail: 'Latent vector sampled from 𝒩(0, I). No spatial structure at all yet — just 100 numbers.', color: '#64748b' },
  { id: 1, label: 'Project + reshape', shape: '4×4×1024', detail: 'A single dense layer + reshape turns the flat vector into a small spatial tensor. This is the only fully-connected layer in the whole network.', color: '#4338ca' },
  { id: 2, label: 'ConvTranspose 1', shape: '8×8×512', detail: 'Stride-2 transposed convolution doubles spatial size, halves channel depth. BatchNorm + ReLU follow.', color: '#7c3aed' },
  { id: 3, label: 'ConvTranspose 2', shape: '16×16×256', detail: 'Same pattern again — stride-2 transposed conv, BatchNorm, ReLU. The network learns its own upsampling filter instead of using a fixed interpolation rule.', color: '#a21caf' },
  { id: 4, label: 'ConvTranspose 3', shape: '32×32×128', detail: 'One more doubling. By now the tensor has real spatial structure — edges and textures are forming, not just a diffuse blob.', color: '#be185d' },
  { id: 5, label: 'ConvTranspose 4 + Tanh', shape: '64×64×3', detail: 'Final transposed conv drops to 3 channels; Tanh squashes to [-1, 1] to match normalized image inputs. No BatchNorm on this output layer — one of the DCGAN guidelines.', color: '#dc2626' },
];

export default function DCGANArchitectureWidget() {
  const [selected, setSelected] = useState(2);
  const stage = STAGES[selected];

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          DCGAN Generator — Latent Vector to 64×64 Image
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          Click any stage to see its shape and role.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', gap: '0.4rem', padding: '0.5rem 0' }}>
        {STAGES.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => setSelected(i)}
              style={{
                flex: '0 0 auto',
                minWidth: 92,
                padding: '0.6rem 0.5rem',
                borderRadius: '8px',
                border: selected === i ? `2px solid ${s.color}` : '1px solid #cbd5e1',
                background: selected === i ? `${s.color}1a` : 'var(--bg-canvas, #f8fafc)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: s.color }}>{s.label}</div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-secondary, #64748b)', marginTop: '0.2rem' }}>{s.shape}</div>
            </button>
            {i < STAGES.length - 1 && <span style={{ color: '#94a3b8', fontSize: '1rem' }}>→</span>}
          </React.Fragment>
        ))}
      </div>

      <div style={{ marginTop: '0.85rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: `1px solid ${stage.color}33` }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: stage.color, marginBottom: '0.25rem' }}>
          {stage.label} — {stage.shape}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary, #334155)' }}>{stage.detail}</div>
      </div>
    </div>
  );
}
