import { useState } from 'react'

// ── SVG Parse Tree Renderer ───────────────────────────────────────────────────
const NODE_COLORS = {
  S:  '#2563eb',  // blue
  NP: '#16a34a',  // green
  VP: '#dc2626',  // red
  PP: '#9333ea',  // purple
  default: '#374151',
}

function getNodeColor(label) {
  return NODE_COLORS[label] || (label.length <= 2 && label === label.toUpperCase() ? '#d97706' : '#374151')
}

function isLeaf(node) {
  return !node.children || node.children.length === 0
}

// Measure the tree to assign x coordinates
function measureTree(node) {
  if (isLeaf(node)) {
    node._w = 1
    return 1
  }
  let totalW = 0
  node.children.forEach(child => { totalW += measureTree(child) })
  node._w = totalW
  return totalW
}

function assignPositions(node, x, y) {
  node._x = x + node._w / 2
  node._y = y
  let cx = x
  if (node.children) {
    node.children.forEach(child => {
      assignPositions(child, cx, y + 1)
      cx += child._w
    })
  }
}

// Collect all nodes and edges
function collectNodes(node, nodes, edges) {
  nodes.push(node)
  if (node.children) {
    node.children.forEach(child => {
      edges.push([node, child])
      collectNodes(child, nodes, edges)
    })
  }
}

