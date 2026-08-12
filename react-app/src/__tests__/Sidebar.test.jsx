import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Unrelated to what we're testing: this dep is CJS/ESM-broken under vitest.
vi.mock('react-syntax-highlighter', () => ({ Prism: () => null }))
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({ oneLight: {}, oneDark: {} }))

const { default: App } = await import('../App.jsx')

// Temporary verification of: (1) navigating to a module expands its track,
// (2) the sidebar can be hidden and brought back.
describe('sidebar', () => {
  beforeEach(() => { window.location.hash = ''; })

  it('expands the track containing the routed module (tl-m7 is in the LAST track)', () => {
    window.location.hash = '#/module/tl-m7'
    render(<App />)
    // The module only renders in the sidebar when its track is expanded.
    const items = screen.getAllByText('Upsampling')
    expect(items.length).toBeGreaterThan(0)
  })

  it('does NOT expand unrelated tracks', () => {
    window.location.hash = '#/module/ts-m5'
    render(<App />)
    // math-ml is courses[0]; its modules must stay hidden.
    expect(screen.queryByText('Vectors & Dot Products')).toBeNull()
  })

  it('hides the sidebar and offers a way back', () => {
    window.location.hash = '#/module/ts-m5'
    const { container } = render(<App />)

    expect(container.querySelector('.sidebar').className).not.toContain('collapsed')
    expect(container.querySelector('.sidebar-reopen')).toBeNull()

    fireEvent.click(screen.getByLabelText('Hide sidebar'))
    expect(container.querySelector('.sidebar').className).toContain('collapsed')

    const reopen = container.querySelector('.sidebar-reopen')
    expect(reopen).not.toBeNull()

    fireEvent.click(reopen)
    expect(container.querySelector('.sidebar').className).not.toContain('collapsed')
    expect(container.querySelector('.sidebar-reopen')).toBeNull()
  })
})
