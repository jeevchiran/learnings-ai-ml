import React, { useState } from 'react';
import { expressedConfidence, actualAccuracy, buildCurvePath } from './genaiRisksUtils.js';

const WIDTH = 500, HEIGHT = 220, PAD = 16;
const X_MAX = 100;

export default function CalibrationGapWidget() {
  const [obscurity, setObscurity] = useState(20);

  const box = { xMin: 0, xMax: X_MAX, yMax: 100, width: WIDTH, height: HEIGHT, padding: PAD };
  const confidencePath = buildCurvePath(expressedConfidence, box);
  const accuracyPath = buildCurvePath(actualAccuracy, box);

  const conf = expressedConfidence(obscurity);
  const acc = actualAccuracy(obscurity);
  const gap = conf - acc;

  const markX = PAD + ((WIDTH - 2 * PAD) * obscurity) / X_MAX;
  const yFor = (v) => PAD + (HEIGHT - 2 * PAD) * (1 - v / 100);

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          The Calibration Gap
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          Illustrative curves, not measured data. Drag toward the long tail and watch what the answer sounds like stop tracking whether it is right.
        </p>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: '100%', height: 'auto', background: 'var(--bg-canvas, #f8fafc)', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <line x1={markX} y1={PAD} x2={markX} y2={HEIGHT - PAD} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
        <line x1={markX} y1={yFor(acc)} x2={markX} y2={yFor(conf)} stroke="#b91c1c" strokeWidth="6" strokeOpacity="0.22" />
        <path d={confidencePath} fill="none" stroke="#0369a1" strokeWidth="2.5" />
        <path d={accuracyPath} fill="none" stroke="#b91c1c" strokeWidth="2.5" />
        <circle cx={markX} cy={yFor(conf)} r="4" fill="#0369a1" />
        <circle cx={markX} cy={yFor(acc)} r="4" fill="#b91c1c" />
      </svg>

      <input
        type="range" min="0" max={X_MAX} value={obscurity}
        onChange={(e) => setObscurity(+e.target.value)}
        style={{ width: '100%', accentColor: '#b91c1c', marginTop: '0.6rem' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
        <span>Common, well-covered question</span>
        <span>Obscure, long-tail question</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
        <div style={{ padding: '0.7rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>SOUNDS CONFIDENT</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0369a1' }}>{conf.toFixed(0)}%</div>
        </div>
        <div style={{ padding: '0.7rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>ACTUALLY CORRECT</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#b91c1c' }}>{acc.toFixed(0)}%</div>
        </div>
        <div style={{ padding: '0.7rem', borderRadius: '8px', background: gap > 40 ? '#fef2f2' : 'var(--bg-secondary, #f8fafc)', border: `1px solid ${gap > 40 ? '#fecaca' : '#e2e8f0'}`, textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>CALIBRATION GAP</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#7c2d12' }}>{gap.toFixed(0)} pts</div>
        </div>
      </div>

      <div style={{ marginTop: '0.8rem', padding: '0.7rem 1rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
        A user has no access to the red line — only the blue one. That is what makes the gap dangerous rather than merely inaccurate: the signal a person would naturally use to gauge trustworthiness barely moves.
      </div>
    </div>
  );
}
