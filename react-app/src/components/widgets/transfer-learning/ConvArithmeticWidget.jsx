import { useState } from 'react'
import { TRACK, convOut, convTransposeOut } from './tlUtils.js'
import { Accent, Row, Slider, Toggle, Readout, Caption } from '../shared/ui.jsx'

export default function ConvArithmeticWidget() {
  const [inSize, setInSize] = useState(32)
  const [k, setK] = useState(3)
  const [s, setS] = useState(2)
  const [p, setP] = useState(1)
  const [transposed, setTransposed] = useState(false)
  const [outPad, setOutPad] = useState(0)

  const out = transposed ? convTransposeOut(inSize, k, s, p, outPad) : convOut(inSize, k, s, p)

  // Which input sizes would a plain conv map to this same output? That
  // ambiguity is precisely what output_padding exists to break.
  const collisions = []
  for (let n = 1; n <= 512; n++) if (convOut(n, k, s, p) === (transposed ? inSize : out)) collisions.push(n)

  const formula = transposed
    ? `(${inSize} − 1)·${s} − 2·${p} + ${k} + ${outPad} = ${out}`
    : `⌊(${inSize} + 2·${p} − ${k}) / ${s}⌋ + 1 = ${out}`

  const sameSize = !transposed && out === inSize
  const doubles = transposed && out === inSize * 2

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          <Toggle label="transposed (ConvTranspose2d)" on={transposed} onChange={setTransposed} />
          <Slider label="input" value={inSize} onChange={setInSize} min={4} max={256} width={110} />
          <Slider label="kernel" value={k} onChange={setK} min={1} max={7} width={80} />
          <Slider label="stride" value={s} onChange={setS} min={1} max={4} width={70} />
          <Slider label="padding" value={p} onChange={setP} min={0} max={3} width={70} />
          {transposed && <Slider label="output_padding" value={outPad} onChange={setOutPad} min={0} max={Math.max(0, s - 1)} width={70} />}
        </Row>

        <div style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', padding: '0.7rem 0.9rem',
                          background: 'var(--bg-hover, rgba(128,128,128,0.09))', borderRadius: 5 }}>
              <div style={{ opacity: 0.65, fontSize: '0.78rem', marginBottom: 4 }}>
                {transposed ? 'ConvTranspose2d' : 'Conv2d'} output size
              </div>
              {formula}
            </div>
            <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width={Math.min(150, inSize) + 4} height={Math.min(150, inSize) + 4}>
                <rect x={2} y={2} width={Math.min(150, inSize)} height={Math.min(150, inSize)}
                  fill="rgba(128,128,128,0.2)" stroke="var(--border,#ccc)" />
              </svg>
              <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>→</span>
              <svg width={Math.min(150, out) + 4} height={Math.min(150, out) + 4}>
                <rect x={2} y={2} width={Math.min(150, out)} height={Math.min(150, out)}
                  fill={`${TRACK}44`} stroke={TRACK} />
              </svg>
              <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                {inSize}² → {out}²
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.79rem', minWidth: 260 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Common recipes</div>
            <table style={{ borderCollapse: 'collapse', fontSize: '0.76rem', fontFamily: 'monospace' }}>
              <tbody>
                {[
                  ['k3 s1 p1', 'size preserved', 3, 1, 1, false],
                  ['k3 s2 p1', 'halves (÷2)', 3, 2, 1, false],
                  ['k2 s2 p0', 'halves, no overlap', 2, 2, 0, false],
                  ['k2 s2 p0 ᵀ', 'doubles (×2), clean', 2, 2, 0, true],
                  ['k4 s2 p1 ᵀ', 'doubles (×2), clean', 4, 2, 1, true],
                  ['k3 s2 p1 ᵀ', 'doubles — checkerboards', 3, 2, 1, true],
                ].map(([label, why, kk, ss, pp, tt]) => (
                  <tr key={label} onClick={() => { setK(kk); setS(ss); setP(pp); setTransposed(tt); setOutPad(tt && kk === 3 ? 1 : 0) }}
                    style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '2px 10px 2px 0', color: TRACK }}>{label}</td>
                    <td style={{ padding: '2px 0', fontFamily: 'inherit', opacity: 0.8 }}>{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.55rem', lineHeight: 1.6 }}>
              {transposed
                ? <>A plain conv with these settings maps <strong>{collisions.length}</strong> different input
                    sizes {collisions.length ? `(${collisions.slice(0, 4).join(', ')}${collisions.length > 4 ? '…' : ''})` : ''} onto
                    {' '}{inSize}. The transposed op has to pick one, and <code>output_padding</code> is how you say which.</>
                : <>Click a recipe to load it. <code>k3 s1 p1</code> is the workhorse: it is the only common
                    setting that leaves the spatial size untouched, which is why every U-Net block uses it.</>}
            </p>
          </div>
        </div>

        <Readout items={[
          ['op', transposed ? 'ConvTranspose2d' : 'Conv2d'],
          ['in → out', `${inSize} → ${out}`],
          ['ratio', `${(out / inSize).toFixed(3)}×`],
          ['note', sameSize ? 'size preserved' : doubles ? 'exactly doubled' : out < inSize ? 'downsampling' : 'upsampling'],
        ]} />

        <Caption>
          The two formulas are the same relation read in opposite directions — the transposed one is the conv
          formula solved for its input. That is why a transposed conv can always undo a conv's <em>shape</em>
          (never its values), and why the pairing <code>k3 s1 p1</code> down / <code>k2 s2</code> up shows up in
          every encoder-decoder: one keeps size, the other doubles it, and neither leaves a remainder to
          reconcile.
        </Caption>
      </div>
    </Accent>
  )
}
