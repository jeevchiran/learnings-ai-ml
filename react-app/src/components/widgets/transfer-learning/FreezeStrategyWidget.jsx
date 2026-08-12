import { useState } from 'react'
import { TRACK, freezeSplit } from './tlUtils.js'
import { Accent, Row, Slider, Readout, Caption } from '../shared/ui.jsx'

const STAGES = ['stem', 'stage1', 'stage2', 'stage3', 'stage4']

/* How much of a ResNet-50 you unfreeze is a data-size decision, not a taste
 * one: every trainable parameter is one more thing your dataset has to pin down. */
export default function FreezeStrategyWidget() {
  const [freeze, setFreeze] = useState(4)
  const [nImages, setNImages] = useState(1000)

  const s = freezeSplit(freeze)
  // rule of thumb: you want on the order of 10 labelled images per 1k trainable params
  const imagesPerParam = nImages / (s.trainable * 1e6)
  const risk = imagesPerParam > 4e-4 ? 'low' : imagesPerParam > 1e-4 ? 'moderate' : 'high'
  const riskColor = risk === 'low' ? TRACK : risk === 'moderate' ? '#d97706' : '#dc2626'

  const barW = 300
  const total = s.perStage.reduce((a, b) => a + b, 0) + s.headParams

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.7rem' }}>
          <Slider label="freeze up to" value={freeze} onChange={setFreeze} min={0} max={5}
            fmt={v => (v === 0 ? 'nothing' : STAGES[v - 1])} width={130} />
          <Slider label="labelled images" value={nImages} onChange={setNImages}
            min={100} max={50000} step={100} fmt={v => v.toLocaleString()} width={130} />
        </Row>

        <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '0.79rem' }}>
            <div style={{ fontWeight: 700, marginBottom: 5 }}>ResNet-50 parameter budget</div>
            <svg width={barW} height={54}>
              {(() => {
                let x = 0
                return [...s.perStage.map((p, i) => ({ p, i, frozen: i < freeze, label: STAGES[i] })),
                        { p: s.headParams, i: 5, frozen: false, label: 'head' }].map(seg => {
                  const w = (seg.p / total) * barW
                  const el = (
                    <g key={seg.label}>
                      <rect x={x} y={8} width={Math.max(1, w - 1)} height={22}
                        fill={seg.frozen ? 'rgba(128,128,128,0.35)' : TRACK} />
                      {w > 34 && (
                        <text x={x + w / 2} y={23} textAnchor="middle" fontSize="8.5"
                          fill={seg.frozen ? 'var(--text-muted,#888)' : '#fff'}>{seg.label}</text>
                      )}
                      <text x={x + w / 2} y={44} textAnchor="middle" fontSize="8"
                        fill="var(--text-muted,#999)">{seg.p.toFixed(1)}M</text>
                    </g>
                  )
                  x += w
                  return el
                })
              })()}
            </svg>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.74rem', marginTop: 4 }}>
              <span><span style={{ display: 'inline-block', width: 9, height: 9, background: 'rgba(128,128,128,0.35)', marginRight: 4 }} />frozen</span>
              <span><span style={{ display: 'inline-block', width: 9, height: 9, background: TRACK, marginRight: 4 }} />trainable</span>
            </div>
            <p style={{ fontSize: '0.74rem', opacity: 0.72, marginTop: '0.5rem', maxWidth: 300, lineHeight: 1.6 }}>
              Note how back-loaded the parameters are: <strong>stage4 alone is 12M of 25.6M</strong>. Freezing the
              stem buys you almost nothing; freezing through stage3 barely dents the trainable count either.
              The decision that matters is whether stage4 moves.
            </p>
          </div>

          <div style={{ fontSize: '0.8rem', minWidth: 230 }}>
            <div style={{ fontWeight: 700, marginBottom: 5 }}>Does your data support this?</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: 1.9 }}>
              trainable &nbsp;= {s.trainable.toFixed(1)}M<br />
              images &nbsp;&nbsp;&nbsp;= {nImages.toLocaleString()}<br />
              ratio &nbsp;&nbsp;&nbsp;&nbsp;= {(imagesPerParam * 1e6).toFixed(1)} images / M params<br />
              overfit risk = <strong style={{ color: riskColor }}>{risk}</strong>
            </div>
            <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', opacity: 0.78, lineHeight: 1.6 }}>
              {risk === 'high' && 'Freeze more, or get more data. A backbone this open will memorise a set this small.'}
              {risk === 'moderate' && 'Workable with strong augmentation, early stopping and a low backbone LR.'}
              {risk === 'low' && 'Enough data to move these weights. Still use a lower LR on the backbone than the head.'}
            </div>
          </div>
        </div>

        <Readout items={[
          ['frozen', `${s.frozen.toFixed(1)}M (${s.frozenPct.toFixed(0)}%)`],
          ['trainable', `${s.trainable.toFixed(1)}M`],
          ['head', `${s.headParams.toFixed(2)}M`],
          ['strategy', freeze >= 5 ? 'feature extraction' : freeze === 0 ? 'full fine-tune' : 'partial fine-tune'],
        ]} />

        <Caption>
          Drag <strong>freeze up to → stage4</strong> with 500 images: 93% of the network is frozen and you are
          training a 2M-parameter head — that is <em>feature extraction</em>, and it is the right call on small
          data. Now drag to <strong>nothing</strong> and watch the risk flip to high. The backbone did not get
          worse; your dataset just cannot supply 27.7M constraints.
        </Caption>
      </div>
    </Accent>
  )
}
