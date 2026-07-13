import { useState, useEffect, useRef } from 'react'

const N = 20
const ACCENT = '#c026d3'
const HIGHLIGHT = '#f59e0b'
const CLASS_A = '#6366f1'
const CLASS_B = '#14b8a6'

// 14 class-A / 6 class-B, scattered (not a clean block) so K-Fold's failure mode is visible
const CLASS_LABELS = ['A', 'A', 'A', 'B', 'A', 'A', 'A', 'A', 'B', 'A', 'A', 'A', 'A', 'B', 'A', 'A', 'B', 'A', 'B', 'B']

const MODES = [
  { id: 'kfold', label: 'K-Fold' },
  { id: 'stratified', label: 'Stratified K-Fold' },
  { id: 'loo', label: 'Leave-One-Out' },
  { id: 'timeseries', label: 'Time Series / Group CV' },
]

// Plain K-Fold: contiguous blocks (mirrors sklearn's default, unshuffled KFold) —
// this is what lets a fold end up starving of the minority class.
function buildKFoldFolds(k) {
  const base = Math.floor(N / k)
  const rem = N % k
  const folds = []
  let offset = 0
  for (let i = 0; i < k; i++) {
    const size = base + (i < rem ? 1 : 0)
    const val = []
    for (let j = offset; j < offset + size; j++) val.push(j)
    offset += size
    const valSet = new Set(val)
    const train = []
    for (let j = 0; j < N; j++) if (!valSet.has(j)) train.push(j)
    folds.push({ val, train })
  }
  return folds
}

// Stratified: round-robin each class's own index list across the k folds independently,
// so every fold gets a proportional slice of A and of B.
function buildStratifiedFolds(k) {
  const byClass = { A: [], B: [] }
  CLASS_LABELS.forEach((c, i) => byClass[c].push(i))
  const assign = Array(N).fill(-1)
  Object.values(byClass).forEach(list => {
    list.forEach((idx, j) => { assign[idx] = j % k })
  })
  const folds = []
  for (let i = 0; i < k; i++) {
    const val = []
    const train = []
    for (let j = 0; j < N; j++) (assign[j] === i ? val : train).push(j)
    folds.push({ val, train })
  }
  return folds
}

function buildLOOFolds() {
  const folds = []
  for (let i = 0; i < N; i++) {
    const train = []
    for (let j = 0; j < N; j++) if (j !== i) train.push(j)
    folds.push({ val: [i], train })
  }
  return folds
}

// Expanding window: fold i trains on [0, boundary_i) and validates on the next chunk only.
// Samples after that chunk are simply not part of this fold yet — never used as "future" training data.
function buildTimeSeriesFolds(k) {
  const bounds = []
  for (let i = 0; i <= k + 1; i++) bounds.push(Math.round((i * N) / (k + 1)))
  const folds = []
  for (let i = 0; i < k; i++) {
    const trainEnd = bounds[i + 1]
    const valStart = bounds[i + 1]
    const valEnd = bounds[i + 2]
    const train = []
    for (let j = 0; j < trainEnd; j++) train.push(j)
    const val = []
    for (let j = valStart; j < valEnd; j++) val.push(j)
    folds.push({ train, val })
  }
  return folds
}

function buildFolds(mode, k) {
  if (mode === 'kfold') return buildKFoldFolds(k)
  if (mode === 'stratified') return buildStratifiedFolds(k)
  if (mode === 'loo') return buildLOOFolds()
  if (mode === 'timeseries') return buildTimeSeriesFolds(k)
  return []
}

function classCounts(indices) {
  let a = 0, b = 0
  indices.forEach(i => { if (CLASS_LABELS[i] === 'A') a++; else b++ })
  return { a, b }
}

