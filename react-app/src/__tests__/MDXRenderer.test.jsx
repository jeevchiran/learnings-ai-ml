import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('react-syntax-highlighter', () => ({ Prism: () => null }))
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({ oneLight: {}, oneDark: {} }))

const { default: MDXRenderer } = await import('../components/MDXRenderer.jsx')
// cv-m16 is the widest markdown table in a module that imports no widget at all.
// Three things disqualify an otherwise-wider module as a fixture: a table inside
// <PredictReveal> is absent from the DOM until a reader answers the gate, a
// widget's own <table> is styled by the widget rather than by the component map,
// and a widget pulling in a charting library fails to load under jsdom.
const { default: Content } = await import('../content/computer-vision/cv-m16.mdx')

describe('MDX table overflow', () => {
  it('wraps every table in a scroll container', () => {
    const { container } = render(<MDXRenderer Content={Content} />)

    const tables = container.querySelectorAll('table')
    expect(tables.length).toBeGreaterThan(0)

    // Every table must sit directly inside a .table-scroll wrapper.
    tables.forEach(t => {
      expect(t.parentElement?.className).toContain('table-scroll')
    })
  })
})
