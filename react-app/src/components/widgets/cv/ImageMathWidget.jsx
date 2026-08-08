import { useState } from 'react'
import {
  SAMPLE_IMAGES, TRACK, clamp8, addImages, subtractImages, absDiff,
  bitwiseAnd, threshold, gammaCorrect, brightnessContrast,
} from './cvUtils.js'
import { PixelGrid, Row, Select, Slider, Readout, Caption } from './cvUi.jsx'

const A = SAMPLE_IMAGES['Bright square']
const B = SAMPLE_IMAGES['Ramp']
const MASK = threshold(SAMPLE_IMAGES['Checker'], 127)

/* Each op returns [result, formula(a, b) → string] so the arithmetic readout
 * always matches the operation actually applied. */
const OPS = {
  'blend  αA + (1−α)B': (p) => [addImages(A, B, p.alpha), (a, b) => `${p.alpha.toFixed(2)}·${a} + ${(1 - p.alpha).toFixed(2)}·${b} = ${clamp8(p.alpha * a + (1 - p.alpha) * b)}`],
  'add  A + B (saturating)': () => [A.map((r, i) => r.map((v, j) => clamp8(v + B[i][j]))), (a, b) => `${a} + ${b} = ${a + b} → clip → ${clamp8(a + b)}`],
  'subtract  A − B': () => [subtractImages(A, B), (a, b) => `${a} − ${b} = ${a - b} → clip → ${clamp8(a - b)}`],
  'absdiff  |A − B|': () => [absDiff(A, B), (a, b) => `|${a} − ${b}| = ${Math.abs(a - b)}`],
  'bitwise_and(A, mask)': () => [bitwiseAnd(A, MASK), (a, _b, m) => `mask=${m > 127 ? 255 : 0} → ${m > 127 ? a : 0}`],
  'threshold(A, t)': (p) => [threshold(A, p.t), (a) => `${a} > ${p.t} ? 255 : 0 = ${a > p.t ? 255 : 0}`],
  'brightness/contrast': (p) => [brightnessContrast(A, p.alpha * 2, p.beta), (a) => `${(p.alpha * 2).toFixed(2)}·${a} + ${p.beta} = ${clamp8(p.alpha * 2 * a + p.beta)}`],
  'gamma  (A/255)^γ': (p) => [gammaCorrect(A, p.gamma), (a) => `255·(${a}/255)^${p.gamma.toFixed(2)} = ${clamp8(255 * Math.pow(a / 255, p.gamma))}`],
}

export default function ImageMathWidget() {
  const [op, setOp] = useState('blend  αA + (1−α)B')
  const [alpha, setAlpha] = useState(0.5)
  const [t, setT] = useState(120)
  const [beta, setBeta] = useState(0)
  const [gamma, setGamma] = useState(0.5)
  const [hover, setHover] = useState([5, 5])

  const [out, formula] = OPS[op]({ alpha, t, beta, gamma })
  const [r, c] = hover
  const usesB = op.includes('A + B') || op.includes('A − B') || op.startsWith('blend')
  const usesMask = op.startsWith('bitwise')

  return (
    <div>
      <Row style={{ marginBottom: '0.6rem' }}>
        <Select label="operation" value={op} onChange={setOp} options={Object.keys(OPS)} />
        {(op.startsWith('blend') || op.startsWith('brightness')) &&
          <Slider label={op.startsWith('blend') ? 'α' : 'contrast'} value={alpha} onChange={setAlpha} min={0} max={1} step={0.05} fmt={v => v.toFixed(2)} />}
        {op.startsWith('brightness') && <Slider label="β" value={beta} onChange={setBeta} min={-100} max={100} step={5} />}
        {op.startsWith('threshold') && <Slider label="t" value={t} onChange={setT} min={0} max={255} step={5} />}
        {op.startsWith('gamma') && <Slider label="γ" value={gamma} onChange={setGamma} min={0.2} max={3} step={0.1} fmt={v => v.toFixed(1)} />}
      </Row>

      <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <PixelGrid img={A} cell={17} title="A — bright square" onHover={p => p && setHover(p)} marked={hover} />
        {usesB && <PixelGrid img={B} cell={17} title="B — ramp" onHover={p => p && setHover(p)} marked={hover} />}
        {usesMask && <PixelGrid img={MASK} cell={17} title="mask (binary)" onHover={p => p && setHover(p)} marked={hover} />}
        <div style={{ fontSize: '1.4rem', alignSelf: 'center', opacity: 0.5 }}>=</div>
        <PixelGrid img={out} cell={17} title="result" onHover={p => p && setHover(p)} marked={hover} />
      </div>

      <Readout items={[
        ['pixel', `[${r}, ${c}]`],
        ['A', A[r][c]],
        ...(usesB ? [['B', B[r][c]]] : []),
        ...(usesMask ? [['mask', MASK[r][c]]] : []),
        ['arithmetic', formula(A[r][c], B[r][c], MASK[r][c])],
      ]} />

      <Caption>
        Hover any cell to see the arithmetic for that one pixel — every operation here is
        <em> element-wise</em>, applied independently 144 times. Try <strong>add</strong> and watch
        values pile up at 255: uint8 arithmetic <span style={{ color: TRACK }}>saturates</span> in
        OpenCV but <em>wraps around</em> in raw NumPy (<code>250 + 10 = 4</code>), which is the classic
        source of "why is my bright sky black".
      </Caption>
    </div>
  )
}
