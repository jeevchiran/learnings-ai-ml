// rehype-katex renders math to HTML during MDX compilation.
// These components are only needed for programmatic use in JSX,
// not for MDX $...$ / $$...$$ syntax (which rehype-katex handles directly).
import 'katex/dist/katex.min.css'
import katex from 'katex'

export function InlineMath({ math }) {
  const html = katex.renderToString(math, { throwOnError: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export function BlockMath({ math }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false })
  return <div className="lc-math-block" dangerouslySetInnerHTML={{ __html: html }} />
}
