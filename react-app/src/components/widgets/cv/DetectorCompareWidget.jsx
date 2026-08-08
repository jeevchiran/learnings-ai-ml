import { useState } from 'react'
import { TRACK, DETECTORS } from './cvUtils.js'
import { Readout, Caption } from './cvUi.jsx'

const W = 380, H = 250

/* mAP against speed, PASCAL VOC 2007, as published. The diagonal band matters
 * more than any single dot: two-stage detectors sit up-left (accurate, slow),
 * one-stage detectors down-right — until SSD lands in the top-right corner and
 * ends the trade-off as a law. */
export default function DetectorCompareWidget() {
  const [sel, setSel] = useState(4)

  const sx = fps => 44 + (Math.log10(Math.max(0.02, fps)) + 1.7) / 3.5 * (W - 60)
  const sy = m => H - 34 - ((m - 60) / 20) * (H - 56)

  return (
    <div>
      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4 }}>
          <line x1={44} y1={H - 34} x2={W - 8} y2={H - 34} stroke="var(--border,#ccc)" />
          <line x1={44} y1={12} x2={44} y2={H - 34} stroke="var(--border,#ccc)" />
          <text x={W - 74} y={H - 8} fontSize="10" fill="var(--text-muted,#999)">fps (log)</text>
          <text x={2} y={20} fontSize="10" fill="var(--text-muted,#999)">VOC07 mAP</text>
          {[0.02, 0.5, 5, 45, 59].map(f => (
            <text key={f} x={sx(f) - 8} y={H - 20} fontSize="9" fill="var(--text-muted,#999)">{f}</text>
          ))}
          {[62, 66, 70, 74, 78].map(m => (
            <g key={m}>
              <line x1={44} y1={sy(m)} x2={W - 8} y2={sy(m)} stroke="rgba(128,128,128,0.14)" />
              <text x={22} y={sy(m) + 3} fontSize="9" fill="var(--text-muted,#999)">{m}</text>
            </g>
          ))}
          {/* 30 fps = video rate */}
          <line x1={sx(30)} y1={12} x2={sx(30)} y2={H - 34} stroke="#dc2626" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
          <text x={sx(30) + 3} y={24} fontSize="9" fill="#dc2626">30 fps</text>

          {DETECTORS.map((d, i) => (
            <g key={d.name} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
              <circle cx={sx(d.fps)} cy={sy(d.map)} r={i === sel ? 8 : 5.5}
                fill={d.stage === 1 ? TRACK : '#2563eb'} opacity={i === sel ? 1 : 0.7} />
              <text x={sx(d.fps) + (i >= 4 ? -6 : 10)} y={sy(d.map) - 8} fontSize="10"
                textAnchor={i >= 4 ? 'end' : 'start'}
                fill={d.stage === 1 ? TRACK : '#2563eb'} fontWeight={i === sel ? 700 : 400}>{d.name}</text>
            </g>
          ))}
        </svg>

        <div style={{ fontSize: '0.79rem', minWidth: 250 }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.76rem' }}>
            <span><span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 5, background: '#2563eb', marginRight: 5 }} />two-stage</span>
            <span><span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 5, background: TRACK, marginRight: 5 }} />one-stage</span>
          </div>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.76rem' }}>
            <thead><tr style={{ opacity: 0.65 }}>
              <th style={{ padding: '2px 8px', textAlign: 'left' }}>detector</th>
              <th style={{ padding: '2px 8px', textAlign: 'right' }}>mAP</th>
              <th style={{ padding: '2px 8px', textAlign: 'right' }}>fps</th>
              <th style={{ padding: '2px 8px', textAlign: 'right' }}>s/img</th>
            </tr></thead>
            <tbody>
              {DETECTORS.map((d, i) => (
                <tr key={d.name} onClick={() => setSel(i)} style={{ cursor: 'pointer', background: i === sel ? 'rgba(21,128,61,0.12)' : 'transparent' }}>
                  <td style={{ padding: '2px 8px', color: d.stage === 1 ? TRACK : '#2563eb', fontWeight: i === sel ? 700 : 400 }}>{d.name}</td>
                  <td style={{ padding: '2px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{d.map.toFixed(1)}</td>
                  <td style={{ padding: '2px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{d.fps}</td>
                  <td style={{ padding: '2px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{d.sec}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ opacity: 0.8, lineHeight: 1.65, marginTop: '0.55rem' }}>{DETECTORS[sel].note}</p>
        </div>
      </div>

      <Readout items={[
        ['selected', DETECTORS[sel].name],
        ['type', DETECTORS[sel].stage === 2 ? 'two-stage (region-based)' : 'one-stage (single shot)'],
        ['speed vs R-CNN', `${(47 / DETECTORS[sel].sec).toFixed(0)}×`],
        ['real-time?', DETECTORS[sel].fps >= 30 ? 'yes (≥30 fps)' : 'no'],
      ]} />

      <Caption>
        The x-axis is logarithmic and still spans nearly four decades: R-CNN to SSD300 is a
        <strong> ~2,800× </strong> speed-up with <em>higher</em> accuracy. Two things bought it —
        sharing the backbone computation across regions, and replacing the per-region head with a dense
        prediction over the feature map. Every dot after Faster R-CNN is one of those two ideas being
        pushed harder.
      </Caption>
    </div>
  )
}
