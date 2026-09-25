import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRef, useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import LessonOutline from '../components/learning/LessonOutline.jsx'
import PredictReveal from '../components/learning/PredictReveal.jsx'
import MultiSelectQuiz from '../components/learning/MultiSelectQuiz.jsx'
import LessonGuide from '../components/learning/LessonGuide.jsx'
import MissingValueWidget from '../components/widgets/pandas-eda/MissingValueWidget.jsx'
import BetaVAETunableWidget from '../components/widgets/vae/BetaVAETunableWidget.jsx'
import { learningGuides } from '../data/learningGuides.js'
import { courses, moduleById } from '../data/courses.js'
import { compile } from '@mdx-js/mdx'
import remarkVisuals from '../../scripts/remark-visuals.mjs'

describe('beginner learning controls', () => {
  it('updates the outline when explanations reveal sections and focuses the selected heading', async () => {
    function Lesson() {
      const ref = useRef(null)
      const [open, setOpen] = useState(false)
      return <div ref={ref}><LessonOutline contentRef={ref} /><h2>Start here</h2><button onClick={() => setOpen(true)}>Reveal section</button>{open && <h2>Worked solution</h2>}</div>
    }
    render(<Lesson />)
    fireEvent.click(screen.getByText('Lesson sections'))
    expect(await screen.findByRole('button', { name: 'Start here' })).toBeInTheDocument()
    fireEvent.click(screen.getByText('Reveal section'))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Worked solution' })).toBeInTheDocument())
    const heading = screen.getByRole('heading', { name: 'Worked solution' })
    heading.scrollIntoView = vi.fn()
    fireEvent.click(screen.getByRole('button', { name: 'Worked solution' }))
    expect(heading.scrollIntoView).toHaveBeenCalled()
    expect(heading).toHaveFocus()
  })
  it('uses the average of both central observations for median imputation', () => {
    render(<MissingValueWidget />)
    expect(screen.getAllByText('9')).toHaveLength(2)
    expect(screen.getByText(/median = 9\)/)).toBeInTheDocument()
  })
  it('shows the beta loss trade-off with actual arithmetic', () => {
    render(<BetaVAETunableWidget />)
    expect(screen.getByRole('status')).toHaveTextContent('B')
    fireEvent.change(screen.getByRole('slider'), { target: { value: '4' } })
    expect(screen.getByRole('status')).toHaveTextContent('A')
    expect(screen.getByText('104.0')).toBeInTheDocument()
    expect(screen.getByText('120.0')).toBeInTheDocument()
  })
  it('allows reading an explanation without submitting a guess', () => {
    render(<PredictReveal prompt="What happens?" options={['A', 'B']} correct={1}><p>A worked example</p></PredictReveal>)
    expect(screen.queryByText('A worked example')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show explanation' }))
    expect(screen.getByText('A worked example')).toBeInTheDocument()
    expect(screen.queryByText(/Not quite/)).not.toBeInTheDocument()
  })
  it('preserves prediction feedback when an answer is attempted', () => {
    render(<PredictReveal prompt="What happens?" options={['A', 'B']} correct={1}>Explanation</PredictReveal>)
    fireEvent.click(screen.getByRole('button', { name: 'A' }))
    expect(screen.getByRole('status')).toHaveTextContent('Not quite')
    expect(screen.getByText('Explanation')).toBeInTheDocument()
  })
  it('exposes multi-selection state and supports retrying', () => {
    render(<MultiSelectQuiz question="Choose" options={['A', 'B', 'C']} correct={[0, 2]} explanation="Both endpoints count." />)
    fireEvent.click(screen.getByRole('button', { name: /B/ }))
    expect(screen.getByRole('button', { name: /B/ })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByText('Check answers'))
    expect(screen.getByRole('status')).toHaveTextContent('Both endpoints count.')
    fireEvent.click(screen.getByText('Try again'))
    fireEvent.click(screen.getByRole('button', { name: /A/ }))
    fireEvent.click(screen.getByRole('button', { name: /C$/ }))
    fireEvent.click(screen.getByText('Check answers'))
    expect(screen.getByRole('status')).toHaveTextContent('Correct!')
  })
  it('has working prerequisite targets for all tracks', () => {
    for (const course of courses) {
      expect(learningGuides[course.id]).toBeDefined()
      for (const id of learningGuides[course.id].prerequisites) expect(moduleById[id], `${course.id}: ${id}`).toBeDefined()
    }
  })
  it('links a lesson refresher to prerequisite modules', () => {
    render(<MemoryRouter><LessonGuide mod={moduleById['trf-m1']} /></MemoryRouter>)
    expect(screen.getByRole('link', { name: moduleById['aed-m7'].title })).toHaveAttribute('href', '/module/aed-m7')
    expect(screen.getByLabelText('Small worked example')).toBeInTheDocument()
  })
  it('wraps nested widgets without wrapping ordinary prose', async () => {
    const output = String(await compile('<PredictReveal>\n\n<MyWidget />\n\n</PredictReveal>\n\nText', { remarkPlugins: [remarkVisuals] }))
    expect(output).toContain('lesson-visual')
    expect(output).toContain('My interactive example')
    expect(output.match(/lesson-visual/g)).toHaveLength(1)
  })
})
