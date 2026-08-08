import { useState } from 'react'
import { TRACK } from './cvUtils.js'
import { Row, Btn, Readout, Caption } from './cvUi.jsx'

/* Per-stage test-time cost in seconds for one image, VGG16 backbone, as reported
 * in the R-CNN / Fast R-CNN / Faster R-CNN papers. The point of the chart is
 * which bar disappears at each generation. */
const FAMILY = {
  'R-CNN': {
    map: 66.0, trained: '4 separate stages',
    stages: [
      { name: 'selective search (CPU)', t: 2.0, col: '#f59e0b' },
      { name: 'CNN forward × 2000 crops', t: 44.0, col: '#dc2626' },
      { name: 'SVM + box regressor', t: 1.0, col: '#6b7280' },
    ],
    note: 'Every one of ~2000 warped crops gets its own full CNN pass. Features are cached to disk (hundreds of GB), then an SVM per class and a separate regressor are trained on top. Nothing is learned end to end.',
  },
  'Fast R-CNN': {
    map: 70.0, trained: '1 stage (after proposals)',
    stages: [
      { name: 'selective search (CPU)', t: 2.0, col: '#f59e0b' },
      { name: 'CNN forward × 1 image', t: 0.22, col: '#dc2626' },
      { name: 'RoI pool + softmax + box head', t: 0.10, col: TRACK },
    ],
    note: 'One CNN pass over the whole image; each proposal is a RoI-pooled crop of the shared feature map. Classification and box regression become two heads of one network with one multi-task loss. Proposals are now the bottleneck — 87% of the time.',
  },
  'Faster R-CNN': {
    map: 73.2, trained: '1 stage, end to end',
    stages: [
      { name: 'CNN forward × 1 image', t: 0.146, col: '#dc2626' },
      { name: 'RPN (proposals)', t: 0.010, col: '#f59e0b' },
      { name: 'RoI heads (300 proposals)', t: 0.042, col: TRACK },
    ],
    note: 'Selective search is replaced by a Region Proposal Network sliding over the same feature map, so proposals cost 10 ms instead of 2 s and are learned rather than hand-designed. Anchors enter here.',
  },
}

const NAMES = Object.keys(FAMILY)
const MAXT = 47

export default function RCNNPipelineWidget() {
  const [sel, setSel] = useState('Fast R-CNN')
  const d = FAMILY[sel]
  const total = d.stages.reduce((s, x) => s + x.t, 0)

  return (
    <div>
      <Row style={{ marginBottom: '0.7rem' }}>
        {NAMES.map(n => <Btn key={n} primary={n === sel} onClick={() => setSel(n)}>{n}</Btn>)}
      </Row>

      <div style={{ fontSize: '0.79rem' }}>
        {NAMES.map(n => {
          const f = FAMILY[n]
          const t = f.stages.reduce((s, x) => s + x.t, 0)
          const active = n === sel
          return (
            <div key={n} style={{ marginBottom: '0.7rem', opacity: active ? 1 : 0.45 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <strong>{n}</strong>
                <span style={{ fontFamily: 'monospace' }}>{t.toFixed(2)} s/image · {f.map} mAP</span>
              </div>
              <div style={{ display: 'flex', height: 20, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-hover,#eee)' }}>
                {f.stages.map(s => (
                  <div key={s.name} title={`${s.name}: ${s.t}s`}
                    style={{ width: `${(s.t / MAXT) * 100}%`, background: s.col, minWidth: 2 }} />
                ))}
              </div>
            </div>
          )
        })}
        <div style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: -4 }}>
          bars share one scale: full width = 47 s (R-CNN)
        </div>
      </div>

      <div style={{ marginTop: '0.9rem', fontSize: '0.8rem' }}>
        <div style={{ fontWeight: 700, marginBottom: 5 }}>{sel} — where the time goes</div>
        {d.stages.map(s => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: 4 }}>
            <span style={{ width: 11, height: 11, background: s.col, borderRadius: 2, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{s.name}</span>
            <span style={{ fontFamily: 'monospace' }}>{s.t.toFixed(3)} s</span>
            <span style={{ fontFamily: 'monospace', opacity: 0.65, width: 46, textAlign: 'right' }}>
              {((s.t / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
        <p style={{ opacity: 0.8, lineHeight: 1.65, marginTop: '0.55rem' }}>{d.note}</p>
      </div>

      <Readout items={[
        ['total', `${total.toFixed(3)} s`],
        ['fps', (1 / total).toFixed(2)],
        ['VOC07 mAP', d.map],
        ['training', d.trained],
        ['vs R-CNN', `${(47 / total).toFixed(0)}× faster`],
      ]} />

      <Caption>
        Read the three bars as one story: R-CNN's cost is <em>redundant CNN passes</em>, and RoI pooling
        deletes it. Fast R-CNN's remaining cost is <em>hand-crafted proposals on the CPU</em>, and the RPN
        deletes that. What survives in Faster R-CNN is the backbone itself plus a per-region head that
        still runs 300 times — the last redundancy, and the one single-shot detectors go after next.
      </Caption>
    </div>
  )
}
