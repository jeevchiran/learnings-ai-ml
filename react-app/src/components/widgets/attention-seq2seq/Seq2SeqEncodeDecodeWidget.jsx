import { useState, useEffect, useRef } from 'react'
import { Row, Btn } from '../shared/ui.jsx'

const COLOR = '#b45309'
const COLOR_LIGHT = '#fef3c7'
const DECODE_COLOR = '#0369a1'
const DECODE_LIGHT = '#e0f2fe'

const SRC = ['I', 'love', 'coffee']
const TGT = ["J'aime", 'le', 'café']

// stage 0,1,2 = encode tokens; 3 = compress to context vector; 4,5,6 = decode tokens
const N_STAGES = SRC.length + 1 + TGT.length

export default function Seq2SeqEncodeDecodeWidget() {
  const [stage, setStage] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStage(s => {
          if (s >= N_STAGES - 1) { setPlaying(false); return N_STAGES - 1 }
          return s + 1
        })
      }, 900)
    }
    return () => clearInterval(timerRef.current)
  }, [playing])

  const play = () => { setStage(-1); setTimeout(() => { setStage(0); setPlaying(true) }, 50) }
  const reset = () => { setPlaying(false); setStage(-1) }
  const step = () => setStage(s => Math.min(s + 1, N_STAGES - 1))

  const encoding = stage >= 0 && stage <= SRC.length - 1
  const compressed = stage >= SRC.length
  const decoding = stage >= SRC.length + 1

  const cellW = 64, cellH = 44, gapX = 26
  const encStartX = 40, decStartX = 330
  const cy = 90
  const cVecX = (encStartX + SRC.length * (cellW + gapX) + decStartX) / 2 - 10

  return (
    <div>
      <Row style={{ marginBottom: '0.7rem' }}>
        <Btn onClick={play} disabled={playing} primary>▶ Animate</Btn>
        <Btn onClick={step} disabled={playing || stage >= N_STAGES - 1}>Step →</Btn>
        <Btn onClick={reset}>Reset</Btn>
      </Row>

      <div style={{ overflowX: 'auto' }}>
        <svg width={560} height={200} style={{ display: 'block', minWidth: 480 }}>
          <defs>
            <marker id="s2s-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 z" fill={COLOR} />
            </marker>
            <marker id="s2s-arrow-dec" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 z" fill={DECODE_COLOR} />
            </marker>
          </defs>

          {/* Encoder cells */}
          {SRC.map((tok, i) => {
            const cx = encStartX + i * (cellW + gapX) + cellW / 2
            const active = stage === i
            const seen = stage >= i
            return (
              <g key={`enc-${i}`} opacity={seen ? 1 : 0.25} style={{ transition: 'opacity .3s' }}>
                {i > 0 && (
                  <line x1={cx - cellW / 2 - gapX + 6} y1={cy} x2={cx - cellW / 2 - 5} y2={cy}
                    stroke={COLOR} strokeWidth={1.5} markerEnd="url(#s2s-arrow)" />
                )}
                <rect x={cx - cellW / 2} y={cy - cellH / 2} width={cellW} height={cellH} rx={6}
                  fill={active ? COLOR : COLOR_LIGHT} stroke={COLOR} strokeWidth={active ? 2.5 : 1.5} />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill={active ? '#fff' : COLOR}>
                  {tok}
                </text>
                <text x={cx} y={cy - cellH / 2 - 8} textAnchor="middle" fontSize="9" fill="var(--text-muted)">h{i + 1}</text>
              </g>
            )
          })}

          {/* Context vector */}
          <g opacity={compressed ? 1 : 0.15} style={{ transition: 'opacity .3s' }}>
            <line x1={encStartX + SRC.length * (cellW + gapX) - gapX + 6} y1={cy} x2={cVecX - 26} y2={cy}
              stroke={COLOR} strokeWidth={1.5} markerEnd="url(#s2s-arrow)" />
            <circle cx={cVecX} cy={cy} r={24} fill={stage === SRC.length ? COLOR : '#fff7ed'} stroke={COLOR} strokeWidth={2.5} />
            <text x={cVecX} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill={stage === SRC.length ? '#fff' : COLOR}>c</text>
            <text x={cVecX} y={cy - 34} textAnchor="middle" fontSize="9" fill="var(--text-muted)">context vector</text>
          </g>

          {/* Decoder cells */}
          {TGT.map((tok, i) => {
            const cx = decStartX + i * (cellW + gapX) + cellW / 2
            const active = stage === SRC.length + 1 + i
            const seen = stage >= SRC.length + 1 + i
            return (
              <g key={`dec-${i}`} opacity={seen ? 1 : 0.15} style={{ transition: 'opacity .3s' }}>
                <line x1={cVecX + 26} y1={cy} x2={cx - cellW / 2 - 5} y2={i === 0 ? cy : cy}
                  stroke={DECODE_COLOR} strokeWidth={1} strokeDasharray="4,3" opacity={0.6}
                  markerEnd={i === 0 ? 'url(#s2s-arrow-dec)' : undefined} />
                {i > 0 && (
                  <line x1={cx - cellW / 2 - gapX + 6} y1={cy} x2={cx - cellW / 2 - 5} y2={cy}
                    stroke={DECODE_COLOR} strokeWidth={1.5} markerEnd="url(#s2s-arrow-dec)" />
                )}
                <rect x={cx - cellW / 2} y={cy - cellH / 2} width={cellW} height={cellH} rx={6}
                  fill={active ? DECODE_COLOR : DECODE_LIGHT} stroke={DECODE_COLOR} strokeWidth={active ? 2.5 : 1.5} />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill={active ? '#fff' : DECODE_COLOR}>
                  {tok}
                </text>
                <text x={cx} y={cy - cellH / 2 - 8} textAnchor="middle" fontSize="9" fill="var(--text-muted)">s{i + 1}</text>
              </g>
            )
          })}

          <text x={encStartX + (SRC.length * (cellW + gapX)) / 2 - gapX / 2} y={cy + 46} textAnchor="middle" fontSize="10" fill={COLOR} fontWeight="600">encoder</text>
          <text x={decStartX + (TGT.length * (cellW + gapX)) / 2 - gapX / 2} y={cy + 46} textAnchor="middle" fontSize="10" fill={DECODE_COLOR} fontWeight="600">decoder</text>
        </svg>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        {stage < 0 && 'Press Animate or Step to watch the sentence get compressed into one vector, then unpacked.'}
        {encoding && `Encoder reads "${SRC[stage]}" and folds it into the running hidden state.`}
        {stage === SRC.length && 'The encoder’s final hidden state becomes c — the only thing the decoder will ever see of the source sentence.'}
        {decoding && `Decoder step s${stage - SRC.length}: produces "${TGT[stage - SRC.length - 1]}", conditioned on c and its own previous output — every dashed line from c is identical.`}
      </p>
    </div>
  )
}
