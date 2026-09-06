import React, { useState } from 'react';

const NODES = [
  { id: 'user', label: 'User input', x: 30, y: 100, trust: 'semi-trusted', color: '#65a30d',
    detail: 'The classic jailbreaking surface: the person typing is trying to move the model past its own policy. Note the attacker and the principal are the same party here — which is what separates jailbreaking from injection.' },
  { id: 'retrieval', label: 'Retrieved docs', x: 30, y: 30, trust: 'UNTRUSTED', color: '#b91c1c',
    detail: 'Text pulled from a corpus the user did not write and nobody re-read before it entered the prompt. If an attacker can get a document into the index, they can place instructions into every query that retrieves it.' },
  { id: 'web', label: 'Fetched web page', x: 30, y: 170, trust: 'UNTRUSTED', color: '#b91c1c',
    detail: 'A page fetched at runtime is fully attacker-controlled if the attacker owns the page. Hidden text, comments, and alt attributes all reach the model even when a human viewer would never see them.' },
  { id: 'model', label: 'Model', x: 175, y: 100, trust: 'processes everything as one stream', color: '#0369a1',
    detail: 'Every arrow above converges into a single context window with no enforced trust boundary between the sources. This convergence is the vulnerability — not any individual input on its own.' },
  { id: 'tools', label: 'Tool calls', x: 320, y: 40, trust: 'PRIVILEGED', color: '#7c2d12',
    detail: 'Where injection stops being a text problem: the model holds credentials and can send email, query databases, or write files. Text from an untrusted document now steers privileged actions — the confused-deputy problem.' },
  { id: 'output', label: 'Output to user', x: 320, y: 160, trust: 'exfiltration path', color: '#c026d3',
    detail: 'Rendered output is itself a channel. Markdown images and links pointing at attacker-controlled URLs can carry context-window contents out in the query string, with no tool call involved at all.' },
];

const EDGES = [
  ['retrieval', 'model'], ['user', 'model'], ['web', 'model'], ['model', 'tools'], ['model', 'output'],
];

export default function InjectionSurfaceWidget() {
  const [selected, setSelected] = useState('retrieval');
  const node = NODES.find((n) => n.id === selected);
  const nodeById = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <div className="widget-box" style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '12px', background: 'var(--bg-card, #ffffff)' }}>
      <div style={{ marginBottom: '0.9rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          Where Untrusted Text Enters an Agent Pipeline
        </h4>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
          Click any surface. Red nodes are content nobody on your team wrote or reviewed.
        </p>
      </div>

      <svg viewBox="0 0 420 210" style={{ width: '100%', height: 'auto', background: 'var(--bg-canvas, #f8fafc)', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <defs>
          <marker id="gr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        {EDGES.map(([from, to]) => {
          const a = nodeById[from], b = nodeById[to];
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x + 62} y1={a.y + 14} x2={b.x - 4} y2={b.y + 14}
              stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#gr-arrow)"
            />
          );
        })}
        {NODES.map((n) => (
          <g key={n.id} onClick={() => setSelected(n.id)} style={{ cursor: 'pointer' }}>
            <rect
              x={n.x} y={n.y} width={68} height={28} rx="6"
              fill={selected === n.id ? n.color : `${n.color}22`}
              stroke={n.color} strokeWidth={selected === n.id ? 2.5 : 1.5}
            />
            <text
              x={n.x + 34} y={n.y + 18} fontSize="9" textAnchor="middle" fontWeight="600"
              fill={selected === n.id ? '#ffffff' : n.color}
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>

      <div style={{ marginTop: '0.85rem', padding: '0.8rem 1rem', borderRadius: '8px', background: 'var(--bg-secondary, #f8fafc)', border: `1px solid ${node.color}44` }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: node.color, marginBottom: '0.3rem' }}>
          {node.label} — {node.trust}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary, #334155)' }}>{node.detail}</div>
      </div>
    </div>
  );
}
