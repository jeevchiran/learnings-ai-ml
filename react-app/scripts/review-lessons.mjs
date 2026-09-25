// Print a track's stated takeaways and answer keys for editorial review.
// This is an index into lessons, not an automated correctness judgment.
import fs from 'node:fs'
import { createProcessor } from '@mdx-js/mdx'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import { courses } from '../src/data/courses.js'
const processor = createProcessor({ remarkPlugins: [remarkMath, remarkGfm] })
const tracks = process.argv.slice(2)
const read = n => n.value ?? n.children?.map(read).join(' ') ?? ''
for (const course of courses.filter(c => tracks.includes(c.id))) {
  for (const mod of course.modules) {
    const text = fs.readFileSync(new URL(`../src/content/${course.trackPath}/${mod.id}.mdx`, import.meta.url), 'utf8')
    const tree = processor.parse(text)
    console.log(`\n${mod.id}: ${mod.title}`)
    function visit(n) {
      if (n.name === 'ConceptBox' && n.attributes?.some(a => a.name === 'title' && /TL;DR|Summary/i.test(a.value))) console.log(read(n))
      n.children?.forEach(visit)
    }
    visit(tree)
  }
}
