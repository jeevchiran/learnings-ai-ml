import React, { useState } from 'react';
import { gaussianPdf, lerp, buildDensityPath } from './ganUtils.js';

const WIDTH = 520;
const HEIGHT = 220;
const X_MIN = -5, X_MAX = 5, Y_MAX = 1.1;
const STEPS = 8;

const REAL_MEAN = 0, REAL_STD = 1;
const G_START = { mean: -3.2, std: 0.4 };
const G_END = { mean: 0, std: 1 };

export default function MinimaxGameWidget() {
  const [step, setStep] = useState(0);
  const t = step / STEPS;

  const gMean = lerp(G_START.mean, G_END.mean, t);
  const gStd = lerp(G_START.std, G_END.std, t);

  const realFn = (x) => gaussianPdf(x, REAL_MEAN, REAL_STD);
  const fakeFn = (x) => gaussianPdf(x, gMean, gStd);
  const dStarFn = (x) => {
    const pr = realFn(x), pg = fakeFn(x);
    return pr / (pr + pg);
  };

  const box = { xMin: X_MIN, xMax: X_MAX, yMax: Y_MAX, width: WIDTH, height: HEIGHT };
  const realPath = buildDensityPath(realFn, box);
  const fakePath = buildDensityPath(fakeFn, box);
  const dPath = buildDensityPath(dStarFn, { ...box, yMax: 1 });

  const meanGap = Math.abs(gMean - REAL_MEAN);
  const stdGap = Math.abs(gStd - REAL_STD);
  const converged = meanGap < 0.05 && stdGap < 0.05;

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
            The Minimax Game, One Training Step at a Time
          </h4>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
            Fixed real distribution p<sub>data</sub> = 𝒩(0, 1). Watch the generator's distribution p<sub>g</sub> and the optimal discriminator D*(x) = p<sub>data</sub>/(p<sub>data</sub>+p<sub>g</sub>) move together.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent', cursor: step === 0 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', opacity: step === 0 ? 0.5 : 1 }}
          >
            ◀ Prev
          </button>
          <button
            onClick={() => setStep((s) => Math.min(STEPS, s + 1))}
            disabled={step === STEPS}
            style={{ padding: '0.4rem 0.9rem', borderRadius: '6px', border: 'none', background: '#a21caf', color: '#fff', cursor: step === STEPS ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, opacity: step === STEPS ? 0.6 : 1 }}
          >
            Train step ▶
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: '100%', height: 'auto', background: 'var(--bg-canvas, #f8fafc)', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <line x1="10" y1={HEIGHT - 10} x2={WIDTH - 10} y2={HEIGHT - 10} stroke="#cbd5e1" strokeWidth="1" />
        <path d={realPath} fill="none" stroke="#0369a1" strokeWidth="2.5" />
        <path d={fakePath} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeDasharray={step === STEPS ? '0' : '5 3'} />
        <path d={dPath} fill="none" stroke="#a21caf" strokeWidth="1.75" strokeDasharray="2 3" />
        <line x1="10" y1={10 + (HEIGHT - 20) * 0.5} x2={WIDTH - 10} y2={10 + (HEIGHT - 20) * 0.5} stroke="#a21caf" strokeWidth="0.75" strokeOpacity="0.35" />
        <text x={WIDTH - 15} y={10 + (HEIGHT - 20) * 0.5 - 4} fontSize="9" fill="#a21caf" textAnchor="end">D(x) = 0.5</text>
      </svg>

      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.6rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#0369a1' }}>■ p<sub>data</sub>(x) — real, fixed</span>
        <span style={{ color: '#dc2626' }}>■ p<sub>g</sub>(x) — generator, step {step}/{STEPS}</span>
        <span style={{ color: '#a21caf' }}>┄ D*(x) — optimal discriminator</span>
      </div>

      <div style={{ marginTop: '0.75rem', padding: '0.7rem 1rem', borderRadius: '8px', background: converged ? '#f0fdf4' : '#fef9f0', border: `1px solid ${converged ? '#bbf7d0' : '#fde68a'}`, fontSize: '0.85rem' }}>
        {converged ? (
          <span><strong style={{ color: '#166534' }}>✓ Nash equilibrium reached:</strong> p<sub>g</sub> ≈ p<sub>data</sub>, so D*(x) ≈ 0.5 everywhere — the discriminator can no longer do better than a coin flip.</span>
        ) : (
          <span><strong style={{ color: '#92400e' }}>Not converged:</strong> D*(x) still tilts toward 1 where real mass dominates and toward 0 where fake mass dominates — that gap is exactly the signal G's gradient uses.</span>
        )}
      </div>
    </div>
  );
}