function buildParseTreeSVG(tree, width = 700) {
  measureTree(tree)
  const depth = getDepth(tree)
  const cellW = Math.max(36, width / tree._w)
  const cellH = 56
  const svgW = cellW * tree._w
  const svgH = cellH * depth + 20
  const padX = cellW / 2

  assignPositions(tree, 0, 0)

  const nodes = [], edges = []
  collectNodes(tree, nodes, edges)

  const px = n => n._x * cellW
  const py = n => n._y * cellH + 28

  const isLabel = n => isLeaf(n) && n.label && n.label[0] === n.label[0].toLowerCase()

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block', fontFamily: 'var(--font-sans,sans-serif)', overflow: 'visible' }}>
      {/* Edges */}
      {edges.map(([parent, child], idx) => (
        <line
          key={idx}
          x1={px(parent)} y1={py(parent) + 12}
          x2={px(child)} y2={py(child) - 16}
          stroke="#9ca3af" strokeWidth={1.5}
        />
      ))}
      {/* Nodes */}
      {nodes.map((n, idx) => {
        const x = px(n), y = py(n)
        const leaf = isLeaf(n)
        const color = leaf ? '#374151' : getNodeColor(n.label)
        const isWord = leaf && n.label && n.label[0] === n.label[0].toLowerCase()

        if (leaf) {
          return (
            <text key={idx} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fontSize={isWord ? 13 : 11} fontWeight={isWord ? 600 : 400}
              fill={isWord ? '#111827' : '#6b7280'}
              fontStyle={isWord ? 'normal' : 'italic'}>
              {n.label}
            </text>
          )
        }
        return (
          <g key={idx}>
            <rect x={x - 18} y={y - 13} width={36} height={24} rx={4}
              fill={`${color}22`} stroke={color} strokeWidth={1.5} />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fontSize={11} fontWeight={700} fill={color}>
              {n.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function getDepth(node) {
  if (isLeaf(node)) return 1
  return 1 + Math.max(...node.children.map(getDepth))
}

// ── Sentence data ─────────────────────────────────────────────────────────────
const SENTENCES = [
  {
    label: 'The dog chased a cat.',
    steps: [
      { tree: { label: 'S' }, explain: 'Root: S (Sentence). Every derivation begins here.' },
      { tree: { label: 'S', children: [{ label: 'NP' }, { label: 'VP' }] }, explain: 'S → NP VP. Splits into subject noun phrase and verb phrase.' },
      { tree: { label: 'S', children: [{ label: 'NP', children: [{ label: 'DT' }, { label: 'N' }] }, { label: 'VP' }] }, explain: 'NP → DT N. Subject NP = determiner + noun.' },
      { tree: { label: 'S', children: [{ label: 'NP', children: [{ label: 'DT' }, { label: 'N' }] }, { label: 'VP', children: [{ label: 'V' }, { label: 'NP', children: [{ label: 'DT' }, { label: 'N' }] }] }] }, explain: 'VP → V NP. Transitive verb plus object NP (DT + N).' },
      { tree: { label: 'S', children: [{ label: 'NP', children: [{ label: 'DT', children: [{ label: 'The' }] }, { label: 'N', children: [{ label: 'dog' }] }] }, { label: 'VP', children: [{ label: 'V', children: [{ label: 'chased' }] }, { label: 'NP', children: [{ label: 'DT', children: [{ label: 'a' }] }, { label: 'N', children: [{ label: 'cat' }] }] }] }] }, explain: 'Expand all pre-terminals to words. Parse complete.' },
    ],
  },
  {
    label: 'She put the book on the shelf.',
    steps: [
      { tree: { label: 'S' }, explain: 'Root S. Parsing "She put the book on the shelf."' },
      { tree: { label: 'S', children: [{ label: 'NP' }, { label: 'VP' }] }, explain: 'S → NP VP. Subject NP ("She") and predicate VP.' },
      { tree: { label: 'S', children: [{ label: 'NP', children: [{ label: 'N' }] }, { label: 'VP' }] }, explain: 'NP → N. Pronoun as bare noun.' },
      { tree: { label: 'S', children: [{ label: 'NP', children: [{ label: 'N' }] }, { label: 'VP', children: [{ label: 'V' }, { label: 'NP' }, { label: 'PP' }] }] }, explain: 'VP → V NP PP. "Put" takes object NP and locative PP.' },
      { tree: { label: 'S', children: [{ label: 'NP', children: [{ label: 'N', children: [{ label: 'She' }] }] }, { label: 'VP', children: [{ label: 'V', children: [{ label: 'put' }] }, { label: 'NP', children: [{ label: 'DT', children: [{ label: 'the' }] }, { label: 'N', children: [{ label: 'book' }] }] }, { label: 'PP', children: [{ label: 'IN', children: [{ label: 'on' }] }, { label: 'NP', children: [{ label: 'DT', children: [{ label: 'the' }] }, { label: 'N', children: [{ label: 'shelf' }] }] }] }] }] }, explain: 'Full parse. PP → IN NP ("on the shelf"). Parse complete.' },
    ],
  },
  {
    label: 'The old man saw the girl with a telescope.',
    steps: [
      { tree: { label: 'S' }, explain: 'Root S. This sentence has a PP attachment ambiguity!' },
      { tree: { label: 'S', children: [{ label: 'NP' }, { label: 'VP' }] }, explain: 'S → NP VP.' },
      { tree: { label: 'S', children: [{ label: 'NP', children: [{ label: 'DT' }, { label: 'JJ' }, { label: 'N' }] }, { label: 'VP' }] }, explain: 'NP → DT JJ N. Subject: "The old man".' },
      { tree: { label: 'S', children: [{ label: 'NP', children: [{ label: 'DT' }, { label: 'JJ' }, { label: 'N' }] }, { label: 'VP', children: [{ label: 'V' }, { label: 'NP' }, { label: 'PP' }] }] }, explain: 'VP → V NP PP (Interpretation 1: PP attaches to VP — he used the telescope).' },
      { tree: { label: 'S', children: [{ label: 'NP', children: [{ label: 'DT', children: [{ label: 'The' }] }, { label: 'JJ', children: [{ label: 'old' }] }, { label: 'N', children: [{ label: 'man' }] }] }, { label: 'VP', children: [{ label: 'V', children: [{ label: 'saw' }] }, { label: 'NP', children: [{ label: 'DT', children: [{ label: 'the' }] }, { label: 'N', children: [{ label: 'girl' }] }] }, { label: 'PP', children: [{ label: 'IN', children: [{ label: 'with' }] }, { label: 'NP', children: [{ label: 'DT', children: [{ label: 'a' }] }, { label: 'N', children: [{ label: 'telescope' }] }] }] }] }] }, explain: 'VP-attachment: the man used a telescope to see the girl. Alternative parse would nest PP inside the object NP.' },
    ],
  },
]

// Ambiguity widget trees
const AMB_TREES = [
  {
    label: 'PP → VP (I wore pajamas)',
    explain: 'PP attaches to VP: "in my pajamas" modifies "shot". I did the shooting while wearing pajamas. [VP shot [NP an elephant] [PP in my pajamas]].',
    tree: {
      label: 'S',
      children: [
        { label: 'NP', children: [{ label: 'N', children: [{ label: 'I' }] }] },
        { label: 'VP', children: [
          { label: 'V', children: [{ label: 'shot' }] },
          { label: 'NP', children: [{ label: 'DT', children: [{ label: 'an' }] }, { label: 'N', children: [{ label: 'elephant' }] }] },
          { label: 'PP', children: [{ label: 'IN', children: [{ label: 'in' }] }, { label: 'NP', children: [{ label: 'DT', children: [{ label: 'my' }] }, { label: 'N', children: [{ label: 'pajamas' }] }] }] },
        ] },
      ],
    },
  },
  {
    label: 'PP → NP (elephant wore pajamas)',
    explain: 'PP attaches to NP: "in my pajamas" modifies "an elephant". The elephant was wearing pajamas. [VP shot [NP an elephant [PP in my pajamas]]].',
    tree: {
      label: 'S',
      children: [
        { label: 'NP', children: [{ label: 'N', children: [{ label: 'I' }] }] },
        { label: 'VP', children: [
          { label: 'V', children: [{ label: 'shot' }] },
          { label: 'NP', children: [
            { label: 'DT', children: [{ label: 'an' }] },
            { label: 'N', children: [{ label: 'elephant' }] },
            { label: 'PP', children: [{ label: 'IN', children: [{ label: 'in' }] }, { label: 'NP', children: [{ label: 'DT', children: [{ label: 'my' }] }, { label: 'N', children: [{ label: 'pajamas' }] }] }] },
          ] },
        ] },
      ],
    },
  },
]

export default function ParseTreeWidget() {
  const [sentIdx, setSentIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [ambIdx, setAmbIdx] = useState(0)

  const sent = SENTENCES[sentIdx]
  const step = sent.steps[stepIdx]

  function changeSent(i) {
    setSentIdx(i)
    setStepIdx(0)
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans,sans-serif)', fontSize: '0.9rem' }}>
      <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Step-Through Parse Tree Builder</h4>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted,#6b7280)', textTransform: 'uppercase' }}>Sentence</span>
          <select value={sentIdx} onChange={e => changeSent(parseInt(e.target.value))} style={selectStyle}>
            {SENTENCES.map((s, i) => <option key={i} value={i}>{i + 1}. {s.label}</option>)}
          </select>
        </label>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: 'rgba(37,99,235,0.05)', border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-muted,#6b7280)' }}>
        <strong style={{ color: 'var(--text,#111)' }}>Step {stepIdx + 1} / {sent.steps.length}:</strong> {step.explain}
      </div>

      <div style={{ border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', padding: '0.5rem', background: 'var(--bg-secondary,#f9fafb)', overflowX: 'auto', minHeight: '8rem' }}>
        {buildParseTreeSVG(step.tree, 680)}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button onClick={() => setStepIdx(i => Math.max(0, i - 1))} disabled={stepIdx === 0} style={btnStyle}>← Prev</button>
        <button onClick={() => setStepIdx(i => Math.min(sent.steps.length - 1, i + 1))} disabled={stepIdx === sent.steps.length - 1} style={btnStyle}>Next →</button>
        <button onClick={() => setStepIdx(0)} style={{ ...btnStyle, marginLeft: 'auto', background: 'var(--bg-secondary,#f3f4f6)', color: 'var(--text,#111)' }}>Reset</button>
      </div>

      {/* Ambiguity section */}
      <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--border,#d1d5db)' }} />
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>PP Attachment Ambiguity</h4>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted,#6b7280)' }}>
        "I shot an elephant in my pajamas." — two parse trees, two meanings.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {AMB_TREES.map((t, i) => (
          <button key={i} onClick={() => setAmbIdx(i)} style={{ ...btnStyle, background: ambIdx === i ? 'var(--accent-blue,#2563eb)' : 'var(--bg-secondary,#f3f4f6)', color: ambIdx === i ? '#fff' : 'var(--text,#111)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0.6rem 1rem', background: 'rgba(37,99,235,0.05)', border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-muted,#6b7280)' }}>
        {AMB_TREES[ambIdx].explain}
      </div>

      <div style={{ border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', padding: '0.5rem', background: 'var(--bg-secondary,#f9fafb)', overflowX: 'auto', minHeight: '8rem' }}>
        {buildParseTreeSVG(AMB_TREES[ambIdx].tree, 680)}
      </div>
    </div>
  )
}

const btnStyle = {
  padding: '0.35rem 0.75rem',
  background: 'var(--accent-blue,#2563eb)',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.83rem',
}

const selectStyle = {
  padding: '0.35rem 0.6rem',
  border: '1px solid var(--border,#d1d5db)',
  borderRadius: '4px',
  background: 'var(--bg-secondary,#f9fafb)',
  color: 'var(--text,#111)',
  fontSize: '0.85rem',
}
