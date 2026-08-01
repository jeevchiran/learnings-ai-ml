import { useState, useMemo } from 'react'
import {
  splitByTime, itemPopularity, negativeSamplingWeights, timeAwareSamplingWeights,
  listedBy, LISTED_DAY, ITEM_IDS, productName, itemItemSim, buildMatrix, binarize,
} from './recsysUtils.js'

const TRACK = '#65a30d'

const STRATEGY = {
  uniform: {
    name: 'Uniform',
    blurb: 'Every product equally likely. Easiest to implement and the worst signal: almost every negative is an obvious mismatch, so the model learns "is this even plausible?" and stops improving.',
  },
  popularity: {
    name: 'Popularity^β',
    blurb: 'Sample negatives in proportion to popularity raised to β. Popular items get shown to everyone, so they are the ones the model must learn to reject for the wrong shopper. β≈0.75 is the word2vec default and a solid starting point.',
  },
  timeaware: {
    name: 'Time-aware',
    blurb: 'Sample from the catalog as it stood at the positive\'s timestamp, using popularity from a trailing window rather than all-time. Fixes two leaks at once: items not yet listed get zero mass, and popularity is the popularity of that moment.',
  },
  hard: {
    name: 'Hard negatives',
    blurb: 'Items the current model already scores highly but the shopper did not take. The most informative and the most dangerous — many of them are false negatives (never shown, or shown and simply not noticed).',
  },
  inbatch: {
    name: 'In-batch',
    blurb: 'Reuse the other users\' positives in the same training batch as negatives. Free — no extra lookups — and implicitly popularity-weighted, which is why it needs a logQ correction in two-tower training.',
  },
}

/* Sampling distribution over the catalog under four strategies, with the
 * false-negative risk called out. Same event log as everywhere else. */
