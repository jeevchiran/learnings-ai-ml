import { useState } from 'react'
import { Row, Btn, Accent, Readout } from '../shared/ui.jsx'

const COLOR = '#06b6d4'

/* Three tiny documents is enough to make the inverse document frequency term
 * legible: a word in every document scores zero however often it appears. */

const DOCS = [
  ['the', 'cat', 'sat', 'on', 'the', 'mat'],
  ['the', 'cat', 'chased', 'the', 'dog'],
  ['the', 'dog', 'slept'],
]
const VOCAB = [...new Set(DOCS.flat())].sort()

function tf(word, doc) {
  return doc.filter(w => w === word).length / doc.length
}
function df(word) {
  return DOCS.filter(d => d.includes(word)).length
}
function idf(word) {
  return Math.log(DOCS.length / df(word))
}

export default function TfIdfWidget() {
  const [word, setWord] = useState('cat')
  const scores = DOCS.map(d => tf(word, d) * idf(word))
  const max = Math.max(0.001, ...DOCS.flatMap(d => VOCAB.map(w => tf(w, d) * idf(w))))
  const everywhere = df(word) === DOCS.length

  return (
    <Accent value={COLOR}>
      <div>
        <Row style={{ marginBottom: '0.6rem' }}>
          {VOCAB.map(w => <Btn key={w} onClick={() => setWord(w)} primary={word === w}>{w}</Btn>)}
        </Row>

        {DOCS.map((d, i) => (
          <div key={i} style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.76rem', marginBottom: 2 }}>
              doc {i + 1}:{' '}
              {d.map((w, j) => (
                <span key={j} style={{
                  color: w === word ? COLOR : 'var(--text-muted)',
                  fontWeight: w === word ? 700 : 400,
                }}>{w} </span>
              ))}
            </div>
            <div style={{ height: 10, background: 'var(--bg-hover)', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${(scores[i] / max) * 100}%`, height: '100%', background: COLOR, transition: 'width .2s' }} />
            </div>
          </div>
        ))}

        <Readout items={[
          ['appears in', `${df(word)} of ${DOCS.length} docs`],
          ['idf', idf(word).toFixed(3)],
        ]} />

        <p style={{ fontSize: '0.78rem', color: everywhere ? COLOR : 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          {everywhere
            ? 'This word appears in every document, so its inverse document frequency is exactly zero and every bar collapses — however often it occurs. A term that is everywhere cannot tell one document from another, and the weighting removes it without any hand-written stop-word list.'
            : 'The bars show how strongly this word characterises each document. Words concentrated in few documents keep a high weight; the more documents a word spreads across, the lower its weight falls, regardless of raw count.'}
        </p>
      </div>
    </Accent>
  )
}
