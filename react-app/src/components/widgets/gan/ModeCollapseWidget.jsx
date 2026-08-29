import React, { useMemo, useState } from 'react';
import { seededCluster } from './ganUtils.js';

const CENTERS = [
  { x: -6, y: 6 }, { x: 6, y: 6 }, { x: -6, y: -6 }, { x: 6, y: -6 },
];

function toSvg(pt, size) {
  return { x: size / 2 + pt.x * (size / 20), y: size / 2 - pt.y * (size / 20) };
}

export default function ModeCollapseWidget() {
  const [fixed, setFixed] = useState(false);
  const size = 260;

  const realPoints = useMemo(
    () => CENTERS.flatMap((c, i) => seededCluster(c.x, c.y, 1.6, 18, 1000 + i)),
    []
  );

  const collapsedPoints = useMemo(() => seededCluster(CENTERS[1].x, CENTERS[1].y, 1.8, 60, 42), []);
  const fixedPoints = useMemo(
    () => CENTERS.flatMap((c, i) => seededCluster(c.x, c.y, 1.7, 15, 7000 + i)),
    []
  );

  const genPoints = fixed ? fixedPoints : collapsedPoints;

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
            Mode Collapse — Same Discriminator Score, Very Different Coverage
          </h4>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
            Real data has four clusters. Toggle the generator between collapsing onto one and covering all four.
          </p>
        </div>
        <button
          onClick={() => setFixed((f) => !f)}
          style={{ padding: '0.45rem 1rem', borderRadius: '6px', border: 'none', background: fixed ? '#166534' : '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
        >
          {fixed ? '✓ Diversity fix applied' : 'Apply minibatch-discrimination fix'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem' }}>REAL DATA — 4 MODES</div>
          <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: 260, background: '#0f172a', borderRadius: '8px' }}>
            {realPoints.map((p, i) => {
              const s = toSvg(p, size);
              return <circle key={i} cx={s.x} cy={s.y} r="3" fill="#0ea5e9" fillOpacity="0.8" />;
            })}
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem' }}>
            GENERATOR SAMPLES — {fixed ? 'ALL 4 MODES COVERED' : 'COLLAPSED TO 1 MODE'}
          </div>
          <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: 260, background: '#0f172a', borderRadius: '8px' }}>
            {genPoints.map((p, i) => {
              const s = toSvg(p, size);
              return <circle key={i} cx={s.x} cy={s.y} r="3" fill={fixed ? '#22c55e' : '#f97316'} fillOpacity="0.85" />;
            })}
          </svg>
        </div>
      </div>

      <div style={{ marginTop: '0.85rem', padding: '0.7rem 1rem', borderRadius: '8px', background: fixed ? '#f0fdf4' : '#fef2f2', border: `1px solid ${fixed ? '#bbf7d0' : '#fecaca'}`, fontSize: '0.85rem' }}>
        {fixed ? (
          <span><strong style={{ color: '#166534' }}>Fixed:</strong> a discriminator that sees a whole minibatch at once can penalise low intra-batch variance directly, rewarding G for spreading across modes instead of just fooling D one sample at a time.</span>
        ) : (
          <span><strong style={{ color: '#991b1b' }}>Collapsed:</strong> every sample lands in one real cluster. D(x) may still score each individual fake sample as "realistic" — a per-sample discriminator has no way to notice that G stopped producing the other three clusters.</span>
        )}
      </div>
    </div>
  );
}
