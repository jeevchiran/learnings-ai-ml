import { useState } from 'react'

const WN_DATA = {
  dog: [
    {
      name: 'dog.n.01',
      gloss: 'a domestic animal of the genus Canis; it has been domesticated since prehistoric times',
      hyperChain: ['canine.n.02', 'carnivore.n.01', 'placental.n.01', 'mammal.n.01', 'animal.n.01', 'organism.n.01', 'living_thing.n.01', 'entity.n.01'],
      hyponyms: ['poodle.n.01', 'dalmatian.n.02', 'labrador.n.01', 'german_shepherd.n.01', 'bulldog.n.01'],
    },
    {
      name: 'dog.n.02',
      gloss: 'someone who is morally reprehensible',
      hyperChain: ['villain.n.01', 'bad_person.n.01', 'person.n.01', 'organism.n.01', 'living_thing.n.01', 'entity.n.01'],
      hyponyms: [],
    },
  ],
  car: [
    {
      name: 'car.n.01',
      gloss: 'a motor vehicle with four wheels; usually propelled by an internal combustion engine',
      hyperChain: ['motor_vehicle.n.01', 'wheeled_vehicle.n.01', 'vehicle.n.01', 'conveyance.n.03', 'artifact.n.01', 'entity.n.01'],
      hyponyms: ['ambulance.n.01', 'cab.n.03', 'coupe.n.01', 'sedan.n.01'],
    },
    {
      name: 'car.n.02',
      gloss: 'a wheeled vehicle adapted for movement on a rail track',
      hyperChain: ['wheeled_vehicle.n.01', 'vehicle.n.01', 'conveyance.n.03', 'artifact.n.01', 'entity.n.01'],
      hyponyms: ['baggage_car.n.01', 'freight_car.n.01', 'passenger_car.n.01'],
    },
  ],
  bank: [
    {
      name: 'bank.n.01',
      gloss: 'a financial institution that accepts deposits and channels the money into lending activities',
      hyperChain: ['financial_institution.n.01', 'institution.n.01', 'organization.n.01', 'social_group.n.01', 'group.n.01', 'entity.n.01'],
      hyponyms: ['central_bank.n.01', 'credit_union.n.01', 'savings_bank.n.01'],
    },
    {
      name: 'bank.n.09',
      gloss: 'sloping land (especially the slope beside a body of water)',
      hyperChain: ['slope.n.01', 'geological_formation.n.01', 'natural_object.n.01', 'object.n.01', 'entity.n.01'],
      hyponyms: ['riverside.n.01', 'waterside.n.01'],
    },
    {
      name: 'bank.n.03',
      gloss: 'a supply or stock held in reserve especially for future use',
      hyperChain: ['store.n.02', 'accumulation.n.01', 'group.n.01', 'entity.n.01'],
      hyponyms: ['blood_bank.n.01', 'seed_bank.n.01'],
    },
  ],
  tree: [
    {
      name: 'tree.n.01',
      gloss: 'a tall perennial woody plant having a main trunk and branches forming a distinct elevated crown',
      hyperChain: ['woody_plant.n.01', 'vascular_plant.n.01', 'plant.n.02', 'organism.n.01', 'living_thing.n.01', 'entity.n.01'],
      hyponyms: ['oak.n.01', 'maple.n.01', 'pine.n.01', 'birch.n.01'],
    },
    {
      name: 'tree.n.03',
      gloss: 'a figure that branches from a single root; used to represent hierarchical organizations',
      hyperChain: ['figure.n.02', 'visual_communication.n.01', 'communication.n.02', 'entity.n.01'],
      hyponyms: ['decision_tree.n.01'],
    },
  ],
  run: [
    {
      name: 'run.v.01',
      gloss: 'move fast by using one\'s feet, with one foot off the ground at any given time',
      hyperChain: ['travel_rapidly.v.01', 'move.v.02', 'entity.n.01'],
      hyponyms: ['jog.v.05', 'sprint.v.01', 'trot.v.01'],
    },
    {
      name: 'run.v.06',
      gloss: 'have and exercise direction or control',
      hyperChain: ['control.v.01', 'be.v.01', 'entity.n.01'],
      hyponyms: ['administer.v.01', 'oversee.v.01'],
    },
  ],
}

const LESK_SENTENCE = 'He went to the bank to deposit his salary.'
const LESK_CONTEXT = ['went', 'deposit', 'salary']
const LESK_SYNSETS = [
  { name: 'bank.n.01', gloss: 'a financial institution that accepts deposits and channels the money into lending activities', overlap: 1, overlapWords: ['deposit'] },
  { name: 'bank.n.09', gloss: 'sloping land (especially the slope beside a body of water)', overlap: 0, overlapWords: [] },
  { name: 'bank.n.03', gloss: 'a supply or stock held in reserve especially for future use', overlap: 0, overlapWords: [] },
  { name: 'bank.n.07', gloss: 'a long ridge or pile, as of snow or earth', overlap: 0, overlapWords: [] },
]

