import { useState } from 'react'
import {
  SAMPLE_IMAGES, KERNELS, TRACK, convolve2d, medianFilter, saltPepper,
  kernelSum, signedToDisplay, clampToDisplay,
} from './cvUtils.js'
import { PixelGrid, KernelGrid, Row, Select, Toggle, Readout, Caption } from './cvUi.jsx'

const FILTERS = [...Object.keys(KERNELS), 'Median 3×3 (rank)']
const BORDERS = ['reflect', 'replicate', 'zero']

function mae(a, b) {
  const fa = a.flat(), fb = b.flat()
  return fa.reduce((s, v, i) => s + Math.abs(v - fb[i]), 0) / fa.length
}

export default function FilterBankWidget() {
  const [imgName, setImgName] = useState('Bright square')
  const [filt, setFilt] = useState('Gaussian')
  const [border, setBorder] = useState('reflect')
  const [noisy, setNoisy] = useState(false)
  const [values, setValues] = useState(false)

  const clean = SAMPLE_IMAGES[imgName]
  const input = noisy ? saltPepper(clean, 0.12, 11) : clean
  const isMedian = filt.startsWith('Median')
  const spec = isMedian ? null : KERNELS[filt]

  const raw = isMedian ? medianFilter(input, 3, border) : convolve2d(input, spec.k, { border })
  const out = isMedian ? raw : (spec.signed ? signedToDisplay(raw) : clampToDisplay(raw))
  const ksum = isMedian ? null : kernelSum(spec.k)

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        <Select label="image" value={imgName} onChange={setImgName} options={Object.keys(SAMPLE_IMAGES)} />
        <Select label="filter" value={filt} onChange={setFilt} options={FILTERS} />
        <Select label="border" value={border} onChange={setBorder} options={BORDERS} />
        <Toggle label="salt & pepper noise" on={noisy} onChange={setNoisy} />
        <Toggle label="values" on={values} onChange={setValues} />
      </Row>

      <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <PixelGrid img={input} cell={values ? 22 : 18} showValues={values} title="input" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>
            {isMedian ? '3×3 window' : 'kernel'}
          </div>
          {isMedian
            ? <div style={{ width: 102, height: 102, display: 'grid', placeItems: 'center', border: `1px dashed ${TRACK}`, borderRadius: 4, fontSize: '0.72rem', textAlign: 'center', padding: 6 }}>
                sort 9 values,<br />take the 5th
              </div>
            : <KernelGrid k={spec.k} />}
        </div>
        <div style={{ fontSize: '1.4rem', opacity: 0.5 }}>→</div>
        <PixelGrid img={out} cell={values ? 22 : 18} showValues={values} title="output" />
      </div>

      <Readout items={[
        ['kernel sum', isMedian ? 'n/a (non-linear)' : ksum.toFixed(3)],
        ['effect', isMedian ? 'removes impulses, keeps edges'
          : ksum === 0 ? 'derivative — mean brightness → 0' : ksum === 1 ? 'brightness preserved' : 'brightness scaled'],
        ['linear?', isMedian ? 'no' : 'yes'],
        ['ops / pixel', isMedian ? '9 compares (sort)' : '9 mul + 8 add'],
        ...(noisy ? [['MAE vs clean', `input ${mae(input, clean).toFixed(1)} → output ${mae(out, clean).toFixed(1)}`]] : []),
      ]} />

      <Caption>
        Turn on the noise and compare <strong>Gaussian</strong> against <strong>Median 3×3</strong>. The
        Gaussian averages each impulse into its neighbours — the specks get dimmer and wider, and the
        MAE actually gets <em>worse</em> because the square's edges blur too. The median discards them
        outright: a single 0 or 255 among nine values can never be the middle one. That is the whole
        argument for rank filters over linear ones on impulse noise. Switch <strong>border</strong> to
        <code> zero</code> and watch the dark frame appear — padding choice is visible in the output.
      </Caption>
    </div>
  )
}
