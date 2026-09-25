// Give every MDX widget a keyboard-scrollable boundary. Wide diagrams should
// scroll within the figure rather than move the lesson's prose off screen.
export default function remarkVisuals() {
  return tree => {
    function visit(parent) {
      if (!parent.children) return
      parent.children = parent.children.map(node => {
        visit(node)
        if (node.type !== 'mdxJsxFlowElement' || !node.name?.endsWith('Widget')) return node
        const label = node.name.replace(/Widget$/, '').replace(/([a-z])([A-Z])/g, '$1 $2')
        return {
          type: 'mdxJsxFlowElement', name: 'div',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'className', value: 'lesson-visual' },
            { type: 'mdxJsxAttribute', name: 'role', value: 'region' },
            { type: 'mdxJsxAttribute', name: 'aria-label', value: `${label} interactive example; scroll horizontally if needed` },
            { type: 'mdxJsxAttribute', name: 'tabIndex', value: '0' },
          ],
          children: [node],
        }
      })
    }
    visit(tree)
  }
}
