import React, { useState } from 'react';
import { linearAlphaBar, cosineAlphaBar } from './diffusionUtils.js';

const T = 200;
const WIDTH = 480, HEIGHT = 200, PAD = 12;
const linear = linearAlphaBar(T);
const cosine = cosineAlphaBar(T);

function toPath(values) {
  const usableW = WIDTH - 2 * PAD, usableH = HEIGHT - 2 * PAD;
  return values
    .map((v, i) => {
      const x = PAD + (usableW * i) / (values.length - 1);
      const y = PAD + usableH * (1 - v);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export default function NoiseScheduleWidget() {
  const [markT, setMarkT] = useState(60);

  const linearPath = toPath(linear);
  const cosinePath = toPath(cosine);
  const markX = PAD + ((WIDTH - 2 * PAD) * markT) / T;

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          Linear vs. Cosine Schedule — Where Does ᾱ<sub>t</sub> Actually Drop?
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          ᾱ<sub>t</sub> is the fraction of original signal remaining at step t. Drag to compare both schedules at one timestep.
        </p>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: '100%', height: 'auto', background: 'var(--bg-canvas, #f8fafc)', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <line x1={markX} y1={PAD} x2={markX} y2={HEIGHT - PAD} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
        <path d={linearPath} fill="none" stroke="#0369a1" strokeWidth="2.5" />
        <path d={cosinePath} fill="none" stroke="#7c2d12" strokeWidth="2.5" />
      </svg>

      <input
        type="range" min="0" max={T} value={markT}
        onChange={(e) => setMarkT(+e.target.value)}
        style={{ width: '100%', accentColor: '#7c2d12', marginTop: '0.6rem' }}
      />

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#0369a1' }}>■ Linear: ᾱ<sub>{markT}</sub> = {linear[markT].toFixed(3)}</span>
        <span style={{ color: '#7c2d12' }}>■ Cosine: ᾱ<sub>{markT}</sub> = {cosine[markT].toFixed(3)}</span>
      </div>

      <div style={{ marginTop: '0.7rem', padding: '0.7rem 1rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
        Near t = 0, the cosine schedule keeps ᾱ<sub>t</sub> much closer to 1 — it destroys signal far more gently at the start, spending more of the chain's steps on fine detail instead of burning them early on coarse noise.
      </div>
    </div>
  );
}
