import { MDXProvider } from '@mdx-js/react'
import {
  ConceptBox, Bridge,
  DerivationSteps, DerivationStep,
  CodeBlock, InlineMath, BlockMath,
  QuizCard, MultiSelectQuiz,
} from './learning/index.js'

// Map MDX element names to React components.
// `pre > code` blocks from MDX come through as <code className="language-*">.
const components = {
  ConceptBox,
  Bridge,
  DerivationSteps,
  DerivationStep,
  CodeBlock,
  InlineMath,
  BlockMath,
  QuizCard,
  MultiSelectQuiz,
  // Override <code> inside <pre> to use CodeBlock
  pre: ({ children }) => children,
  code: (props) => {
    const { className, children } = props
    const lang = className?.replace('language-', '') ?? ''
    if (!lang) return <code>{children}</code>
    return <CodeBlock lang={lang}>{children}</CodeBlock>
  },
}

export default function MDXRenderer({ Content }) {
  return (
    <MDXProvider components={components}>
      <div className="module-mdx">
        <Content />
      </div>
    </MDXProvider>
  )
}
