import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState, useEffect } from 'react'

export default function CodeBlock({ children, lang, className }) {
  const language = lang || className?.replace('language-', '') || 'python'
  const [dark, setDark] = useState(() => {
    try { return document.documentElement.getAttribute('data-theme') === 'dark' } catch { return false }
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    function handler(e) { setDark(e.detail.dark) }
    window.addEventListener('theme-change', handler)
    return () => window.removeEventListener('theme-change', handler)
  }, [])

  function copy() {
    try { navigator.clipboard.writeText(String(children).trimEnd()) } catch {}
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
