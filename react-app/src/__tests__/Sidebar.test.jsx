import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'

// Unrelated to what we're testing: this dep is CJS/ESM-broken under vitest.
vi.mock('react-syntax-highlighter', () => ({ Prism: () => null }))
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({ oneLight: {}, oneDark: {} }))

const { default: App } = await import('../App.jsx')

describe('sidebar', () => {
  beforeEach(() => { window.location.hash = ''; })

  it('groups the advanced tracks on the dashboard and in course navigation', () => {
    render(<App />)
    const navigation = screen.getByRole('navigation', { name: 'Course navigation' })
    const sidebarTopic = within(navigation).getByRole('region', { name: 'Advanced Deep Learning' })
    const dashboardTopic = within(screen.getByRole('main')).getByRole('region', { name: 'Advanced Deep Learning' })
    for (const name of [/Convolutional Neural Networks/, /Transformers/, /Variational Autoencoders/, /Generative Adversarial Networks/, /Diffusion Models/]) {
      expect(within(sidebarTopic).getByRole('button', { name })).toBeInTheDocument()
      expect(within(dashboardTopic).getByRole('link', { name })).toBeInTheDocument()
    }
  })

  it('expands the track containing the routed module', () => {
    window.location.hash = '#/module/tl-m7'
    render(<App />)
    // The module only renders in the sidebar when its track is expanded.
    const items = screen.getAllByText('Upsampling')
    expect(items.length).toBeGreaterThan(0)
  })

  it('does NOT expand unrelated tracks', () => {
    window.location.hash = '#/module/ts-m5'
    render(<App />)
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
