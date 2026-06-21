import { useState } from 'react'

// ── Levenshtein DP ────────────────────────────────────────────────────────────
function levenshteinMatrix(s, t) {
  const m = s.length, n = t.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  // Backtrace
  const path = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    path.push([i, j])
    if (i === 0) { j--; continue }
    if (j === 0) { i--; continue }
    const cost = s[i - 1] === t[j - 1] ? 0 : 1
    const diag = dp[i - 1][j - 1] + cost
    const up   = dp[i - 1][j] + 1
    const left = dp[i][j - 1] + 1
    if (dp[i][j] === diag) { i--; j-- }
    else if (dp[i][j] === up) { i-- }
    else { j-- }
  }
  path.push([0, 0])
  return { dp, dist: dp[m][n], path }
}

function countOps(s, t, result) {
  const path = [...result.path].reverse()
  let subs = 0, ins = 0, del = 0, match = 0
  for (let k = 1; k < path.length; k++) {
    const [pi, pj] = path[k - 1], [ci, cj] = path[k]
    const di = ci - pi, dj = cj - pj
    if (di === 1 && dj === 1) { s[ci - 1] === t[cj - 1] ? match++ : subs++ }
    else if (di === 1) { del++ }
    else { ins++ }
  }
  return { subs, ins, del, match }
}

