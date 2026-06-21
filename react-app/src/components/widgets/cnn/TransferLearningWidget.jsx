import { useEffect, useRef, useState } from 'react'
import Plotly from 'plotly.js-dist-min'

const CFG = { responsive: true, displayModeBar: false }

function sigmoid(x) { return 1 / (1 + Math.exp(-x)) }
function lerp(a, b, t) { return a + (b - a) * t }

function makeCurve(opts, epochs) {
  const { start, plateau, noise, warmupEpochs = 0, warmupVal = opts.start } = opts
  return Array.from({length: epochs}, (_, i) => {
    const t = warmupEpochs > 0 && i < warmupEpochs
      ? i / warmupEpochs
      : sigmoid((i - warmupEpochs - 2) * opts.speed)
    const base = lerp(warmupEpochs > 0 && i < warmupEpochs ? warmupVal : start, plateau, t)
    const jitter = (Math.sin(i * 7.3 + opts.seed) + Math.cos(i * 3.1)) * noise
    return Math.min(1, Math.max(0, base + jitter))
  })
}

const SCENARIOS = {
  'Train from scratch': {
    train: { start:0.05, plateau:0.88, speed:0.25, noise:0.012, seed:1 },
    val:   { start:0.04, plateau:0.82, speed:0.20, noise:0.018, seed:5 },
    color: '#6b7280',
  },
  'Feature extraction': {
    train: { start:0.58, plateau:0.94, speed:0.55, noise:0.008, seed:2 },
    val:   { start:0.55, plateau:0.90, speed:0.50, noise:0.012, seed:6 },
    color: '#0ea5e9',
  },
  'Full fine-tuning': {
    train: { start:0.62, plateau:0.97, speed:0.40, noise:0.010, seed:3 },
    val:   { start:0.58, plateau:0.93, speed:0.35, noise:0.015, seed:7 },
    color: '#be185d',
  },
}

export default function TransferLearningWidget() {
  const accRef  = useRef(null)
  const lossRef = useRef(null)
  const [epochs, setEpochs]   = useState(30)
  const [active, setActive]   = useState(new Set(Object.keys(SCENARIOS)))

  useEffect(() => {
    const xs = Array.from({length: epochs}, (_,i) => i+1)
    const accTraces = [], lossTraces = []

    Object.entries(SCENARIOS).forEach(([name, cfg]) => {
      if (!active.has(name)) return
      const trainAcc = makeCurve(cfg.train, epochs)
      const valAcc   = makeCurve(cfg.val, epochs)
      const trainLoss = trainAcc.map(a => -Math.log(Math.max(0.01, a)) * 0.4)
      const valLoss   = valAcc.map(a => -Math.log(Math.max(0.01, a)) * 0.45)

      accTraces.push(
        { x:xs, y:trainAcc, name:`${name} (train)`, mode:'lines', line:{ color:cfg.color, width:2, dash:'dot' } },
        { x:xs, y:valAcc,   name:`${name} (val)`,   mode:'lines', line:{ color:cfg.color, width:2.5 } },
      )
      lossTraces.push(
        { x:xs, y:trainLoss, name:`${name} (train)`, mode:'lines', line:{ color:cfg.color, width:2, dash:'dot' }, showlegend:false },
        { x:xs, y:valLoss,   name:`${name} (val)`,   mode:'lines', line:{ color:cfg.color, width:2.5 }, showlegend:false },
      )
    })

    const base = {
      margin:{ t:36, r:10, b:50, l:55 },
      paper_bgcolor:'transparent', plot_bgcolor:'transparent',
      legend:{ x:0.01, y:0.01, bgcolor:'transparent', font:{size:9} },
    }

    Plotly.react(accRef.current, accTraces, {
      ...base,
      title:{ text:'Validation accuracy', font:{size:12} },
      xaxis:{ title:'Epoch' }, yaxis:{ title:'Accuracy', range:[0,1] },
    }, CFG)

    Plotly.react(lossRef.current, lossTraces, {
      ...base,
      title:{ text:'Validation loss', font:{size:12} },
      xaxis:{ title:'Epoch' }, yaxis:{ title:'Loss' },
    }, CFG)
  }, [epochs, active])

  function toggleScenario(name) {
    setActive(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <div>
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'0.7rem', alignItems:'center' }}>
        {Object.entries(SCENARIOS).map(([name, cfg]) => (
          <button key={name} onClick={() => toggleScenario(name)}
            style={{ padding:'0.3rem 0.75rem', fontSize:'0.82rem', borderRadius:4, cursor:'pointer',
              border:`2px solid ${cfg.color}`,
              background: active.has(name) ? cfg.color : 'transparent',
              color: active.has(name) ? '#fff' : cfg.color,
              fontWeight:600 }}>
            {name}
          </button>
        ))}
        <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.83rem' }}>
          Epochs:
          <input type="range" min={10} max={60} value={epochs} onChange={e => setEpochs(+e.target.value)} style={{ width:80 }} />
          <strong style={{ color:'#be185d' }}>{epochs}</strong>
        </label>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
        <div ref={accRef}  style={{ minHeight:280 }} />
        <div ref={lossRef} style={{ minHeight:280 }} />
      </div>

      <div style={{ marginTop:'0.7rem', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.5rem', fontSize:'0.8rem' }}>
        {[
          ['Train from scratch', '#6b7280', 'Random init → full training. Slowest convergence, needs most data.'],
          ['Feature extraction', '#0ea5e9', 'Freeze pretrained layers, train only the head. Fast but limited capacity for new tasks.'],
          ['Full fine-tuning', '#be185d', 'Start from pretrained weights, train all layers. Best accuracy when you have enough data.'],
        ].map(([name, color, desc]) => (
          <div key={name} style={{ padding:'0.5rem', borderLeft:`3px solid ${color}`, background:'var(--bg-hover)', borderRadius:'0 4px 4px 0' }}>
            <div style={{ fontWeight:700, color, marginBottom:'0.2rem' }}>{name}</div>
            <div style={{ color:'var(--text-muted)' }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
