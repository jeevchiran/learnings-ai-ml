import { MDXProvider } from '@mdx-js/react'
import {
  ConceptBox, Bridge,
  DerivationSteps, DerivationStep,
  CodeBlock, InlineMath, BlockMath,
  QuizCard, MultiSelectQuiz, Recall,
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
  Recall,
  // Wide tables (up to 10 cols in this content) must scroll inside themselves,
  // otherwise the whole content column drags sideways on a phone and takes the
  // body text with it.
  table: (props) => (
    <div className="table-scroll">
      <table {...props} />
    </div>
  ),
  // Override <code> inside <pre> to use CodeBlock
  pre: ({ children }) => children,
  code: (props) => {
    const { className, children } = props
    const lang = className?.replace('language-', '') ?? ''
    if (!lang) {
      // multiline = came from a fenced block without language tag → style as code block
      if (String(children).includes('\n')) return <CodeBlock lang="text">{children}</CodeBlock>
      return <code>{children}</code>
    }
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
