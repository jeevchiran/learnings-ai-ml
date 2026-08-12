import { useState } from 'react'
import { TRACK, BACKBONES } from './tlUtils.js'
import { Accent, Readout, Caption } from '../shared/ui.jsx'

const W = 380, H = 240

export default function BackboneCompareWidget() {
  const [sel, setSel] = useState(1)
  const b = BACKBONES[sel]

  const sx = p => 46 + (Math.log10(p) + 0.4) / 2.4 * (W - 66)
  const sy = a => H - 34 - ((a - 68) / 16) * (H - 56)

  return (
    <Accent value={TRACK}>
      <div>
        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4 }}>
            <line x1={46} y1={H - 34} x2={W - 8} y2={H - 34} stroke="var(--border,#ccc)" />
            <line x1={46} y1={12} x2={46} y2={H - 34} stroke="var(--border,#ccc)" />
            <text x={W - 92} y={H - 8} fontSize="10" fill="var(--text-muted,#999)">params (M, log)</text>
            <text x={2} y={20} fontSize="10" fill="var(--text-muted,#999)">top-1 %</text>
            {[70, 75, 80].map(a => (
              <g key={a}>
                <line x1={46} y1={sy(a)} x2={W - 8} y2={sy(a)} stroke="rgba(128,128,128,0.14)" />
                <text x={24} y={sy(a) + 3} fontSize="9" fill="var(--text-muted,#999)">{a}</text>
              </g>
            ))}
            {[5, 10, 25, 90].map(p => (
              <text key={p} x={sx(p) - 6} y={H - 20} fontSize="9" fill="var(--text-muted,#999)">{p}</text>
            ))}
            {BACKBONES.map((m, i) => (
              <g key={m.name} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
                <circle cx={sx(m.params)} cy={sy(m.top1)} r={i === sel ? 8 : 5.5}
                  fill={i === sel ? TRACK : 'rgba(159,18,57,0.45)'} />
                <text x={sx(m.params)} y={sy(m.top1) - 11} textAnchor="middle" fontSize="9"
                  fontWeight={i === sel ? 700 : 400} fill="var(--text,#333)">{m.name}</text>
              </g>
            ))}
          </svg>

          <div style={{ fontSize: '0.79rem', minWidth: 260 }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '0.76rem' }}>
              <thead><tr style={{ opacity: 0.65 }}>
                <th style={{ padding: '2px 8px', textAlign: 'left' }}>backbone</th>
                <th style={{ padding: '2px 8px', textAlign: 'right' }}>params</th>
                <th style={{ padding: '2px 8px', textAlign: 'right' }}>top-1</th>
                <th style={{ padding: '2px 8px', textAlign: 'right' }}>embed dim</th>
              </tr></thead>
              <tbody>
                {BACKBONES.map((m, i) => (
                  <tr key={m.name} onClick={() => setSel(i)}
                    style={{ cursor: 'pointer', background: i === sel ? 'rgba(159,18,57,0.10)' : 'transparent' }}>
                    <td style={{ padding: '2px 8px', fontWeight: i === sel ? 700 : 400 }}>{m.name}</td>
                    <td style={{ padding: '2px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{m.params}M</td>
                    <td style={{ padding: '2px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{m.top1}</td>
                    <td style={{ padding: '2px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{m.dim}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ opacity: 0.8, marginTop: '0.55rem', lineHeight: 1.65 }}>{b.note}</p>
          </div>
        </div>

        <Readout items={[
          ['selected', b.name],
          ['embedding dim', b.dim],
          ['head params (1000-way)', `${((b.dim * 1000 + 1000) / 1e6).toFixed(2)}M`],
          ['head params (10-way)', `${((b.dim * 10 + 10) / 1e3).toFixed(1)}k`],
        ]} />

        <Caption>
          The <strong>embed dim</strong> column is the one that matters for the next module: it is the length of
          the vector you get when you cut the classifier off. Note that a bigger backbone means a bigger
          embedding <em>and</em> a bigger head — swapping ResNet-18 for ViT-B/16 makes your 10-class head grow
          from 5.1k to 7.7k parameters, which is nothing, while the backbone grows 7×, which is not.
        </Caption>
      </div>
    </Accent>
  )
}
