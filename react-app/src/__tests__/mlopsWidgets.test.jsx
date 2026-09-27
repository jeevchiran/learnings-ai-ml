import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DeliveryReplayWidget from '../components/widgets/mlops/DeliveryReplayWidget.jsx'

describe('stream delivery experiment', () => {
  it('demonstrates duplicate inflation, then prevents it with event-ID deduplication', () => {
    render(<DeliveryReplayWidget />)
    const deliver = screen.getByRole('button', { name: 'Deliver next message' })
    for (let i = 0; i < 4; i++) fireEvent.click(deliver)
    expect(screen.getByRole('status')).toHaveTextContent('Passenger total: 8')
    expect(deliver).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('status')).toHaveTextContent('Processed 0 of 4')
    for (let i = 0; i < 4; i++) fireEvent.click(deliver)
    expect(screen.getByRole('status')).toHaveTextContent('Passenger total: 6')
    expect(screen.getByText(/duplicate skipped/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reset deliveries' }))
    expect(screen.getByRole('status')).toHaveTextContent('Passenger total: 0')
    expect(deliver).toBeEnabled()
  })
})
