import { useState } from 'react'
import { TRACK, nearestUpsample, bilinearUpsample, bedOfNails, maxUnpool, maxPoolWithIndices } from './tlUtils.js'
import { Accent, PixelGrid, Row, Select, Toggle, Readout, Caption } from '../shared/ui.jsx'

const SRC = [
  [ 20,  60, 200, 180],
  [ 40,  90, 220, 160],
  [210, 190,  50,  30],
  [180, 170,  70,  25],
]

const METHODS = ['nearest', 'bilinear', 'bed of nails', 'max-unpool']

export default function UpsamplingWidget() {
  const [method, setMethod] = useState('bilinear')
  const [values, setValues] = useState(true)

  // pooling first, so max-unpool has somewhere to put things back
  const { out: pooled, idx } = maxPoolWithIndices(SRC, 2)

  const result =
    method === 'nearest'      ? nearestUpsample(pooled, 2)
    : method === 'bilinear'   ? bilinearUpsample(pooled, 2)
    : method === 'bed of nails' ? bedOfNails(pooled, 2)
    : maxUnpool(pooled, idx, 2)

  const learned = false
  const nonzero = result.flat().filter(v => v > 0).length
  const err = result.flat().reduce((s, v, i) => s + Math.abs(v - SRC.flat()[i]), 0) / 16

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          <Select label="method" value={method} onChange={setMethod} options={METHODS} />
          <Toggle label="values" on={values} onChange={setValues} />
        </Row>

        <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <PixelGrid img={SRC} cell={30} showValues={values} title="original 4×4" />
          <div style={{ fontSize: '1.2rem', opacity: 0.5 }}>→</div>
          <PixelGrid img={pooled} cell={30} showValues={values} title="after 2×2 max-pool" />
          <div style={{ fontSize: '1.2rem', opacity: 0.5 }}>→</div>
          <PixelGrid img={result} cell={30} showValues={values}
            title={`upsampled — ${method}`}
            fmt={v => (Number.isInteger(v) ? v : v.toFixed(0))} />
        </div>

        <Readout items={[
          ['learned parameters', learned ? 'yes' : '0 — none of these learn anything'],
          ['non-zero cells', `${nonzero} / 16`],
          ['mean |error| vs original', err.toFixed(1)],
          ['cost', method === 'bilinear' ? '4 taps/px' : '1 lookup/px'],
        ]} />

        <Caption>
          None of these four has a single trainable weight — they are <strong>fixed rules</strong>, which is their
          appeal and their limit.
          <br /><br />
          <strong>Nearest</strong> duplicates, so edges stay hard and blocky. <strong>Bilinear</strong> interpolates,
          so it is smooth but cannot invent an edge that the low-resolution map does not contain.
          <strong> Bed of nails</strong> leaves 75% zeros for the next conv to fill in.
          <strong> Max-unpool</strong> is the interesting one: it remembers <em>where</em> each maximum came from
          during pooling and puts the value back exactly there — so it restores position information the other
          three permanently lost. The price is that you must keep the pooling indices around, which couples the
          decoder to a specific encoder.
          <br /><br />
          Compare the error column across methods: bilinear usually wins on average error while max-unpool wins on
          <em> edge placement</em>. Neither can recover the detail that pooling threw away — only a skip connection can.
        </Caption>
      </div>
    </Accent>
  )
}
