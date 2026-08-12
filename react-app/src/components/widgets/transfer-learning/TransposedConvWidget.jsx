import { useState } from 'react'
import { TRACK, convTranspose2d, convTransposeOut } from './tlUtils.js'
import { Accent, PixelGrid, KernelGrid, Row, Slider, Select, Btn, Readout, Caption } from '../shared/ui.jsx'

// 3×3 rather than 2×2 so the output has a real interior: with a tiny input the
// ramp-up at the border swamps the pattern we are actually trying to show.
const INPUT = [[2, 1, 2], [1, 3, 1], [2, 1, 2]]
const KERNELS = {
  'ones 3×3':    [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  'ones 2×2':    [[1, 1], [1, 1]],
  'ones 4×4':    [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
  'edge 3×3':    [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
}

/* Transposed convolution is scatter-add: each input cell stamps a scaled copy
 * of the kernel into the output, and overlaps sum. Where the number of
 * overlapping stamps varies across the output you get checkerboarding. */
export default function TransposedConvWidget() {
  const [kName, setKName] = useState('ones 3×3')
  const [stride, setStride] = useState(2)
  const [step, setStep] = useState(-1)

  const kernel = KERNELS[kName]
  const k = kernel.length
  const { out, hits } = convTranspose2d(INPUT, kernel, { stride })
  const total = INPUT.length * INPUT[0].length

  // partial result after `step` input cells have been stamped
  const partial = (() => {
    const o = out.map(r => r.map(() => 0))
    for (let i = 0; i <= step; i++) {
      const r = Math.floor(i / INPUT[0].length), c = i % INPUT[0].length
      for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) {
        o[r * stride + a][c * stride + b] += INPUT[r][c] * kernel[a][b]
      }
    }
    return o
  })()

  const shown = step < 0 ? out : partial
  const curR = step >= 0 ? Math.floor(step / INPUT[0].length) : -1
  const curC = step >= 0 ? step % INPUT[0].length : -1
  const outSize = convTransposeOut(INPUT.length, k, stride, 0)

  /* Judge checkerboarding on the INTERIOR only. Every configuration ramps up
   * over a (k−s)-wide border, so counting the whole map would flag k=4,s=2 —
   * which actually tiles perfectly — as uneven. */
  const b = Math.max(0, k - stride)
  const interior = hits.slice(b, hits.length - b).map(r => r.slice(b, r.length - b)).flat()
  const uneven = new Set(interior).size > 1
  const interiorCounts = [...new Set(interior)].sort((x, y) => x - y)

  return (
    <Accent value={TRACK}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          <Select label="kernel" value={kName} onChange={v => { setKName(v); setStep(-1) }} options={Object.keys(KERNELS)} />
          <Slider label="stride" value={stride} onChange={v => { setStride(v); setStep(-1) }} min={1} max={3} width={80} />
          <Btn onClick={() => setStep(-1)}>↺ show result</Btn>
          <Btn primary onClick={() => setStep(s => (s + 1) % (total + 1))}>stamp next →</Btn>
          {step >= 0 && <span style={{ fontSize: '0.8rem', color: TRACK, fontWeight: 700 }}>
            input[{curR}][{curC}] = {INPUT[curR][curC]}
          </span>}
        </Row>

        <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <PixelGrid img={INPUT.map(r => r.map(v => v * 60))} cell={34} showValues
            title="input 2×2" marked={step >= 0 ? [curR, curC] : null}
            fmt={v => Math.round(v / 60)} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>kernel {k}×{k}</div>
            <KernelGrid k={kernel} cell={30} />
          </div>
          <div style={{ fontSize: '1.2rem', opacity: 0.5 }}>→</div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>
              output {outSize}×{outSize}{step >= 0 ? ` — after ${step + 1} of ${total} stamps` : ''}
            </div>
            <svg width={shown[0].length * 34} height={shown.length * 34} style={{ display: 'block' }}>
              {shown.map((row, r) => row.map((v, c) => {
                const peak = Math.max(1, ...out.flat())
                const inStamp = step >= 0 && r >= curR * stride && r < curR * stride + k
                                          && c >= curC * stride && c < curC * stride + k
                return (
                  <g key={`${r}-${c}`}>
                    <rect x={c * 34} y={r * 34} width={34} height={34}
                      fill={`rgba(159,18,57,${0.08 + 0.75 * Math.abs(v) / peak})`} />
                    {inStamp && <rect x={c * 34} y={r * 34} width={34} height={34} fill="rgba(37,99,235,0.22)" />}
                    <rect x={c * 34} y={r * 34} width={34} height={34} fill="none"
                      stroke={inStamp ? '#2563eb' : 'var(--border,#d4d4d8)'} strokeWidth={inStamp ? 2 : 0.6} />
                    <text x={c * 34 + 17} y={r * 34 + 21} textAnchor="middle" fontSize="11"
                      fontFamily="monospace" fill="var(--text,#222)">{v}</text>
                  </g>
                )
              }))}
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>
              stamps per cell
            </div>
            <svg width={hits[0].length * 26} height={hits.length * 26} style={{ display: 'block' }}>
              {hits.map((row, r) => row.map((v, c) => (
                <g key={`h${r}-${c}`}>
                  <rect x={c * 26} y={r * 26} width={26} height={26}
                    fill={v > 1 ? `rgba(220,38,38,${0.12 * v})` : 'rgba(128,128,128,0.08)'}
                    stroke="var(--border,#d4d4d8)" strokeWidth={0.6} />
                  <text x={c * 26 + 13} y={r * 26 + 17} textAnchor="middle" fontSize="10"
                    fontFamily="monospace" fill="var(--text,#222)">{v}</text>
                </g>
              )))}
            </svg>
          </div>
        </div>

        <Readout items={[
          ['output size', `(${INPUT.length}−1)·${stride} + ${k} = ${outSize}`],
          ['params', `${k * k} + 1 bias`],
          ['interior stamp counts', interiorCounts.join(', ') || '—'],
          ['checkerboard risk', uneven ? `yes — k=${k} not divisible by s=${stride}` : `no — k=${k} divides by s=${stride}`],
        ]} />

        <Caption>
          Press <strong>stamp next</strong> a few times. Each input cell multiplies the <em>whole</em> kernel and
          adds it into the output at a stride-spaced offset — the opposite of convolution's gather, and the reason
          the operation is called "transposed" rather than "deconvolution" (it does not invert anything).
          <br /><br />
          The right-hand grid counts how many stamps landed on each output cell. With <strong>k=3, s=2</strong> the
          interior counts are uneven (1, 2 and 4), so some outputs are systematically larger — that is
          <strong> checkerboard artefacting</strong>, baked into the geometry rather than into the weights. Set
          <strong> k=2, s=2</strong> or <strong>k=4, s=2</strong> and the interior counts collapse to a single
          value. This is why the practical advice is "make kernel size divisible by stride", or skip the problem
          entirely by upsampling then applying a normal 3×3 conv.
          <br /><br />
          Read the <em>interior</em>, not the border: every setting ramps up over a (k−s)-wide frame simply
          because fewer stamps reach the edge, and that boundary effect is not checkerboarding.
        </Caption>
      </div>
    </Accent>
  )
}
