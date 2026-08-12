import { useState } from 'react'
import { TRACK, unetSpec } from './tlUtils.js'
import { Accent, Row, Slider, Toggle, Readout, Caption } from '../shared/ui.jsx'

const W = 460, H = 300

export default function UNetWidget() {
  const [padded, setPadded] = useState(false)
  const [base, setBase] = useState(64)
  const [sel, setSel] = useState(null)

  const input = padded ? 256 : 572
  const spec = unetSpec({ base, input, padded })
  const depth = 4

  const enc = spec.stages.filter(s => s.kind === 'enc')
  const bott = spec.stages.find(s => s.kind === 'bottleneck')
  const dec = spec.stages.filter(s => s.kind === 'dec')

  const rowY = lvl => 34 + lvl * 52
  const encX = 96, decX = W - 96

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          <Toggle label="padded convs (same-size)" on={padded} onChange={setPadded} />
          <Slider label="base channels" value={base} onChange={setBase} min={8} max={64} step={8} width={100} />
          <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>click a level to inspect its skip</span>
        </Row>

        <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <svg width={W} height={H} style={{ display: 'block', border: '1px solid var(--border,#d4d4d8)', borderRadius: 4 }}>
            {enc.map(s => {
              const d = dec.find(x => x.level === s.level)
              const y = rowY(s.level)
              const cropped = s.size !== d.size
              return (
                <g key={`skip${s.level}`} onClick={() => setSel(s.level)} style={{ cursor: 'pointer' }}>
                  <line x1={encX + 34} y1={y} x2={decX - 34} y2={y}
                    stroke={sel === s.level ? TRACK : 'rgba(159,18,57,0.35)'}
                    strokeWidth={sel === s.level ? 3 : 1.6}
                    strokeDasharray={cropped ? '6 3' : 'none'} />
                  <polygon points={`${decX - 34},${y} ${decX - 42},${y - 4} ${decX - 42},${y + 4}`}
                    fill={sel === s.level ? TRACK : 'rgba(159,18,57,0.45)'} />
                  <text x={(encX + decX) / 2} y={y - 6} textAnchor="middle" fontSize="8.5"
                    fill={sel === s.level ? TRACK : 'var(--text-muted,#999)'}>
                    copy{cropped ? ' + crop' : ''} {s.ch}ch
                  </text>
                </g>
              )
            })}

            {enc.map(s => (
              <g key={`e${s.level}`} onClick={() => setSel(s.level)} style={{ cursor: 'pointer' }}>
                <rect x={encX - 34} y={rowY(s.level) - 13} width={68} height={26} rx={3}
                  fill={sel === s.level ? TRACK : 'rgba(159,18,57,0.55)'} />
                <text x={encX} y={rowY(s.level) + 4} textAnchor="middle" fontSize="9.5" fill="#fff">
                  {s.size}² × {s.ch}
                </text>
              </g>
            ))}
            {dec.map(s => (
              <g key={`d${s.level}`} onClick={() => setSel(s.level)} style={{ cursor: 'pointer' }}>
                <rect x={decX - 34} y={rowY(s.level) - 13} width={68} height={26} rx={3}
                  fill={sel === s.level ? TRACK : 'rgba(37,99,235,0.6)'} />
                <text x={decX} y={rowY(s.level) + 4} textAnchor="middle" fontSize="9.5" fill="#fff">
                  {s.size}² × {s.ch}
                </text>
              </g>
            ))}
            <rect x={W / 2 - 46} y={rowY(depth) - 13} width={92} height={26} rx={3} fill="#111" />
            <text x={W / 2} y={rowY(depth) + 4} textAnchor="middle" fontSize="9.5" fill="#fff">
              {bott.size}² × {bott.ch}
            </text>

            {/* down / up arrows */}
            {[0, 1, 2, 3].map(l => (
              <g key={`arr${l}`}>
                <line x1={encX} y1={rowY(l) + 13} x2={encX} y2={rowY(l + 1) - 13} stroke="var(--text-muted,#999)" strokeWidth="1.4" />
                <polygon points={`${encX},${rowY(l + 1) - 13} ${encX - 4},${rowY(l + 1) - 21} ${encX + 4},${rowY(l + 1) - 21}`} fill="var(--text-muted,#999)" />
                <line x1={decX} y1={rowY(l + 1) - 13} x2={decX} y2={rowY(l) + 13} stroke="var(--text-muted,#999)" strokeWidth="1.4" />
                <polygon points={`${decX},${rowY(l) + 13} ${decX - 4},${rowY(l) + 21} ${decX + 4},${rowY(l) + 21}`} fill="var(--text-muted,#999)" />
              </g>
            ))}
            <line x1={encX} y1={rowY(4) - 13} x2={W / 2 - 46} y2={rowY(4)} stroke="var(--text-muted,#999)" strokeWidth="1.4" />
            <line x1={W / 2 + 46} y1={rowY(4)} x2={decX} y2={rowY(4) - 13} stroke="var(--text-muted,#999)" strokeWidth="1.4" />
            <text x={encX - 62} y={rowY(0) + 4} fontSize="9" fill="var(--text-muted,#999)">encoder</text>
            <text x={decX + 8} y={rowY(0) + 4} fontSize="9" fill="var(--text-muted,#999)">decoder</text>
            <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--text-muted,#999)">
              input {spec.inputSize}² → output {spec.outSize}²
            </text>
          </svg>

          <div style={{ fontSize: '0.79rem', minWidth: 230 }}>
            {sel === null ? (
              <p style={{ opacity: 0.75, lineHeight: 1.65 }}>
                Each horizontal line is a skip: the encoder's feature map is copied across and
                <strong> concatenated</strong> onto the decoder's upsampled one, doubling the channel count
                before the next conv pair.
              </p>
            ) : (() => {
              const e = enc.find(x => x.level === sel), d = dec.find(x => x.level === sel)
              const crop = (e.size - d.size) / 2
              return (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 5 }}>Level {sel}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.76rem', lineHeight: 1.85 }}>
                    encoder out &nbsp;{e.size}² × {e.ch}<br />
                    after up-conv {d.inSize}² × {d.ch}<br />
                    {crop > 0
                      ? <>crop encoder by {crop} px/side → {d.inSize}²<br /></>
                      : <>sizes already match — no crop<br /></>}
                    concat &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{d.inSize}² × {2 * d.ch}<br />
                    two 3×3 convs → {d.size}² × {d.ch}
                  </div>
                  <p style={{ fontSize: '0.74rem', opacity: 0.75, marginTop: '0.5rem', lineHeight: 1.6 }}>
                    {crop > 0
                      ? 'Unpadded convs shrink the map every time, so the encoder tensor is larger than the decoder one and must be centre-cropped before concatenating. This is what the original paper does.'
                      : 'With padded convs the two maps are the same size, so no cropping is needed — which is why almost every modern implementation pads.'}
                  </p>
                </div>
              )
            })()}
          </div>
        </div>

        <Readout items={[
          ['input → output', `${spec.inputSize}² → ${spec.outSize}²`],
          ['parameters', spec.params.toLocaleString()],
          ['channels', `${base} → ${base * 16}`],
          ['convs', padded ? 'padded (same)' : 'unpadded (valid)'],
        ]} />

        <Caption>
          With the paper's settings (<strong>base 64, unpadded</strong>) this is exactly the 2015 U-Net:
          <strong> 31,030,658 parameters</strong>, 572² in and 388² out. The output is <em>smaller than the input</em>
          because every 3×3 conv without padding loses a pixel border — 4 per level, compounding through the
          depth. Ronneberger et al. handled that with overlap-tile inference: to segment a large image you feed
          overlapping 572² tiles and keep the valid 388² centre of each.
          <br /><br />
          Turn on <strong>padded convs</strong> and the skips stop needing a crop. Drop <strong>base channels</strong>
          to 16 and watch the parameter count fall roughly 16× — capacity scales with the <em>square</em> of the
          channel width, which is the first knob to reach for when a U-Net overfits a small medical dataset.
        </Caption>
      </div>
    </Accent>
  )
}
