import { useState } from 'react'

const DEFAULT_LAYERS = [
  { type:'input', h:32, w:32, c:3 },
  { type:'conv',  k:3, cout:32, s:1, p:1 },
  { type:'pool',  k:2, s:2 },
  { type:'conv',  k:3, cout:64, s:1, p:1 },
  { type:'pool',  k:2, s:2 },
  { type:'conv',  k:3, cout:128, s:1, p:1 },
  { type:'pool',  k:2, s:2 },
  { type:'flatten' },
  { type:'fc',    nout:256 },
  { type:'fc',    nout:10 },
]

function computeShapes(layers) {
  let h = 0, w = 0, c = 0
  const rows = []
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i]
    if (l.type === 'input') {
      h = l.h; w = l.w; c = l.c
      rows.push({ label:'Input', shape:`${h}×${w}×${c}`, params:0, paramsStr:'—' })
    } else if (l.type === 'conv') {
      const nh = Math.floor((h + 2*l.p - l.k) / l.s) + 1
      const nw = Math.floor((w + 2*l.p - l.k) / l.s) + 1
      const params = l.k * l.k * c * l.cout + l.cout
      rows.push({
        label: `Conv ${l.k}×${l.k}, ${l.cout} ch, s=${l.s}, p=${l.p}`,
        shape: `${nh}×${nw}×${l.cout}`,
        params,
        paramsStr: `${l.k}×${l.k}×${c}×${l.cout}+${l.cout} = ${params.toLocaleString()}`,
      })
      h = nh; w = nw; c = l.cout
    } else if (l.type === 'pool') {
      const nh = Math.floor((h - l.k) / l.s) + 1
      const nw = Math.floor((w - l.k) / l.s) + 1
      rows.push({ label: `MaxPool ${l.k}×${l.k}, s=${l.s}`, shape:`${nh}×${nw}×${c}`, params:0, paramsStr:'0' })
      h = nh; w = nw
    } else if (l.type === 'flatten') {
      const flat = h * w * c
      rows.push({ label:'Flatten', shape:`${flat}`, params:0, paramsStr:'0' })
      h = flat; w = 1; c = 1
    } else if (l.type === 'fc') {
      const nin = h
      const params = nin * l.nout + l.nout
      rows.push({
        label: `FC → ${l.nout}`,
        shape: `${l.nout}`,
        params,
        paramsStr: `${nin.toLocaleString()}×${l.nout}+${l.nout} = ${params.toLocaleString()}`,
      })
      h = l.nout
    }
  }
  return rows
}

export default function CNNParamsWidget() {
  const [layers, setLayers] = useState(DEFAULT_LAYERS)

  const rows  = computeShapes(layers)
  const total = rows.reduce((s, r) => s + r.params, 0)

  function updateLayer(idx, field, value) {
    setLayers(prev => {
      const next = prev.map((l, i) => i === idx ? { ...l, [field]: +value } : l)
      return next
    })
  }

  function editableField(idx, layer, field, label, min, max) {
    return (
      <label key={field} style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.78rem' }}>
        {label}:
        <input type="number" min={min} max={max} value={layer[field]}
          onChange={e => updateLayer(idx, field, e.target.value)}
          style={{ width:42, padding:'0.1rem 0.25rem', border:'1px solid var(--border)', borderRadius:3, background:'var(--bg)', color:'var(--text)', fontSize:'0.78rem' }} />
      </label>
    )
  }

  return (
    <div>
      <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:'0.6rem' }}>
        Edit layer parameters to see how output shape and parameter count change at each step.
      </p>

      {/* Editable inputs for key layers */}
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'0.8rem', padding:'0.6rem', background:'var(--bg-hover)', borderRadius:6, fontSize:'0.82rem' }}>
        <strong style={{ color:'#be185d', alignSelf:'center' }}>Input:</strong>
        {['h','w','c'].map(f => editableField(0, layers[0], f, f, 1, 512))}
      </div>

      {/* Parameter table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
          <thead>
            <tr style={{ borderBottom:'2px solid #be185d' }}>
              {['#','Layer','Output Shape','Parameters','Formula'].map(h => (
                <th key={h} style={{ textAlign:'left', padding:'0.35rem 0.5rem', color:'#be185d', fontWeight:700, whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom:'1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-hover)' }}>
                <td style={{ padding:'0.35rem 0.5rem', color:'var(--text-muted)', fontFamily:'monospace' }}>{i}</td>
                <td style={{ padding:'0.35rem 0.5rem', fontWeight: row.params > 0 ? 600 : 400 }}>{row.label}</td>
                <td style={{ padding:'0.35rem 0.5rem', fontFamily:'monospace', color:'#be185d', fontWeight:600 }}>{row.shape}</td>
                <td style={{ padding:'0.35rem 0.5rem', fontFamily:'monospace', fontWeight: row.params > 0 ? 600 : 400 }}>
                  {row.params > 0 ? row.params.toLocaleString() : row.paramsStr}
                </td>
                <td style={{ padding:'0.35rem 0.5rem', fontFamily:'monospace', fontSize:'0.76rem', color:'var(--text-muted)' }}>{row.paramsStr}</td>
              </tr>
            ))}
            <tr style={{ borderTop:'2px solid #be185d', background:'rgba(190,24,93,0.06)' }}>
              <td colSpan={2} style={{ padding:'0.4rem 0.5rem', fontWeight:700 }}>Total trainable parameters</td>
              <td colSpan={3} style={{ padding:'0.4rem 0.5rem', fontFamily:'monospace', fontSize:'1rem', fontWeight:700, color:'#be185d' }}>
                {total.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.6rem' }}>
        Conv params = k×k×C_in×C_out + C_out (bias). Pool has zero params. FC params = n_in×n_out + n_out.
        Output height: ⌊(H + 2P − K) / S⌋ + 1.
      </p>
    </div>
  )
}
