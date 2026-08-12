import { useState } from 'react'
import { TRACK, DOMAINS, transferability } from './tlUtils.js'
import { Accent, Row, Select, Readout, Caption } from '../shared/ui.jsx'

const LAYERS = ['conv1\nedges', 'conv2\ntextures', 'conv3\npatterns', 'conv4\nparts', 'conv5\nobjects', 'fc\nclasses']
const W = 420, H = 210

/* Yosinski et al. (2014) measured this shape: early features are near-universal,
 * deep ones are ImageNet-specific, and the collapse point moves earlier the
 * further your domain sits from natural photographs. */
export default function TransferabilityWidget() {
  const [domain, setDomain] = useState('Medical imaging')
  const d = DOMAINS.find(x => x.name === domain)

  const sx = i => 40 + (i / (LAYERS.length - 1)) * (W - 62)
  const sy = v => H - 42 - v * (H - 66)
  const curve = dd => LAYERS.map((_, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(transferability(i, dd)).toFixed(1)}`).join(' ')

  // last layer whose transferred features still retain 80% of their usefulness
  const cutoff = LAYERS.reduce((acc, _, i) => (transferability(i, d.distance) >= 0.8 ? i : acc), 0)

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          <Select label="target domain" value={domain} onChange={setDomain} options={DOMAINS.map(x => x.name)} />
          <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>{d.example}</span>
        </Row>

        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4 }}>
            <line x1={40} y1={H - 42} x2={W - 10} y2={H - 42} stroke="var(--border,#ccc)" />
            <line x1={40} y1={14} x2={40} y2={H - 42} stroke="var(--border,#ccc)" />
            {[0, 0.5, 1].map(t => (
              <g key={t}>
                <line x1={40} y1={sy(t)} x2={W - 10} y2={sy(t)} stroke="rgba(128,128,128,0.15)" />
                <text x={16} y={sy(t) + 3} fontSize="9" fill="var(--text-muted,#999)">{t}</text>
              </g>
            ))}
            {DOMAINS.map(dd => (
              <path key={dd.name} d={curve(dd.distance)} fill="none"
                stroke={dd.name === domain ? TRACK : 'rgba(128,128,128,0.35)'}
                strokeWidth={dd.name === domain ? 2.6 : 1.2} />
            ))}
            {LAYERS.map((l, i) => (
              <g key={l}>
                <circle cx={sx(i)} cy={sy(transferability(i, d.distance))} r={4} fill={TRACK} />
                {l.split('\n').map((line, j) => (
                  <text key={j} x={sx(i)} y={H - 28 + j * 10} textAnchor="middle" fontSize="8.5"
                    fill="var(--text-muted,#999)">{line}</text>
                ))}
              </g>
            ))}
            <text x={4} y={14} fontSize="9" fill="var(--text-muted,#999)">usefulness</text>
          </svg>

          <div style={{ fontSize: '0.79rem', minWidth: 230 }}>
            <div style={{ fontWeight: 700, marginBottom: 5 }}>{domain}</div>
            <table style={{ borderCollapse: 'collapse', fontSize: '0.77rem', fontFamily: 'monospace' }}>
              <tbody>
                {LAYERS.map((l, i) => {
                  const v = transferability(i, d.distance)
                  return (
                    <tr key={l}>
                      <td style={{ padding: '2px 10px 2px 0' }}>{l.split('\n')[0]}</td>
                      <td style={{ width: 90 }}>
                        <span style={{ display: 'block', height: 8, background: 'var(--bg-hover,#eee)', borderRadius: 3 }}>
                          <span style={{ display: 'block', width: `${v * 100}%`, height: '100%', background: TRACK, borderRadius: 3 }} />
                        </span>
                      </td>
                      <td style={{ padding: '2px 0 2px 8px', textAlign: 'right' }}>{v.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.5rem', lineHeight: 1.6 }}>
              Freeze up to <strong>{LAYERS[cutoff].split('\n')[0]}</strong> and fine-tune everything after it.
              Anything deeper has already specialised to ImageNet's thousand classes.
            </p>
          </div>
        </div>

        <Readout items={[
          ['domain distance', d.distance.toFixed(2)],
          ['safe freeze depth', LAYERS[cutoff].split('\n')[0]],
          ['conv1 transfers at', transferability(0, d.distance).toFixed(2)],
          ['fc transfers at', transferability(5, d.distance).toFixed(2)],
        ]} />

        <Caption>
          Switch between <strong>Everyday photos</strong> and <strong>Microscopy</strong>: the first layer barely
          moves — an edge is an edge whatever you photograph — while the last layer collapses. That asymmetry is
          the whole reason transfer learning is a <em>layer-wise</em> decision rather than an on/off switch, and it
          is why "just fine-tune everything" wastes data on relearning edge detectors you already had.
        </Caption>
      </div>
    </Accent>
  )
}
