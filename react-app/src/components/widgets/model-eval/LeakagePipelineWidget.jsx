import { useState } from 'react'

const ACCENT = '#c026d3'
const ACCENT_LIGHT = '#f5d0fe'
const WARN = '#ef4444'
const WARN_LIGHT = '#fee2e2'
const GOOD = '#16a34a'
const GOOD_LIGHT = '#dcfce7'
const VAL_FILL = '#fde68a'
const VAL_BORDER = '#d97706'

const LEAKY_ACC = 0.94
const CORRECT_ACC = 0.81

export default function LeakagePipelineWidget() {
  const [mode, setMode] = useState('leaky')
  const leaky = mode === 'leaky'

  const totalW = 700
  const totalH = 480
  const cx = totalW / 2

  const datasetY = 10
  const datasetH = 40
  const cvY = 190
  const cvH = 200
  const cvX = 30
  const cvW = 640
  const scoreY = 410
  const scoreH = 50

  const nFolds = 5
  const foldW = 110
  const foldH = 150
  const foldGap = 12
  const foldsRowW = nFolds * foldW + (nFolds - 1) * foldGap
  const foldsStartX = cvX + (cvW - foldsRowW) / 2
  const foldY = cvY + 34
  const foldX = (i) => foldsStartX + i * (foldW + foldGap)

  const arrowColor = leaky ? WARN : ACCENT

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.8rem', alignItems: 'center', fontSize: '0.83rem' }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Pipeline:</span>
        <button onClick={() => setMode('leaky')}
          style={{ padding: '0.25rem 0.7rem', borderRadius: 4, border: `1px solid ${leaky ? WARN : 'var(--border)'}`, background: leaky ? WARN : 'var(--bg)', color: leaky ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: leaky ? 700 : 400 }}>
          ⚠ Leaky Pipeline
        </button>
        <button onClick={() => setMode('correct')}
          style={{ padding: '0.25rem 0.7rem', borderRadius: 4, border: `1px solid ${!leaky ? GOOD : 'var(--border)'}`, background: !leaky ? GOOD : 'var(--bg)', color: !leaky ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: !leaky ? 700 : 400 }}>
          ✓ Correct Pipeline
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg width={totalW} height={totalH} style={{ display: 'block', minWidth: 560 }}>
          <defs>
            <marker id="leak-arrow-accent" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 z" fill={ACCENT} />
            </marker>
            <marker id="leak-arrow-warn" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 z" fill={WARN} />
            </marker>
            <marker id="leak-arrow-good" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 z" fill={GOOD} />
            </marker>
          </defs>

          {/* Full Dataset box */}
          <rect x={cx - 90} y={datasetY} width={180} height={datasetH} rx={6}
            fill={ACCENT_LIGHT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={cx} y={datasetY + datasetH / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill={ACCENT}>
            Full Dataset
          </text>

          {leaky ? (
            <g>
              <line x1={cx} y1={datasetY + datasetH} x2={cx} y2={82}
                stroke={WARN} strokeWidth={2.2} strokeDasharray="6,4" markerEnd="url(#leak-arrow-warn)" />
              <text x={cx + 14} y={68} fontSize="9.5" fill={WARN} fontWeight="bold">⚠ fit on ALL data (train + val)</text>

              <rect x={cx - 125} y={82} width={250} height={50} rx={6}
                fill={WARN_LIGHT} stroke={WARN} strokeWidth={2} />
              <text x={cx} y={100} textAnchor="middle" fontSize="11" fontWeight="bold" fill={WARN}>
                Feature Selection / Scaling
              </text>
              <text x={cx} y={114} textAnchor="middle" fontSize="9.5" fill={WARN}>
                (fit on ALL data)
              </text>

              <line x1={cx} y1={132} x2={cx} y2={cvY - 2}
                stroke={WARN} strokeWidth={2.2} strokeDasharray="6,4" markerEnd="url(#leak-arrow-warn)" />
              <text x={cx + 14} y={162} fontSize="9.5" fill={WARN} fontWeight="bold">same fixed features reused every fold</text>
              <text x={cx + 14} y={173} fontSize="9" fill={WARN}>→ validation folds influenced training</text>
            </g>
          ) : (
            <g>
              <line x1={cx} y1={datasetY + datasetH} x2={cx} y2={cvY - 2}
                stroke={ACCENT} strokeWidth={2.2} markerEnd="url(#leak-arrow-accent)" />
              <text x={cx + 14} y={100} fontSize="9.5" fill="var(--text-muted)">raw data enters the CV loop</text>
              <text x={cx + 14} y={112} fontSize="9.5" fill="var(--text-muted)">untouched — nothing fit yet</text>
            </g>
          )}

          {/* CV outer box */}
          <rect x={cvX} y={cvY} width={cvW} height={cvH} rx={8}
            fill="var(--bg)" stroke={ACCENT} strokeWidth={2} />
          <text x={cvX + 14} y={cvY + 20} fontSize="12" fontWeight="bold" fill={ACCENT}>
            5-Fold Cross-Validation
          </text>

          {/* legend */}
          <rect x={cvX + cvW - 150} y={cvY + 9} width={11} height={11} fill={ACCENT_LIGHT} stroke={ACCENT} strokeWidth={1} />
          <text x={cvX + cvW - 135} y={cvY + 18} fontSize="9" fill="var(--text-muted)">train</text>
          <rect x={cvX + cvW - 90} y={cvY + 9} width={11} height={11} fill={VAL_FILL} stroke={VAL_BORDER} strokeWidth={1} />
          <text x={cvX + cvW - 75} y={cvY + 18} fontSize="9" fill="var(--text-muted)">val</text>

          {Array.from({ length: nFolds }).map((_, i) => {
            const fx = foldX(i)
            const segW = 16, segGap = 2
            const segTotal = nFolds * segW + (nFolds - 1) * segGap
            const segStartX = fx + foldW / 2 - segTotal / 2
            const segY = foldY + 24

            return (
              <g key={i}>
                <rect x={fx} y={foldY} width={foldW} height={foldH} rx={6}
                  fill="var(--bg-hover)" stroke={ACCENT} strokeWidth={1.4} />
                <text x={fx + foldW / 2} y={foldY + 14} textAnchor="middle" fontSize="10" fontWeight="bold" fill={ACCENT}>
                  Fold {i + 1}
                </text>

                {Array.from({ length: nFolds }).map((__, j) => (
                  <rect key={j}
                    x={segStartX + j * (segW + segGap)} y={segY} width={segW} height={16} rx={2}
                    fill={j === i ? VAL_FILL : ACCENT_LIGHT}
                    stroke={j === i ? VAL_BORDER : ACCENT}
                    strokeWidth={1} />
                ))}

                {leaky ? (
                  <g>
                    <text x={fx + foldW / 2} y={segY + 40} textAnchor="middle" fontSize="8" fill={WARN} fontStyle="italic">
                      uses features
                    </text>
                    <text x={fx + foldW / 2} y={segY + 51} textAnchor="middle" fontSize="8" fill={WARN} fontStyle="italic">
                      chosen with full data
                    </text>
                    <text x={fx + foldW / 2} y={segY + 68} textAnchor="middle" fontSize="15" fill={WARN}>⚠</text>
                    <text x={fx + foldW / 2} y={segY + 88} textAnchor="middle" fontSize="8" fill="var(--text-muted)">
                      (no per-fold fit —
                    </text>
                    <text x={fx + foldW / 2} y={segY + 98} textAnchor="middle" fontSize="8" fill="var(--text-muted)">
                      already leaked)
                    </text>
                  </g>
                ) : (
                  <g>
                    <line x1={fx + foldW / 2} y1={segY + 18} x2={fx + foldW / 2} y2={segY + 30}
                      stroke={GOOD} strokeWidth={1.4} markerEnd="url(#leak-arrow-good)" />
                    <rect x={fx + 8} y={segY + 32} width={foldW - 16} height={30} rx={4}
                      fill={GOOD_LIGHT} stroke={GOOD} strokeWidth={1.3} />
                    <text x={fx + foldW / 2} y={segY + 44} textAnchor="middle" fontSize="7.8" fontWeight="bold" fill={GOOD}>
                      Fit FS / Scale
                    </text>
                    <text x={fx + foldW / 2} y={segY + 55} textAnchor="middle" fontSize="7.5" fill={GOOD}>
                      (train fold only)
                    </text>
                    <line x1={fx + foldW / 2} y1={segY + 62} x2={fx + foldW / 2} y2={segY + 74}
                      stroke={GOOD} strokeWidth={1.4} markerEnd="url(#leak-arrow-good)" />
                    <rect x={fx + 8} y={segY + 76} width={foldW - 16} height={26} rx={4}
                      fill="var(--bg)" stroke={GOOD} strokeWidth={1.1} strokeDasharray="3,2" />
                    <text x={fx + foldW / 2} y={segY + 90} textAnchor="middle" fontSize="7.8" fontWeight="bold" fill={GOOD}>
                      Apply → val fold
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* CV -> score arrow */}
          <line x1={cx} y1={cvY + cvH} x2={cx} y2={scoreY - 2}
            stroke={arrowColor} strokeWidth={2.2}
            strokeDasharray={leaky ? '6,4' : undefined}
            markerEnd={leaky ? 'url(#leak-arrow-warn)' : 'url(#leak-arrow-good)'} />

          {/* Reported score box */}
          <rect x={cx - 100} y={scoreY} width={200} height={scoreH} rx={6}
            fill={leaky ? WARN_LIGHT : GOOD_LIGHT} stroke={leaky ? WARN : GOOD} strokeWidth={2} />
          <text x={cx} y={scoreY + 20} textAnchor="middle" fontSize="11" fontWeight="bold" fill={leaky ? WARN : GOOD}>
            Reported CV Score
          </text>
          <text x={cx} y={scoreY + 39} textAnchor="middle" fontSize="16" fontWeight="bold" fill={leaky ? WARN : GOOD}>
            {((leaky ? LEAKY_ACC : CORRECT_ACC) * 100).toFixed(1)}% accuracy
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
        <div style={{
          flex: '1 1 200px', padding: '0.7rem 0.9rem', borderRadius: 6,
          border: `2px solid ${WARN}`, background: 'var(--bg-hover)',
          opacity: leaky ? 1 : 0.5, transition: 'opacity 0.2s'
        }}>
          <div style={{ fontSize: '0.78rem', color: WARN, fontWeight: 700 }}>Leaky pipeline</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: WARN }}>{(LEAKY_ACC * 100).toFixed(1)}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>artificially inflated / optimistic</div>
        </div>
        <div style={{
          flex: '1 1 200px', padding: '0.7rem 0.9rem', borderRadius: 6,
          border: `2px solid ${GOOD}`, background: 'var(--bg-hover)',
          opacity: leaky ? 0.5 : 1, transition: 'opacity 0.2s'
        }}>
          <div style={{ fontSize: '0.78rem', color: GOOD, fontWeight: 700 }}>Correct pipeline</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: GOOD }}>{(CORRECT_ACC * 100).toFixed(1)}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>honest estimate on truly unseen data</div>
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
        {leaky
          ? <>The <strong style={{ color: WARN }}>{(LEAKY_ACC * 100).toFixed(0)}%</strong> is misleading: features were selected (and any scaler fit) using the full dataset — including rows that later played the role of "unseen" validation data in every fold — so the model was effectively tuned on data it was supposed to be tested against.</>
          : <>The <strong style={{ color: GOOD }}>{(CORRECT_ACC * 100).toFixed(0)}%</strong> is lower but trustworthy: feature selection and scaling are re-fit from scratch on each fold's training split only, then applied to that fold's held-out validation split — nothing from the validation data ever touches the fitting step.</>}
      </p>
    </div>
  )
}
