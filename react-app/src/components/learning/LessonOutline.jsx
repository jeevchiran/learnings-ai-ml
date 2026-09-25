import { useEffect, useState } from 'react'

export default function LessonOutline({ contentRef }) {
  const [headings, setHeadings] = useState([])
  useEffect(() => {
    const root = contentRef.current
    if (!root) return
    function refresh() {
      const next = Array.from(root.querySelectorAll('h2'))
      setHeadings(previous => previous.length === next.length && previous.every((el, i) => el === next[i]) ? previous : next)
    }
    refresh()
    const observer = new MutationObserver(refresh)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [contentRef])
  if (!headings.length) return null
  return (
    <details className="lesson-outline">
      <summary>Lesson sections</summary>
      <nav aria-label="Sections in this lesson">
        <ol>{headings.map((heading, i) => <li key={i}>
          <button onClick={() => {
            heading.tabIndex = -1
            heading.scrollIntoView({ block: 'start' })
            heading.focus({ preventScroll: true })
          }}>{heading.textContent}</button>
        </li>)}</ol>
      </nav>
      <p>Sections inside an explanation appear here when you reveal it.</p>
    </details>
  )
}
