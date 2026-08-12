import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import TransferabilityWidget from '../components/widgets/transfer-learning/TransferabilityWidget.jsx'
import FreezeStrategyWidget from '../components/widgets/transfer-learning/FreezeStrategyWidget.jsx'
import BackboneCompareWidget from '../components/widgets/transfer-learning/BackboneCompareWidget.jsx'
import EmbeddingSpaceWidget from '../components/widgets/transfer-learning/EmbeddingSpaceWidget.jsx'
import TripletLossWidget from '../components/widgets/transfer-learning/TripletLossWidget.jsx'
import EncoderDecoderWidget from '../components/widgets/transfer-learning/EncoderDecoderWidget.jsx'
import UpsamplingWidget from '../components/widgets/transfer-learning/UpsamplingWidget.jsx'
import TransposedConvWidget from '../components/widgets/transfer-learning/TransposedConvWidget.jsx'
import ConvArithmeticWidget from '../components/widgets/transfer-learning/ConvArithmeticWidget.jsx'
import SkipConnectionWidget from '../components/widgets/transfer-learning/SkipConnectionWidget.jsx'
import UNetWidget from '../components/widgets/transfer-learning/UNetWidget.jsx'
import DiceWidget from '../components/widgets/transfer-learning/DiceWidget.jsx'
import SegLossWidget from '../components/widgets/transfer-learning/SegLossWidget.jsx'

const WIDGETS = [
  ['Transferability', TransferabilityWidget],
  ['FreezeStrategy', FreezeStrategyWidget],
  ['BackboneCompare', BackboneCompareWidget],
  ['EmbeddingSpace', EmbeddingSpaceWidget],
  ['TripletLoss', TripletLossWidget],
  ['EncoderDecoder', EncoderDecoderWidget],
  ['Upsampling', UpsamplingWidget],
  ['TransposedConv', TransposedConvWidget],
  ['ConvArithmetic', ConvArithmeticWidget],
  ['SkipConnection', SkipConnectionWidget],
  ['UNet', UNetWidget],
  ['Dice', DiceWidget],
  ['SegLoss', SegLossWidget],
]

describe('transfer-learning widgets', () => {
  it.each(WIDGETS)('%s mounts without throwing', (_name, Widget) => {
    const { container } = render(<Widget />)
    expect(container.firstChild).not.toBeNull()
  })

  it('every slider moves to both extremes without crashing', () => {
    for (const [, Widget] of WIDGETS) {
      const { container, unmount } = render(<Widget />)
      for (const input of container.querySelectorAll('input[type="range"]')) {
        fireEvent.change(input, { target: { value: input.max } })
        fireEvent.change(input, { target: { value: input.min } })
      }
      unmount()
    }
  })

  it('every select switches through all its options without crashing', () => {
    for (const [, Widget] of WIDGETS) {
      const { container, unmount } = render(<Widget />)
      for (const sel of container.querySelectorAll('select')) {
        for (const opt of sel.querySelectorAll('option')) {
          fireEvent.change(sel, { target: { value: opt.value } })
        }
      }
      unmount()
    }
  })

  it('every checkbox toggles without crashing', () => {
    for (const [, Widget] of WIDGETS) {
      const { container, unmount } = render(<Widget />)
      for (const cb of container.querySelectorAll('input[type="checkbox"]')) {
        fireEvent.click(cb); fireEvent.click(cb)
      }
      unmount()
    }
  })

  it('U-Net widget shows the paper\'s parameter count and 572→388 shapes', () => {
    const { container } = render(<UNetWidget />)
    expect(container.textContent).toContain('31,030,658')
    expect(container.textContent).toContain('572² → 388²')
  })

  it('transposed-conv widget flags checkerboarding only when k is not divisible by s', () => {
    const { container } = render(<TransposedConvWidget />)
    // defaults are k=3, s=2 → uneven interior
    expect(container.textContent).toMatch(/checkerboard risk = yes/)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ones 2×2' } })
    expect(container.textContent).toMatch(/checkerboard risk = no/)
  })

  it('Dice widget reports Dice above IoU and the 2J/(1+J) identity', () => {
    const { container } = render(<DiceWidget />)
    expect(container.textContent).toContain('Dice = 2·IoU / (1 + IoU)')
    fireEvent.click(screen.getByText('perfect'))
    expect(container.textContent).toContain('1.0000')
  })

  it('Dice widget scores a disjoint prediction as exactly zero', () => {
    const { container } = render(<DiceWidget />)
    // getByText would also match the word "miss" inside the caption
    fireEvent.click(screen.getByRole('button', { name: 'miss' }))
    expect(container.textContent).toMatch(/Dice = 0\.0000/)
    expect(container.textContent).toMatch(/IoU = 0\.0000/)
  })

  it('triplet widget shows zero loss for the easy preset', () => {
    const { container } = render(<TripletLossWidget />)
    fireEvent.click(screen.getByText('easy (loss 0)'))
    expect(container.textContent).toMatch(/no gradient/)
  })

  it('freeze widget reports a higher frozen percentage as the cut moves deeper', () => {
    const { container } = render(<FreezeStrategyWidget />)
    const sliders = container.querySelectorAll('input[type="range"]')
    fireEvent.change(sliders[0], { target: { value: '0' } })
    expect(container.textContent).toMatch(/frozen = 0\.0M \(0%\)/)
    fireEvent.change(sliders[0], { target: { value: '5' } })
    expect(container.textContent).toMatch(/feature extraction/)
  })
})
