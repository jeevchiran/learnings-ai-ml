import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import QuizCard from '../components/learning/QuizCard.jsx'

const props = {
  question: 'What does .shape return?',
  options: ['A list of column names', 'A tuple (rows, cols)', 'The data types', 'A summary table'],
  correct: 1,
}

describe('QuizCard', () => {
  it('shows question and options, hides result initially', () => {
    render(<QuizCard {...props} />)
    expect(screen.getByText(props.question)).toBeInTheDocument()
    expect(screen.getByText('A tuple (rows, cols)')).toBeInTheDocument()
    expect(screen.queryByText('Correct!')).not.toBeInTheDocument()
  })

  it('shows Correct! when right option clicked', () => {
    render(<QuizCard {...props} />)
    fireEvent.click(screen.getByText('A tuple (rows, cols)'))
    expect(screen.getByText('Correct!')).toBeInTheDocument()
  })

  it('shows Try again when wrong option clicked', () => {
    render(<QuizCard {...props} />)
    fireEvent.click(screen.getByText('A list of column names'))
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('locks options after correct answer', () => {
    render(<QuizCard {...props} />)
    fireEvent.click(screen.getByText('A tuple (rows, cols)'))
    // clicking another option after correct does not change result
    fireEvent.click(screen.getByText('The data types'))
    expect(screen.getByText('Correct!')).toBeInTheDocument()
  })
})
