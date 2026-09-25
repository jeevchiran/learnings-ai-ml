// Run with Playwright available at PLAYWRIGHT_MODULE (absolute index.mjs path).
// BROWSER_EXE can select a locally installed Chromium/Edge executable.
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import { courses } from '../src/data/courses.js'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright')
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXE ? { executablePath: process.env.BROWSER_EXE } : {}) })
const base = process.env.AUDIT_URL ?? 'http://127.0.0.1:5173/learnings-ai-ml/'
let records = []
const out = new URL('../../docs/audit/', import.meta.url)
fs.mkdirSync(out, { recursive: true })
const selected = process.argv.slice(2)
if (selected.length && fs.existsSync(new URL('browser-results.json', out))) {
  const replacing = new Set(courses.flatMap(c => c.modules.filter(m => selected.includes(c.id) || selected.includes(m.id)).map(m => m.id)))
  records = JSON.parse(fs.readFileSync(new URL('browser-results.json', out))).filter(r => !replacing.has(r.id))
}
for (const course of courses.filter(c => !selected.length || selected.includes(c.id) || c.modules.some(m => selected.includes(m.id)))) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  let current
  page.on('pageerror', error => current?.errors.push(error.stack ?? error.message))
  const modules = course.modules.filter(m => !selected.length || selected.includes(course.id) || selected.includes(m.id))
  for (const mod of modules) {
    current = { id: mod.id, errors: [], widths: {}, revealed: 0 }
    records.push(current)
    try {
      await page.goto(`${base}?audit=${mod.id}#/module/${mod.id}`)
      await page.locator('.module-mdx h1').waitFor({ timeout: 45000 })
      // Reveal nested prediction explanations as well as top-level ones.
      for (let n = 0; n < 40; n++) {
        const button = page.getByRole('button', { name: 'Show explanation', exact: true }).first()
        if (!await button.count()) break
        await button.click({ force: true })
        current.revealed++
      }
      await page.waitForTimeout(150)
      current.mathErrors = await page.locator('.katex-error').count()
      current.headings = await page.locator('.module-mdx h1').count()
      current.guide = await page.locator('.lesson-guide').count()
      for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 900 })
        await page.waitForTimeout(80)
        current.widths[width] = await page.locator('.module-mdx-wrap').evaluate(el => ({ visible: el.clientWidth, content: el.scrollWidth }))
      }
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark')
        window.dispatchEvent(new CustomEvent('theme-change', { detail: { dark: true } }))
      })
      // Slider boundary checks catch NaNs, invalid SVG attributes and throws.
      const sliders = page.locator('.module-mdx input[type=range]')
      current.sliders = await sliders.count()
      for (let i = 0; i < current.sliders; i++) for (const bound of ['min', 'max']) {
        await sliders.nth(i).evaluate((el, bound) => {
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
          setter.call(el, el[bound] || (bound === 'min' ? '0' : '100'))
          el.dispatchEvent(new Event('input', { bubbles: true }))
          el.dispatchEvent(new Event('change', { bubbles: true }))
        }, bound)
      }
      current.invalidNumbers = await page.locator('.module-mdx').evaluate(el => /\bNaN\b/.test(el.innerText.replace(/```[\s\S]*?```/g, '')))
      if (mod.id === course.modules[0].id || selected.includes(mod.id)) {
        await page.locator('.module-mdx-wrap').evaluate(el => { el.scrollTop = 0 })
        await page.screenshot({ path: new URL(`${mod.id}-mobile.png`, out).pathname.replace(/^\/(\w:)/, '$1') })
      }
      await page.setViewportSize({ width: 1280, height: 900 })
    } catch (error) { current.errors.push(error.message) }
    fs.writeFileSync(new URL('browser-results.json', out), JSON.stringify(records, null, 2) + '\n')
  }
  console.log(`${course.id}: ${modules.length} routes checked`)
  await context.close()
}
await browser.close()
const failures = records.filter(r => r.errors.length || r.mathErrors || r.headings !== 1 || r.guide !== 1 || Object.values(r.widths).some(w => w.content > w.visible + 2))
console.log(JSON.stringify({ routes: records.length, failures }, null, 2))
process.exitCode = failures.length ? 1 : 0