// ── Matrix Table ──────────────────────────────────────────────────────────────
function MatrixTable({ s, t, result, stepState }) {
  const { dp, path } = result
  const pathSet = new Set(path.map(([r, c]) => `${r},${c}`))
  const m = s.length, n = t.length

  // stepState: null (live) or { filledUpTo: {i,j}, dp }
  const filled = stepState ? stepState.filledUpTo : { i: m, j: n }
  const stepDp = stepState ? stepState.dp : dp

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: '0.82rem', fontFamily: 'var(--font-mono, monospace)' }}>
        <thead>
          <tr>
            <th style={thStyle}></th>
            <th style={thStyle}></th>
            {Array.from({ length: n + 1 }, (_, j) => (
              <th key={j} style={thStyle}>{j === 0 ? '' : t[j - 1]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: m + 1 }, (_, i) => (
            <tr key={i}>
              <th style={thStyle}>{i === 0 ? '' : s[i - 1]}</th>
              {Array.from({ length: n + 1 }, (_, j) => {
                const linearThis = i * (n + 1) + j
                const linearUpTo = filled.i * (n + 1) + filled.j
                const isFilled = stepState ? linearThis <= linearUpTo : true
                const isCurrent = stepState && filled.i >= 0 && i === filled.i && j === filled.j
                const isPath = pathSet.has(`${i},${j}`) && isFilled
                const val = isFilled && stepDp ? stepDp[i][j] : ''

                let bg = 'transparent'
                let color = 'inherit'
                let fontWeight = 'normal'
                if (isCurrent) { bg = 'rgba(234,179,8,0.3)'; fontWeight = '700' }
                else if (isPath) { bg = 'rgba(22,163,74,0.25)'; fontWeight = '700'; color = 'var(--success, #16a34a)' }
                else if (isFilled && val !== '' && val === 0) { color = 'var(--success, #16a34a)' }

                return (
                  <td key={j} style={{ ...tdStyle, background: bg, color, fontWeight }}>
                    {val !== '' ? val : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const thStyle = {
  border: '1px solid var(--border, #d1d5db)',
  padding: '0.3rem 0.5rem',
  background: 'rgba(37,99,235,0.06)',
  textAlign: 'center',
  minWidth: '2rem',
}
const tdStyle = {
  border: '1px solid var(--border, #d1d5db)',
  padding: '0.3rem 0.5rem',
  textAlign: 'center',
  minWidth: '2rem',
  transition: 'background 0.2s',
}

// ── Build step states ─────────────────────────────────────────────────────────
function buildStepStates(s, t) {
  const m = s.length, n = t.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }

  const states = [
    {
      filledUpTo: { i: -1, j: -1 },
      explain: `Table has ${m + 1} rows (for "${s}" + empty) and ${n + 1} columns (for "${t}" + empty). Fill left-to-right, top-to-bottom.`,
      dp
    }
  ]

  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      let explain = ''
      if (i === 0 && j === 0) {
        explain = 'd[0][0] = 0. Converting empty → empty costs 0.'
      } else if (i === 0) {
        explain = `d[0][${j}] = ${j}. Converting "" → "${t.slice(0, j)}" needs ${j} insertion${j > 1 ? 's' : ''}.`
      } else if (j === 0) {
        explain = `d[${i}][0] = ${i}. Converting "${s.slice(0, i)}" → "" needs ${i} deletion${i > 1 ? 's' : ''}.`
      } else {
        const sc = s[i - 1], tc = t[j - 1]
        const cost = sc === tc ? 0 : 1
        const delCost = dp[i - 1][j] + 1
        const insCost = dp[i][j - 1] + 1
        const subCost = dp[i - 1][j - 1] + cost
        const chosen = Math.min(delCost, insCost, subCost)
        let opStr = ''
        if (chosen === subCost && cost === 0) opStr = `match ("${sc}"="${tc}"), diagonal`
        else if (chosen === subCost) opStr = `substitute "${sc}"→"${tc}", diagonal+1`
        else if (chosen === delCost) opStr = `delete "${sc}", from above`
        else opStr = `insert "${tc}", from left`
        explain = `d[${i}][${j}]: delete=${delCost}, insert=${insCost}, sub=${subCost}. Min=${chosen} (${opStr}).`
      }
      states.push({ filledUpTo: { i, j }, explain, dp })
    }
  }
  return states
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function LevenshteinWidget() {
  const [src, setSrc] = useState('kitten')
  const [tgt, setTgt] = useState('sitting')
  const [stepMode, setStepMode] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [stepStates, setStepStates] = useState(null)

  const validInputs = src.length > 0 && tgt.length > 0 && src.length <= 18 && tgt.length <= 18

  const result = validInputs ? levenshteinMatrix(src, tgt) : null
  const ops = result ? countOps(src, tgt, result) : null

  function enterStepMode() {
    if (!validInputs) return
    const states = buildStepStates(src, tgt)
    setStepStates(states)
    setStepIdx(0)
    setStepMode(true)
  }

  function handleSrcChange(v) {
    setSrc(v)
    setStepMode(false)
    setStepStates(null)
  }

  function handleTgtChange(v) {
    setTgt(v)
    setStepMode(false)
    setStepStates(null)
  }

  function reset() {
    setSrc('kitten')
    setTgt('sitting')
    setStepMode(false)
    setStepStates(null)
  }

  const currentStep = stepMode && stepStates ? stepStates[stepIdx] : null

  return (
    <div style={{ fontFamily: 'var(--font-sans, sans-serif)', fontSize: '0.9rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</span>
          <input
            value={src}
            onChange={e => handleSrcChange(e.target.value)}
            style={inputStyle}
            maxLength={18}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target</span>
          <input
            value={tgt}
            onChange={e => handleTgtChange(e.target.value)}
            style={inputStyle}
            maxLength={18}
          />
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', paddingBottom: '2px' }}>
          {!stepMode && (
            <button onClick={enterStepMode} disabled={!validInputs} style={btnStyle}>
              Step Through
            </button>
          )}
          <button onClick={reset} style={{ ...btnStyle, background: 'var(--bg-secondary, #f3f4f6)', color: 'var(--text, #111)' }}>
            Reset
          </button>
        </div>
      </div>

      {src.length > 18 || tgt.length > 18 ? (
        <p style={{ color: 'var(--text-muted, #6b7280)', fontSize: '0.85rem' }}>Keep words under 18 characters for display clarity.</p>
      ) : !src || !tgt ? (
        <p style={{ color: 'var(--text-muted, #6b7280)', fontSize: '0.85rem' }}>Enter non-empty source and target words.</p>
      ) : (
        <>
          {result && !stepMode && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {[
                ['Edit Distance', result.dist],
                ['Substitutions', ops?.subs],
                ['Insertions', ops?.ins],
                ['Deletions', ops?.del],
                ['Matches', ops?.match],
              ].map(([label, val]) => (
                <div key={label} style={statCard}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #6b7280)', textTransform: 'uppercase' }}>{label}</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--accent-blue, #2563eb)' }}>{val}</strong>
                </div>
              ))}
            </div>
          )}

          {stepMode && currentStep && (
            <div style={{ marginBottom: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(37,99,235,0.06)', border: '1px solid var(--border, #d1d5db)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)' }}>Step {stepIdx} / {stepStates.length - 1}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => setStepIdx(i => Math.max(0, i - 1))} disabled={stepIdx === 0} style={btnSmall}>← Prev</button>
                  <button onClick={() => setStepIdx(i => Math.min(stepStates.length - 1, i + 1))} disabled={stepIdx === stepStates.length - 1} style={btnSmall}>Next →</button>
                  <button onClick={() => { setStepMode(false); setStepStates(null) }} style={{ ...btnSmall, background: 'var(--bg-secondary, #f3f4f6)', color: 'var(--text, #111)' }}>Exit</button>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>{currentStep.explain}</p>
            </div>
          )}

          <MatrixTable
            s={src}
            t={tgt}
            result={result}
            stepState={stepMode && currentStep ? currentStep : null}
          />

          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
            <span><span style={{ display: 'inline-block', width: '14px', height: '14px', background: 'rgba(22,163,74,0.25)', border: '1px solid rgba(22,163,74,0.5)', borderRadius: '2px', verticalAlign: 'middle', marginRight: '4px' }}></span>Backtrace path</span>
            {stepMode && <span><span style={{ display: 'inline-block', width: '14px', height: '14px', background: 'rgba(234,179,8,0.3)', border: '1px solid rgba(234,179,8,0.7)', borderRadius: '2px', verticalAlign: 'middle', marginRight: '4px' }}></span>Current cell</span>}
          </div>
        </>
      )}
    </div>
  )
}

const inputStyle = {
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: '0.95rem',
  padding: '0.35rem 0.6rem',
  border: '1px solid var(--border, #d1d5db)',
  borderRadius: '4px',
  background: 'var(--bg-secondary, #f9fafb)',
  color: 'var(--text, #111)',
  width: '10rem',
}

const btnStyle = {
  padding: '0.4rem 0.85rem',
  background: 'var(--accent-blue, #2563eb)',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85rem',
}

const btnSmall = {
  padding: '0.25rem 0.6rem',
  background: 'var(--accent-blue, #2563eb)',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.8rem',
}

const statCard = {
  display: 'flex',
  flexDirection: 'column',
  padding: '0.5rem 0.75rem',
  background: 'var(--bg-secondary, #f9fafb)',
  border: '1px solid var(--border, #d1d5db)',
  borderRadius: '6px',
  minWidth: '90px',
}
