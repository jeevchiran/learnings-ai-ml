import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Plotly needs a real layout engine; jsdom has none. We only care that the
// widgets mount, wire up their controls, and call Plotly with sane arguments.
const react = vi.fn()
vi.mock('plotly.js-dist-min', () => ({ default: { react: (...a) => react(...a), newPlot: vi.fn() } }))

const { default: FunnelWidget }           = await import('../components/widgets/recsys/FunnelWidget.jsx')
const { default: SignalWeightWidget }     = await import('../components/widgets/recsys/SignalWeightWidget.jsx')
const { default: EventContractWidget }    = await import('../components/widgets/recsys/EventContractWidget.jsx')
const { default: RankingMetricsWidget }   = await import('../components/widgets/recsys/RankingMetricsWidget.jsx')
const { default: SplitLeakageWidget }     = await import('../components/widgets/recsys/SplitLeakageWidget.jsx')
const { default: BaselineCompareWidget }  = await import('../components/widgets/recsys/BaselineCompareWidget.jsx')
const { default: CFSimilarityWidget }     = await import('../components/widgets/recsys/CFSimilarityWidget.jsx')
const { default: ALSFactorWidget }        = await import('../components/widgets/recsys/ALSFactorWidget.jsx')
const { default: LTRLossWidget }          = await import('../components/widgets/recsys/LTRLossWidget.jsx')
const { default: FeatureWindowWidget }    = await import('../components/widgets/recsys/FeatureWindowWidget.jsx')
const { default: NegativeSamplingWidget } = await import('../components/widgets/recsys/NegativeSamplingWidget.jsx')
const { default: MultiModalWidget }       = await import('../components/widgets/recsys/MultiModalWidget.jsx')

const ALL = [
  ['FunnelWidget', FunnelWidget],
  ['SignalWeightWidget', SignalWeightWidget],
  ['EventContractWidget', EventContractWidget],
  ['RankingMetricsWidget', RankingMetricsWidget],
  ['SplitLeakageWidget', SplitLeakageWidget],
  ['BaselineCompareWidget', BaselineCompareWidget],
  ['CFSimilarityWidget', CFSimilarityWidget],
  ['ALSFactorWidget', ALSFactorWidget],
  ['LTRLossWidget', LTRLossWidget],
  ['FeatureWindowWidget', FeatureWindowWidget],
  ['NegativeSamplingWidget', NegativeSamplingWidget],
  ['MultiModalWidget', MultiModalWidget],
]

describe('recsys widgets mount', () => {
  for (const [name, W] of ALL) {
    it(`${name} renders without throwing`, () => {
      const { container } = render(<W />)
      expect(container.firstChild).not.toBeNull()
    })
  }
})

describe('recsys widgets respond to input', () => {
  it('RankingMetricsWidget recomputes when k changes', () => {
    const { container } = render(<RankingMetricsWidget />)
    expect(screen.getByText('Precision@3')).toBeTruthy()
    fireEvent.change(container.querySelector('input[type="range"]'), { target: { value: '5' } })
    expect(screen.getByText('Precision@5')).toBeTruthy()
  })

  it('SplitLeakageWidget reports zero leaks for the temporal split and some for random', () => {
    render(<SplitLeakageWidget />)
    expect(screen.getByText(/0 leaked training events/)).toBeTruthy()
    fireEvent.click(screen.getByText('Random'))
    expect(screen.getByText(/training events sit at or after/)).toBeTruthy()
  })

  it('LTRLossWidget leaves pairwise/listwise loss unchanged under a global score shift', () => {
    const { container } = render(<LTRLossWidget />)
    const read = () => [...container.querySelectorAll('span')]
      .map(s => s.textContent).filter(t => /^\d\.\d{4}$/.test(t))
    const before = read()
    const sliders = container.querySelectorAll('input[type="range"]')
    fireEvent.change(sliders[sliders.length - 1], { target: { value: '2' } })   // the shift slider
    const after = read()
    expect(before).toHaveLength(3)
    expect(after[0]).not.toBe(before[0])   // pointwise moves
    expect(after[1]).toBe(before[1])       // pairwise does not
    expect(after[2]).toBe(before[2])       // listwise does not
  })

  it('ALSFactorWidget hands Plotly finite coordinates', () => {
    react.mockClear()
    render(<ALSFactorWidget />)
    expect(react).toHaveBeenCalled()
    const traces = react.mock.calls[0][1]
    for (const t of traces) {
      for (const v of [...t.x, ...t.y]) expect(Number.isFinite(v)).toBe(true)
    }
  })

  it('NegativeSamplingWidget zeroes the not-yet-listed item under time-aware sampling', () => {
    const { container } = render(<NegativeSamplingWidget />)
    const pctFor = name => {
      const row = [...container.querySelectorAll('div')]
        .find(d => d.children.length >= 3 && d.firstChild?.textContent?.startsWith(name))
      return row?.lastChild?.textContent
    }
    fireEvent.click(screen.getByText('Uniform'))
    expect(pctFor('ANC Headphones')).toBe('11.1%')     // random gives a future item mass

    fireEvent.click(screen.getByText('Time-aware'))
    const asOf = [...container.querySelectorAll('input[type="range"]')].at(-1)
    fireEvent.change(asOf, { target: { value: '10' } })  // before P9 lists on day 22
    expect(pctFor('ANC Headphones ⏳')).toBe('0.0%')
    expect(screen.getByText(/8\/9/)).toBeTruthy()        // 8 of 9 products live
  })

  it('MultiModalWidget moves the cold item off the bottom when content weight is applied', () => {
    const { container } = render(<MultiModalWidget />)
    // P9 is marked with a star; it must be listed somewhere above last place at w=0.5
    expect(screen.getByText(/ANC Headphones ★/)).toBeTruthy()
    expect(container.textContent).toMatch(/rank \d/)
  })
})
