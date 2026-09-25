import { MDXProvider } from '@mdx-js/react'
import { useMemo, useRef } from 'react'
import LessonGuide from './learning/LessonGuide.jsx'
import LessonOutline from './learning/LessonOutline.jsx'
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
    <div className="table-scroll" role="region" aria-label="Data table, scroll horizontally if needed" tabIndex={0}>
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

export default function MDXRenderer({ Content, mod }) {
  const contentRef = useRef(null)
  const lessonComponents = useMemo(() => mod ? {
    ...components,
    h1: props => <><h1 {...props} /><LessonGuide mod={mod} /><LessonOutline contentRef={contentRef} /></>,
  } : components, [mod])
  return (
    <MDXProvider components={lessonComponents}>
      <div className="module-mdx" ref={contentRef}>
        <Content />
      </div>
    </MDXProvider>
  )
}