const tblStyle = { borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }
const thStyle = { border: '1px solid var(--border,#d1d5db)', padding: '0.4rem 0.6rem', background: 'rgba(37,99,235,0.06)', textAlign: 'left' }
const tdStyle = { border: '1px solid var(--border,#d1d5db)', padding: '0.4rem 0.6rem' }

function CandidateTable({ showScores }) {
  return (
    <table style={{ ...tblStyle, marginTop: '0.5rem' }}>
      <thead>
        <tr>
          <th style={{ ...thStyle, width: '20%' }}>Synset</th>
          <th style={thStyle}>Gloss</th>
          <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>Score</th>
        </tr>
      </thead>
      <tbody>
        {LESK_SYNSETS.map((s, i) => {
          const isWinner = showScores && s.overlap > 0
          const rowStyle = (showScores && i === 0) ? { background: 'rgba(22,163,74,0.08)', borderLeft: '3px solid var(--success,#16a34a)' } : {}
          const glossEl = showScores
            ? s.gloss.replace('deposits', '<strong style="color:var(--success,#16a34a)">deposits</strong>')
            : s.gloss
          return (
            <tr key={s.name} style={rowStyle}>
              <td style={{ ...tdStyle, fontFamily: 'var(--font-mono,monospace)', fontSize: '0.8rem', verticalAlign: 'top' }}>{s.name}</td>
              <td style={{ ...tdStyle, verticalAlign: 'top' }} dangerouslySetInnerHTML={{ __html: showScores ? glossEl : s.gloss }} />
              <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'var(--font-mono,monospace)', fontWeight: 700, color: s.overlap > 0 ? 'var(--success,#16a34a)' : 'var(--text-muted,#6b7280)', verticalAlign: 'top' }}>
                {showScores ? s.overlap : '?'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const LESK_STEPS = [
  {
    title: 'Context',
    explain: 'The sentence contains the ambiguous word "bank". Task: determine which sense is intended.',
    render: () => (
      <div style={{ fontSize: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary,#f9fafb)', border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', lineHeight: '1.8' }}>
        {LESK_SENTENCE.split('bank').map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <span style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid var(--accent-blue,#2563eb)', borderRadius: '3px', padding: '0.05rem 0.3rem', fontWeight: 700, color: 'var(--accent-blue,#2563eb)' }}>bank</span>
            )}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: 'Step 1 — Extract Context Words',
    explain: 'Remove stopwords (he, to, the, his) and punctuation. Context set: {went, deposit, salary}.',
    render: () => {
      const stopwords = ['he', 'to', 'the', 'his']
      const allWords = LESK_SENTENCE.replace('.', '').split(' ')
      return (
        <div style={{ fontSize: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary,#f9fafb)', border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', lineHeight: '2.4', flexWrap: 'wrap' }}>
          {allWords.map((w, i) => {
            const lower = w.toLowerCase()
            if (lower === 'bank') return <span key={i} style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid var(--accent-blue,#2563eb)', borderRadius: '3px', padding: '0.1rem 0.4rem', margin: '0 3px', fontWeight: 700, color: 'var(--accent-blue,#2563eb)' }}>{w}</span>
            if (stopwords.includes(lower)) return <span key={i} style={{ textDecoration: 'line-through', opacity: 0.4, margin: '0 3px', color: 'var(--text-muted,#6b7280)' }}>{w}</span>
            return <span key={i} style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '3px', padding: '0.1rem 0.4rem', margin: '0 3px', color: 'var(--success,#16a34a)', fontWeight: 600 }}>{w}</span>
          })}
          <div style={{ marginTop: '0.6rem', fontSize: '0.88rem', color: 'var(--text-muted,#6b7280)' }}>
            Context set: <strong style={{ fontFamily: 'var(--font-mono,monospace)', color: 'var(--text,#111)' }}>{'{went, deposit, salary}'}</strong>
          </div>
        </div>
      )
    },
  },
  {
    title: 'Step 2 — Candidate Synsets',
    explain: 'Retrieve candidate synsets for "bank" (noun) from WordNet.',
    render: () => <CandidateTable showScores={false} />,
  },
  {
    title: 'Step 3 — Compute Overlap',
    explain: 'Count how many context words appear in each gloss (with stemming).',
    render: () => <CandidateTable showScores={false} />,
  },
  {
    title: 'Step 4 — Overlap Scores',
    explain: 'bank.n.01 gloss contains "deposits" — matches context word "deposit" (stemmed). Score = 1. All others score 0.',
    render: () => <CandidateTable showScores={true} />,
  },
  {
    title: 'Step 5 — argmax',
    explain: 'Select bank.n.01 with score 1. Lesk correctly disambiguates: financial institution.',
    render: () => (
      <>
        <CandidateTable showScores={true} />
        <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(22,163,74,0.1)', border: '1px solid var(--success,#16a34a)', borderRadius: '6px' }}>
          <strong style={{ color: 'var(--success,#16a34a)' }}>Selected: bank.n.01</strong><br />
          <span style={{ color: 'var(--text-muted,#6b7280)', fontSize: '0.85rem' }}>"a financial institution that accepts deposits and channels the money into lending activities"</span>
        </div>
      </>
    ),
  },
]

export default function WordNetWidget() {
  const [word, setWord] = useState('dog')
  const [synsetIdx, setSynsetIdx] = useState(0)
  const [leskStep, setLeskStep] = useState(0)

  const synsets = WN_DATA[word] || []
  const syn = synsets[synsetIdx] || synsets[0]
  const chain = syn ? [...syn.hyperChain].reverse() : []

  function handleWordChange(w) {
    setWord(w)
    setSynsetIdx(0)
  }

  const leskCurrent = LESK_STEPS[leskStep]

  return (
    <div style={{ fontFamily: 'var(--font-sans,sans-serif)', fontSize: '0.9rem' }}>
      {/* WordNet Explorer */}
      <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.95rem' }}>WordNet Hierarchy Explorer</h4>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted,#6b7280)', textTransform: 'uppercase' }}>Word</span>
          <select value={word} onChange={e => handleWordChange(e.target.value)} style={selectStyle}>
            {Object.keys(WN_DATA).map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted,#6b7280)', textTransform: 'uppercase' }}>Synset</span>
          <select value={synsetIdx} onChange={e => setSynsetIdx(parseInt(e.target.value))} style={selectStyle}>
            {synsets.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
          </select>
        </label>
      </div>

      {syn && (
        <div style={{ border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', padding: '0.75rem 1rem', background: 'var(--bg-secondary,#f9fafb)' }}>
          <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(37,99,235,0.06)', border: '1px solid var(--border,#d1d5db)', borderRadius: '4px', fontSize: '0.85rem' }}>
            <strong>{syn.name}</strong> — {syn.gloss}
          </div>

          <div style={{ marginBottom: '0.5rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted,#6b7280)' }}>Hypernym chain (root → synset)</div>
          {chain.map((h, i) => (
            <div key={h} style={{ marginLeft: `${i * 1.1}rem`, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '3px', fontSize: '0.8rem', fontFamily: 'var(--font-mono,monospace)', color: '#1d4ed8' }}>{h}</span>
              {i < chain.length - 1 && <span style={{ color: 'var(--text-muted,#6b7280)', fontSize: '0.8rem' }}>↓</span>}
            </div>
          ))}
          <div style={{ marginLeft: `${chain.length * 1.1}rem`, marginBottom: '0.5rem' }}>
            <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', background: 'rgba(37,99,235,0.2)', border: '2px solid var(--accent-blue,#2563eb)', borderRadius: '3px', fontSize: '0.8rem', fontFamily: 'var(--font-mono,monospace)', color: '#1d4ed8', fontWeight: 700 }}>{syn.name}</span>
          </div>

          {syn.hyponyms.length > 0 && (
            <>
              <div style={{ marginTop: '0.5rem', marginBottom: '0.3rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted,#6b7280)' }}>Direct hyponyms</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginLeft: '1rem' }}>
                {syn.hyponyms.map(h => (
                  <span key={h} style={{ display: 'inline-block', padding: '0.15rem 0.5rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '3px', fontSize: '0.8rem', fontFamily: 'var(--font-mono,monospace)', color: '#15803d' }}>{h}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Lesk Step-Through */}
      <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--border,#d1d5db)' }} />
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>Lesk Algorithm Step-Through</h4>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted,#6b7280)' }}>
        Sentence: <em>{LESK_SENTENCE}</em>
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <strong style={{ fontSize: '0.9rem', color: 'var(--accent-blue,#2563eb)' }}>{leskCurrent.title}</strong>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted,#6b7280)' }}>Step {leskStep + 1} / {LESK_STEPS.length}</span>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: 'var(--bg-secondary,#f9fafb)', border: '1px solid var(--border,#d1d5db)', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-muted,#6b7280)' }}>
        {leskCurrent.explain}
      </div>

      <div style={{ overflowX: 'auto', minHeight: '4rem' }}>
        {leskCurrent.render()}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button onClick={() => setLeskStep(s => Math.max(0, s - 1))} disabled={leskStep === 0} style={btnStyle}>← Prev</button>
        <button onClick={() => setLeskStep(s => Math.min(LESK_STEPS.length - 1, s + 1))} disabled={leskStep === LESK_STEPS.length - 1} style={btnStyle}>Next →</button>
        <button onClick={() => setLeskStep(0)} style={{ ...btnStyle, marginLeft: 'auto', background: 'var(--bg-secondary,#f3f4f6)', color: 'var(--text,#111)' }}>Reset</button>
      </div>
    </div>
  )
}

const selectStyle = {
  padding: '0.35rem 0.6rem',
  border: '1px solid var(--border,#d1d5db)',
  borderRadius: '4px',
  background: 'var(--bg-secondary,#f9fafb)',
  color: 'var(--text,#111)',
  fontSize: '0.85rem',
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
