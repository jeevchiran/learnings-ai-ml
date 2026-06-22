import { useState } from 'react'

const COLOR = '#0f766e'
const GATE_COLORS = {
  forget: '#ef4444',
  input:  '#0f766e',
  output: '#7c3aed',
  cell:   '#d97706',
}

function sigmoid(x) { return 1 / (1 + Math.exp(-x)) }
function tanh(x) { return Math.tanh(x) }

// Fixed weights for illustration
const WF = { h: 0.5, x: 0.4, b: 0.1 }
const WI = { h: -0.3, x: 0.8, b: 0.2 }
const WG = { h: 0.6, x: 0.5, b: -0.1 }
const WO = { h: 0.4, x: 0.7, b: 0.05 }

export default function LSTMGateWidget() {
  const [xt, setXt] = useState(0.6)
  const [hprev, setHprev] = useState(0.3)
  const [cprev, setCprev] = useState(0.2)
  const [showGRU, setShowGRU] = useState(false)
  const [highlightGate, setHighlightGate] = useState(null)

  // LSTM
  const f  = sigmoid(WF.h * hprev + WF.x * xt + WF.b)  // forget
  const i  = sigmoid(WI.h * hprev + WI.x * xt + WI.b)  // input
  const g  = tanh(WG.h * hprev + WG.x * xt + WG.b)     // cell candidate
  const o  = sigmoid(WO.h * hprev + WO.x * xt + WO.b)  // output
  const ct = f * cprev + i * g
  const ht = o * tanh(ct)

  // GRU
  const rg = sigmoid(0.5 * hprev + 0.4 * xt + 0.1)   // reset
  const zg = sigmoid(-0.3 * hprev + 0.6 * xt + 0.05) // update
  const ng = tanh(rg * hprev + 0.7 * xt + 0.0)       // candidate
  const hgru = (1 - zg) * hprev + zg * ng

  const GateRow = ({ name, value, formula, color }) => {
    const isHL = highlightGate === name
    return (
      <div
        onMouseEnter={() => setHighlightGate(name)}
        onMouseLeave={() => setHighlightGate(null)}
        style={{ padding: '0.5rem 0.7rem', borderRadius: 6, border: `2px solid ${isHL ? color : 'var(--border)'}`, marginBottom: '0.4rem', cursor: 'default', background: isHL ? `${color}11` : 'var(--bg)', transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color, fontSize: '0.82rem' }}>{name}</span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color, fontWeight: 700 }}>{value.toFixed(4)}</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{formula}</div>
        {/* Activation bar */}
        <div style={{ height: 5, marginTop: '0.3rem', background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.abs(value) * 100}%`, background: color, borderRadius: 3, transition: 'width 0.25s' }} />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
        <button onClick={() => setShowGRU(false)}
          style={{ padding: '0.25rem 0.7rem', borderRadius: 4, border: `2px solid ${!showGRU ? COLOR : 'var(--border)'}`, background: !showGRU ? COLOR : 'var(--bg)', color: !showGRU ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: !showGRU ? 700 : 400 }}>
          LSTM
        </button>
        <button onClick={() => setShowGRU(true)}
          style={{ padding: '0.25rem 0.7rem', borderRadius: 4, border: `2px solid ${showGRU ? COLOR : 'var(--border)'}`, background: showGRU ? COLOR : 'var(--bg)', color: showGRU ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: showGRU ? 700 : 400 }}>
          GRU
        </button>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: '0.5rem' }}>Hover a gate to highlight it</span>
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {[['x_t', xt, setXt], ['h_{t-1}', hprev, setHprev], ['c_{t-1}', cprev, setCprev]].map(([label, val, set], i) => {
          if (showGRU && i === 2) return null
          return (
            <label key={label} style={{ fontSize: '0.83rem' }}>
              <span style={{ color: 'var(--text-muted)' }} dangerouslySetInnerHTML={{ __html: label }}>
              </span>: <strong style={{ color: COLOR }}>{val.toFixed(2)}</strong>
              <br />
              <input type="range" min="-1" max="1" step="0.05" value={val}
                onChange={e => set(+e.target.value)}
                style={{ width: 120, accentColor: COLOR, marginTop: '0.2rem' }} />
            </label>
          )
        })}
      </div>

      {!showGRU ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gates</div>
            <GateRow name="Forget gate f" value={f} formula={`σ(Wf·[h,x]+b) = σ(${(WF.h * hprev + WF.x * xt + WF.b).toFixed(3)})`} color={GATE_COLORS.forget} />
            <GateRow name="Input gate i" value={i} formula={`σ(Wi·[h,x]+b) = σ(${(WI.h * hprev + WI.x * xt + WI.b).toFixed(3)})`} color={GATE_COLORS.input} />
            <GateRow name="Cell candidate g̃" value={g} formula={`tanh(Wg·[h,x]+b) = ${g.toFixed(3)}`} color={GATE_COLORS.cell} />
            <GateRow name="Output gate o" value={o} formula={`σ(Wo·[h,x]+b) = σ(${(WO.h * hprev + WO.x * xt + WO.b).toFixed(3)})`} color={GATE_COLORS.output} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>State Updates</div>
            <div style={{ background: 'var(--bg-hover)', borderRadius: 6, padding: '0.7rem 0.8rem', fontSize: '0.82rem', fontFamily: 'monospace', lineHeight: 2 }}>
              <div><span style={{ color: GATE_COLORS.forget }}>f</span> × c<sub>t-1</sub> = {f.toFixed(3)} × {cprev.toFixed(2)} = <strong>{(f*cprev).toFixed(4)}</strong></div>
              <div><span style={{ color: GATE_COLORS.input }}>i</span> × <span style={{ color: GATE_COLORS.cell }}>g̃</span> = {i.toFixed(3)} × {g.toFixed(3)} = <strong>{(i*g).toFixed(4)}</strong></div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.4rem' }}>
                c<sub>t</sub> = {(f*cprev).toFixed(3)} + {(i*g).toFixed(3)} = <strong style={{ color: GATE_COLORS.cell }}>{ct.toFixed(4)}</strong>
              </div>
              <div>h<sub>t</sub> = <span style={{ color: GATE_COLORS.output }}>o</span> × tanh(c<sub>t</sub>) = {o.toFixed(3)} × {tanh(ct).toFixed(3)} = <strong style={{ color: COLOR }}>{ht.toFixed(4)}</strong></div>
            </div>
            <div style={{ marginTop: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong style={{ color: GATE_COLORS.forget }}>Forget:</strong> how much of old cell survives.<br />
              <strong style={{ color: GATE_COLORS.input }}>Input:</strong> what fraction of new info enters.<br />
              <strong style={{ color: GATE_COLORS.cell }}>Cell state c<sub>t</sub>:</strong> the "highway" — additive updates avoid vanishing gradients.<br />
              <strong style={{ color: GATE_COLORS.output }}>Output:</strong> what part of cell feeds h<sub>t</sub>.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GRU Gates</div>
            <GateRow name="Reset gate r" value={rg} formula={`σ(Wr·[h,x]+b) — forget past?`} color={GATE_COLORS.forget} />
            <GateRow name="Update gate z" value={zg} formula={`σ(Wz·[h,x]+b) — blend old/new`} color={GATE_COLORS.input} />
            <GateRow name="Candidate ñ" value={ng} formula={`tanh(r·h + Wn·x) = ${ng.toFixed(3)}`} color={GATE_COLORS.cell} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>State Update</div>
            <div style={{ background: 'var(--bg-hover)', borderRadius: 6, padding: '0.7rem 0.8rem', fontSize: '0.82rem', fontFamily: 'monospace', lineHeight: 2 }}>
              <div>(1-<span style={{ color: GATE_COLORS.input }}>z</span>)×h<sub>prev</sub> = {(1-zg).toFixed(3)} × {hprev.toFixed(2)} = <strong>{((1-zg)*hprev).toFixed(4)}</strong></div>
              <div><span style={{ color: GATE_COLORS.input }}>z</span>×<span style={{ color: GATE_COLORS.cell }}>ñ</span> = {zg.toFixed(3)} × {ng.toFixed(3)} = <strong>{(zg*ng).toFixed(4)}</strong></div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.4rem' }}>
                h<sub>t</sub> = <strong style={{ color: COLOR }}>{hgru.toFixed(4)}</strong>
              </div>
            </div>
            <div style={{ marginTop: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              GRU merges cell state and hidden state into one vector. Fewer parameters than LSTM, similar performance on many tasks.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