export default function NegativeSamplingWidget() {
  const [strategy, setStrategy] = useState('popularity')
  const [beta, setBeta] = useState(0.75)
  const [anchor, setAnchor] = useState('P1')
  const [asOf, setAsOf] = useState(24)

  const { train } = splitByTime()
  const pop = useMemo(() => itemPopularity(train), [])          // eslint-disable-line
  const S = useMemo(() => itemItemSim(binarize(buildMatrix(train))), [])  // eslint-disable-line

  const weights = useMemo(() => {
    if (strategy === 'uniform') return negativeSamplingWeights(train, 0)
    if (strategy === 'popularity') return negativeSamplingWeights(train, beta)
    if (strategy === 'inbatch') return negativeSamplingWeights(train, 1)
    if (strategy === 'timeaware') return timeAwareSamplingWeights(train, asOf, { beta, window: 14 })
    // hard: proportional to similarity with the anchor positive, excluding it
    const raw = {}
    let z = 0
    for (const id of ITEM_IDS) {
      const v = id === anchor ? 0 : Math.pow(Math.max(0, S[anchor][id]), 3)
      raw[id] = v; z += v
    }
    for (const id of ITEM_IDS) raw[id] = z === 0 ? 0 : raw[id] / z
    return raw
  }, [strategy, beta, anchor, asOf, S])          // eslint-disable-line

  // What all-time popularity sampling WOULD have given — the drift reference.
  const allTime = useMemo(() => negativeSamplingWeights(train, beta), [beta])   // eslint-disable-line
  const maxW = Math.max(...Object.values(weights), 1e-9)
  const nonzero = ITEM_IDS.filter(id => weights[id] > 1e-9).length
  const nLive = listedBy(asOf).length

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
        {Object.entries(STRATEGY).map(([k, s]) => (
          <button key={k} onClick={() => setStrategy(k)}
            style={{
              padding: '0.26rem 0.7rem', borderRadius: 6, fontSize: '0.79rem', cursor: 'pointer', fontFamily: 'inherit',
              border: `1px solid ${strategy === k ? TRACK : 'var(--border, #ccc)'}`,
              background: strategy === k ? TRACK : 'transparent', color: strategy === k ? '#fff' : 'var(--text)',
            }}>{s.name}</button>
        ))}
      </div>

      {(strategy === 'popularity' || strategy === 'timeaware') && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.83rem', marginBottom: '0.5rem' }}>
          β
          <input type="range" min="0" max="2" step="0.05" value={beta} onChange={e => setBeta(+e.target.value)} />
          <strong>{beta.toFixed(2)}</strong>
          <span style={{ opacity: 0.65, fontSize: '0.78rem' }}>
            {beta < 0.1 ? '→ uniform' : beta > 1.4 ? '→ almost always the head' : ''}
          </span>
        </label>
      )}
      {strategy === 'timeaware' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.83rem', marginBottom: '0.5rem' }}>
          positive occurred on day
          <input type="range" min="4" max="30" step="1" value={asOf} onChange={e => setAsOf(+e.target.value)} />
          <strong>d{asOf}</strong>
          <span style={{ opacity: 0.65, fontSize: '0.78rem' }}>
            · {nLive}/{ITEM_IDS.length} products live · 14-day popularity window
          </span>
        </label>
      )}
      {strategy === 'hard' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.83rem', marginBottom: '0.5rem' }}>
          positive item
          <select value={anchor} onChange={e => setAnchor(e.target.value)} style={{ fontFamily: 'inherit', fontSize: '0.8rem' }}>
            {ITEM_IDS.map(id => <option key={id} value={id}>{productName(id)}</option>)}
          </select>
        </label>
      )}

      <div>
        {ITEM_IDS.map(id => {
          const unlisted = strategy === 'timeaware' && (LISTED_DAY[id] ?? 0) >= asOf
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 3, fontSize: '0.78rem', opacity: unlisted ? 0.45 : 1 }}>
              <span style={{ width: 108 }}>{productName(id)}{unlisted && ' ⏳'}</span>
              <span style={{ width: 22, textAlign: 'right', opacity: 0.55 }}>{pop[id]}u</span>
              <div style={{ flex: 1, height: 12, background: 'var(--bg-hover, #eee)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${(weights[id] / maxW) * 100}%`, height: '100%', background: TRACK, transition: 'width .15s' }} />
                {strategy === 'timeaware' && (
                  // where all-time popularity sampling would have put this item
                  <span title={`all-time popularity^β would give ${(allTime[id] * 100).toFixed(1)}%`}
                    style={{
                      position: 'absolute', left: `${Math.min(100, (allTime[id] / maxW) * 100)}%`, top: -1, bottom: -1,
                      width: 2, background: '#dc2626', transform: 'translateX(-1px)',
                    }} />
                )}
              </div>
              <span style={{ width: 46, textAlign: 'right', fontFamily: 'monospace' }}>{(weights[id] * 100).toFixed(1)}%</span>
            </div>
          )
        })}
      </div>
      <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.25rem' }}>
        “{pop.P8}u” = distinct shoppers who touched the item in training. Bar = chance of being drawn as a negative.
        {strategy === 'timeaware' && <> <span style={{ color: '#dc2626' }}>│</span> = where all-time popularity sampling would have put it. ⏳ = not listed yet.</>}
      </p>

      <p style={{ fontSize: '0.84rem', opacity: 0.85, marginTop: '0.6rem' }}>{STRATEGY[strategy].blurb}</p>

      <div style={{
        fontSize: '0.82rem', marginTop: '0.5rem', padding: '0.5rem 0.7rem', borderRadius: 6,
        border: '1px solid var(--border, #ccc)', lineHeight: 1.6,
      }}>
        {strategy === 'uniform' && <>P9 (ANC Headphones) has zero interactions yet still gets{' '}
          {(weights.P9 * 100).toFixed(1)}% of the negative mass. You are spending gradient budget teaching the
          model to reject a product nobody has ever been shown.</>}
        {strategy === 'popularity' && <>At β={beta.toFixed(2)}, the Steel Bottle draws{' '}
          {(weights.P8 * 100).toFixed(1)}% and the cold ANC Headphones draw {(weights.P9 * 100).toFixed(1)}%.
          Push β past 1 and you sample almost nothing but the head — the tail never learns a boundary.</>}
        {strategy === 'hard' && <>Only {nonzero} products have any mass: the ones genuinely confusable with{' '}
          {productName(anchor)}. Powerful, but if the shopper simply never <em>saw</em> the top one, you are
          training the model that a correct recommendation is wrong. Mine hard negatives from impressions,
          not from the catalog.</>}
        {strategy === 'inbatch' && <>Equivalent to β=1: the distribution is exactly item popularity, because
          popular items appear as someone's positive more often. That built-in bias is real and correctable —
          subtract log P(item) from the logits (the “logQ correction”).</>}
        {strategy === 'timeaware' && <>
          For a positive on day {asOf}, only <strong>{nLive} of {ITEM_IDS.length}</strong> products existed.
          {asOf <= 22
            ? <> ANC Headphones list on day 22, so every other strategy is quietly asking the model to reject
              a product that <em>did not exist yet</em> — a negative from the future.</>
            : <> ANC Headphones are live now and draw {(weights.P9 * 100).toFixed(1)}% from the smoothing floor
              alone, since nobody has touched them.</>}
          {' '}Compare each bar to its <span style={{ color: '#dc2626' }}>red mark</span>: that gap is{' '}
          <strong>popularity drift</strong>. All-time popularity gives Wireless Earbuds{' '}
          {(allTime.P1 * 100).toFixed(1)}%, but in the 14 days before day {asOf} they draw{' '}
          {(weights.P1 * 100).toFixed(1)}% — using the all-time number would leak what happened after day {asOf}.
        </>}
      </div>
    </div>
  )
}
