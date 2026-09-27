import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { conceptConnections } from '../data/conceptConnections.js'
import { courses, moduleById } from '../data/courses.js'
import ConceptConnections from '../components/learning/ConceptConnections.jsx'
import LearningLoopWidget, { learningStep } from '../components/widgets/shared/LearningLoopWidget.jsx'
import AttentionMixWidget, { attentionMix } from '../components/widgets/shared/AttentionMixWidget.jsx'

describe('visual connections', () => {
  it('gives each published track an ordered path with valid lesson and transfer links', () => {
    expect(Object.keys(conceptConnections)).toHaveLength(25)
    for (const [id, map] of Object.entries(conceptConnections)) {
      const course = courses.find(c => c.id === id)
      const indices = map.stages.map(stage => course.modules.findIndex(m => m.id === stage.start))
      expect(indices[0]).toBe(0)
      expect(indices.every((n, i) => n >= 0 && (i === 0 || n > indices[i - 1]))).toBe(true)
      expect(moduleById[map.next]).toBeDefined()
      for (const mod of course.modules) expect(map.stages.some(s => moduleById[s.start].moduleNumber <= moduleById[mod.id].moduleNumber)).toBe(true)
    }
  })
  it('distinguishes the current lesson stage from a stage the learner explores', () => {
    render(<MemoryRouter><ConceptConnections mod={moduleById['math-m10']} /></MemoryRouter>)
    fireEvent.click(screen.getByText(/Connect the ideas/))
    const current = screen.getByRole('button', { name: /Learn from error/ })
    expect(current).toHaveAttribute('aria-current', 'step')
    fireEvent.click(screen.getByRole('button', { name: /Describe uncertainty/ }))
    expect(current).toHaveAttribute('aria-current', 'step')
    expect(current).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('link', { name: "Probability Foundations & Bayes' Theorem" })).toHaveAttribute('href', '/module/math-m5')
    expect(screen.queryByRole('link', { name: 'Gradient Descent' })).not.toBeInTheDocument()
  })
  it('matches a hand-calculated prediction, gradient and update', () => {
    const r = learningStep(1, 0.1)
    expect(r.prediction).toBe(2)
    expect(r.loss).toBe(8)
    expect(r.gradient).toBe(-8)
    expect(r.nextWeight).toBeCloseTo(1.8)
    expect(r.nextLoss).toBeCloseTo(2.88)
    expect(learningStep(1, 0.5).nextLoss).toBe(8)
    expect(learningStep(1, 0.8).nextLoss).toBeCloseTo(38.72)
    expect(learningStep(3, 0.8).nextWeight).toBe(3)
  })
  it('shows why a larger update can increase loss', () => {
    render(<MemoryRouter><LearningLoopWidget /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Update the weight' }))
    expect(screen.getByText('decreased')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '0.8' } })
    expect(screen.getByText('increased')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName(/weight 7.4, loss 38.72/)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '3' } })
    expect(screen.getByText('stayed the same')).toBeInTheDocument()
  })
  it('normalizes allowed attention weights and excludes masked values completely', () => {
    for (const score of [-4, 0, 4]) {
      const r = attentionMix(score, false)
      expect(r.weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
      expect(r.context).toBeGreaterThanOrEqual(2)
      expect(r.context).toBeLessThanOrEqual(10)
    }
    expect(attentionMix(-4, true)).toEqual(attentionMix(4, true))
    expect(attentionMix(4, true).weights[2]).toBe(0)
    expect(attentionMix(4, true).context).toBeCloseTo((2 + 6 * Math.E) / (1 + Math.E))
  })
  it('updates the attention diagram and renormalizes when the future is hidden', () => {
    render(<MemoryRouter><AttentionMixWidget /></MemoryRouter>)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('slider')).toBeDisabled()
    expect(screen.getByRole('img', { name: 'bird attention weight 0.0 percent' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('4.924')
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.change(screen.getByRole('slider'), { target: { value: '4' } })
    expect(screen.getByRole('img', { name: 'bird attention weight 93.6 percent' })).toBeInTheDocument()
  })
})
