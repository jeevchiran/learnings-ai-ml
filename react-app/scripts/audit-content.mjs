// Structural checks, not a substitute for reviewing the scientific claims.
// Run from react-app: node scripts/audit-content.mjs [--write]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createProcessor } from '@mdx-js/mdx'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import katex from 'katex'
import { courses } from '../src/data/courses.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const processor = createProcessor({ remarkPlugins: [remarkMath, remarkGfm] })
const ids = new Set(courses.flatMap(c => c.modules.map(m => m.id)))
const records = []
const errors = []
function walk(node, visit) { visit(node); node.children?.forEach(child => walk(child, visit)) }
function literal(node) {
  if (node?.type === 'Literal') return node.value
  if (node?.type === 'ArrayExpression') return node.elements.map(literal)
  return undefined
}
function attr(node, name) {
  const value = node.attributes?.find(a => a.name === name)?.value
  return typeof value === 'string' ? value : literal(value?.data?.estree?.body?.[0]?.expression)
}
function words(node) { return node.value ?? node.children?.map(words).join(' ') ?? '' }

for (const course of courses) for (const mod of course.modules) {
  const relative = `src/content/${course.trackPath}/${mod.id}.mdx`
  const file = path.join(root, relative)
  const record = { id: mod.id, track: course.id, file: relative, headings: [], widgets: [], quizzes: [], math: 0, code: 0, warnings: [] }
  records.push(record)
  const fail = (line, message) => errors.push({ file: relative, line, message })
  if (!fs.existsSync(file)) { fail(1, 'Missing registered module'); continue }
  const source = fs.readFileSync(file, 'utf8')
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(source)) fail(1, 'Unexpected control character in source')
  record.words = source.split(/\s+/).length
  let tree
  try { tree = processor.parse(source) } catch (e) { fail(e.line, e.message); continue }
  walk(tree, node => {
    const line = node.position?.start.line
    if (node.type === 'heading') record.headings.push({ depth: node.depth, text: words(node), line })
    if (node.type === 'code') record.code++
    if (node.type === 'math' || node.type === 'inlineMath') {
      record.math++
      if (/\t(?:imes|ext|heta|frac|au)/.test(node.value)) fail(line, 'Possible escaped LaTeX command turned into a tab')
      if (/\b(?:fare|outlier|trips)\b/.test(node.value) && !node.value.includes('\\text')) fail(line, 'Possible currency parsed as math: escape the dollar sign or use USD')
      try { katex.renderToString(node.value, { throwOnError: true, strict: 'ignore', displayMode: node.type === 'math' }) }
      catch (e) { fail(line, e.message) }
    }
    if (node.type === 'mdxjsEsm') for (const statement of node.data?.estree?.body ?? []) {
      if (statement.type !== 'ImportDeclaration') continue
      const target = statement.source.value
      if (target.startsWith('.') && !fs.existsSync(path.resolve(path.dirname(file), target))) fail(line, `Missing import: ${target}`)
    }
    if (node.name?.endsWith('Widget')) record.widgets.push(node.name)
    if (['QuizCard', 'MultiSelectQuiz', 'PredictReveal'].includes(node.name)) {
      const options = attr(node, 'options'), correct = attr(node, 'correct')
      const answers = Array.isArray(correct) ? correct : [correct]
      if (!Array.isArray(options) || options.length < 2 || answers.some(i => !Number.isInteger(i) || i < 0 || i >= options.length)) fail(line, 'Invalid quiz options or answer index')
      record.quizzes.push({ type: node.name, line, question: attr(node, 'question') ?? attr(node, 'prompt'), answer: answers.map(i => options?.[i]).join('; '), explanation: attr(node, 'explanation') })
    }
    if (node.type === 'link') {
      const match = node.url.match(/(?:#)?\/module\/([^/#?]+)/)
      if (match && !ids.has(match[1])) fail(line, `Unknown module link: ${node.url}`)
    }
    if (node.type === 'image' && !node.alt) record.warnings.push(`Line ${line}: image needs alternative text`)
  })
  if (record.headings.filter(h => h.depth === 1).length !== 1) record.warnings.push('Expected one main title')
  if (!mod.id.includes('quiz') && !record.widgets.length) record.warnings.push('No interactive widget; review whether a table, code example or diagram suffices')
}
const registered = new Set(records.map(r => r.file.replaceAll('\\', '/')))
for (const dir of fs.readdirSync(path.join(root, 'src/content'))) {
  for (const name of fs.readdirSync(path.join(root, 'src/content', dir))) {
    if (name.endsWith('.mdx') && !registered.has(`src/content/${dir}/${name}`)) errors.push({ file: `src/content/${dir}/${name}`, line: 1, message: 'Unregistered MDX file' })
  }
}
const summary = { tracks: courses.length, modules: records.length, widgetUses: records.reduce((n,r) => n+r.widgets.length,0), questions: records.reduce((n,r) => n+r.quizzes.length,0), mathExpressions: records.reduce((n,r) => n+r.math,0), errors }
if (process.argv.includes('--write')) {
  const out = path.join(root, '../docs/audit')
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(path.join(out, 'content-inventory.json'), JSON.stringify({ summary, records }, null, 2) + '\n')
}
console.log(JSON.stringify(summary, null, 2))
process.exitCode = errors.length ? 1 : 0
