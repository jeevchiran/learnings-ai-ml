import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState, useEffect } from 'react'

export default function CodeBlock({ children, lang = 'python', className }) {
  // MDX passes lang as className="language-python"
  const language = lang || (className?.replace('language-', '') ?? 'text')
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    function handler(e) { setDark(e.detail.dark) }
    window.addEventListener('theme-change', handler)
    return () => window.removeEventListener('theme-change', handler)
  }, [])

  function copy() {
    navigator.clipboard.writeText(String(children).trimEnd())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="lc-code-wrap">
      <button className="lc-copy-btn" onClick={copy} aria-label="Copy code">
        {copied ? '✓' : 'Copy'}
      </button>
      <SyntaxHighlighter
        language={language}
        style={dark ? oneDark : oneLight}
        customStyle={{ margin: 0, borderRadius: '6px', fontSize: '0.85rem' }}
      >
        {String(children).trimEnd()}
      </SyntaxHighlighter>
    </div>
  )
}