export default function CVSplitWidget() {
  const [mode, setMode] = useState('kfold')
  const [k, setK] = useState(5)
  const [foldIndex, setFoldIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)

  const showClassStripe = mode === 'kfold' || mode === 'stratified'
  const showKSlider = mode !== 'loo'
  const effectiveK = mode === 'loo' ? N : k

  const folds = buildFolds(mode, effectiveK)
  const numFolds = folds.length
  const fold = folds[Math.min(foldIndex, numFolds - 1)]

  useEffect(() => {
    setFoldIndex(0)
    setPlaying(false)
  }, [mode, k])

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setFoldIndex(f => {
          if (f >= numFolds - 1) { setPlaying(false); return 0 }
          return f + 1
        })
      }, 800)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, numFolds])

  const valSet = new Set(fold.val)
  const trainSet = new Set(fold.train)
  const cellStatus = (i) => (valSet.has(i) ? 'val' : trainSet.has(i) ? 'train' : 'future')

  const cellSize = 26
  const gap = 4
  const startX = 4
  const classStripeH = 14
  const classStripeGap = 6
  const stripY = showClassStripe ? classStripeH + classStripeGap : 0
  const totalW = startX * 2 + N * (cellSize + gap) - gap
  const totalH = stripY + cellSize + 4
  const cellX = (i) => startX + i * (cellSize + gap)

  const valCounts = classCounts(fold.val)

  return (
    <div>
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.7rem', alignItems: 'center', fontSize: '0.83rem' }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Strategy:</span>
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            style={{ padding: '0.2rem 0.6rem', borderRadius: 4, border: `1px solid ${m.id === mode ? ACCENT : 'var(--border)'}`, background: m.id === mode ? ACCENT : 'var(--bg)', color: m.id === mode ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '0.82rem' }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* K slider */}
      {showKSlider && (
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.7rem', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>K = {k}</span>
          <input type="range" min={3} max={10} value={k} onChange={e => setK(Number(e.target.value))}
            style={{ accentColor: ACCENT, width: 160 }} />
        </div>
      )}
      {mode === 'loo' && (
        <div style={{ marginBottom: '0.7rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          K = N = {N} (one fold per sample)
        </div>
      )}

      {/* Sample strip */}
      <div style={{ overflowX: 'auto' }}>
        <svg width={totalW} height={totalH} style={{ display: 'block', minWidth: 320 }}>
          {showClassStripe && CLASS_LABELS.map((c, i) => (
            <rect key={`cls-${i}`} x={cellX(i)} y={0} width={cellSize} height={classStripeH} rx={2}
              fill={c === 'A' ? CLASS_A : CLASS_B} opacity={0.85} />
          ))}
          {Array.from({ length: N }, (_, i) => {
            const status = cellStatus(i)
            const fill = status === 'val' ? HIGHLIGHT : status === 'train' ? 'var(--bg-hover)' : 'var(--bg)'
            const stroke = status === 'val' ? '#b45309' : 'var(--border)'
            const textColor = status === 'val' ? '#3f1d00' : status === 'train' ? 'var(--text)' : 'var(--text-muted)'
            return (
              <g key={i} opacity={status === 'future' ? 0.45 : 1} style={{ transition: 'all 0.25s' }}>
                <rect x={cellX(i)} y={stripY} width={cellSize} height={cellSize} rx={4}
                  fill={fill} stroke={stroke} strokeWidth={status === 'val' ? 2 : 1.2}
                  strokeDasharray={status === 'future' ? '3,2' : undefined} />
                <text x={cellX(i) + cellSize / 2} y={stripY + cellSize / 2 + 4} textAnchor="middle" fontSize="10" fontWeight={status === 'val' ? 'bold' : 'normal'} fill={textColor}>
                  {i}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: HIGHLIGHT, marginRight: 4, verticalAlign: 'middle' }} />Validation</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--bg-hover)', border: '1px solid var(--border)', marginRight: 4, verticalAlign: 'middle' }} />Training</span>
        {mode === 'timeseries' && (
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--bg)', border: '1px dashed var(--border)', marginRight: 4, verticalAlign: 'middle' }} />Not yet available</span>
        )}
        {showClassStripe && (
          <>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: CLASS_A, marginRight: 4, verticalAlign: 'middle' }} />Class A (14)</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: CLASS_B, marginRight: 4, verticalAlign: 'middle' }} />Class B (6)</span>
          </>
        )}
      </div>

      {/* Fold navigation */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.8rem', fontSize: '0.82rem' }}>
        <button onClick={() => { setPlaying(false); setFoldIndex(f => Math.max(0, f - 1)) }} disabled={foldIndex === 0}
          style={{ padding: '0.25rem 0.7rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: foldIndex === 0 ? 'default' : 'pointer', opacity: foldIndex === 0 ? 0.5 : 1, fontSize: '0.82rem' }}>
          ◀ Prev fold
        </button>
        <input type="range" min={0} max={numFolds - 1} value={foldIndex}
          onChange={e => { setPlaying(false); setFoldIndex(Number(e.target.value)) }}
          style={{ accentColor: ACCENT, width: 140 }} />
        <button onClick={() => { setPlaying(false); setFoldIndex(f => Math.min(numFolds - 1, f + 1)) }} disabled={foldIndex === numFolds - 1}
          style={{ padding: '0.25rem 0.7rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: foldIndex === numFolds - 1 ? 'default' : 'pointer', opacity: foldIndex === numFolds - 1 ? 0.5 : 1, fontSize: '0.82rem' }}>
          Next fold ▶
        </button>
        <button onClick={() => { setFoldIndex(0); setPlaying(true) }} disabled={playing}
          style={{ marginLeft: 'auto', padding: '0.25rem 0.7rem', borderRadius: 4, border: 'none', background: ACCENT, color: '#fff', cursor: playing ? 'default' : 'pointer', opacity: playing ? 0.5 : 1, fontSize: '0.82rem' }}>
          ▶ Animate
        </button>
      </div>

      {/* Fold info */}
      <div style={{ marginTop: '0.6rem', background: 'var(--bg-hover)', borderLeft: `3px solid ${ACCENT}`, padding: '0.5rem 0.8rem', borderRadius: '0 4px 4px 0', fontSize: '0.82rem' }}>
        <strong style={{ color: ACCENT }}>Fold {foldIndex + 1}/{numFolds}</strong>
        {' — training on '}<strong>{fold.train.length}</strong>{' samples, validating on '}<strong>{fold.val.length}</strong>{' samples'}
        {showClassStripe && (
          <div style={{ marginTop: '0.2rem', color: 'var(--text-muted)' }}>
            Validation class mix: A={valCounts.a}, B={valCounts.b} (dataset ratio is 14:6 overall)
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        {mode === 'kfold' && 'Plain K-Fold slices the data into contiguous blocks — a fold can end up with almost none of the minority class.'}
        {mode === 'stratified' && 'Stratified K-Fold allocates each class independently across folds, so every fold keeps roughly the same class ratio as the full dataset.'}
        {mode === 'loo' && 'Leave-One-Out is K-Fold pushed to the extreme: K = N, so each fold trains on all but one sample and validates on that single point.'}
        {mode === 'timeseries' && 'Time Series / Group CV never validates on data that came before its training window — the model only ever "sees the future" during evaluation, never during training.'}
      </p>
    </div>
  )
}
