import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('react-syntax-highlighter', () => ({ Prism: () => null }))
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({ oneLight: {}, oneDark: {} }))

const { default: MDXRenderer } = await import('../components/MDXRenderer.jsx')
// nlp-m8 holds the widest table in the content set (10 columns).
const { default: Content } = await import('../content/nlp/nlp-m8.mdx')

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
