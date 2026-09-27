// Playwright is external tooling; see README for PLAYWRIGHT_MODULE/BROWSER_EXE.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { conceptConnections } from '../src/data/conceptConnections.js'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright')
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXE ? { executablePath: process.env.BROWSER_EXE } : {}) })
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce' })
const base = process.env.AUDIT_URL ?? 'http://127.0.0.1:5193/learnings-ai-ml/'
const out = path.resolve(process.env.VISUAL_AUDIT_OUTPUT ?? '../docs/audit/visual-connections')
fs.mkdirSync(out, { recursive: true })
const errors = [], paths = [], examples = []
page.on('pageerror', error => errors.push({ url: page.url(), message: error.message }))
async function open(id) {
  await page.goto(`${base}?visual-check=${id}#/module/${id}`)
  await page.locator('.module-mdx h1').waitFor({ timeout: 45000 })
}
async function fit() {
  const width = await page.locator('.module-mdx-wrap').evaluate(el => ({ visible: el.clientWidth, content: el.scrollWidth }))
  assert(width.content <= width.visible + 2, `${page.url()} overflows: ${JSON.stringify(width)}`)
}
try {
  for (const [track, map] of Object.entries(conceptConnections)) {
    await open(map.stages[0].start)
    const diagram = page.getByRole('list', { name: 'Learning path', exact: true })
    assert.equal(await diagram.getByRole('button').count(), 3)
    for (const stage of map.stages) {
      const button = diagram.getByRole('button', { name: new RegExp(stage.title) })
      await button.focus()
      await page.keyboard.press('Enter')
      assert.equal(await button.getAttribute('aria-pressed'), 'true')
      assert(await page.getByRole('list', { name: 'Lessons in this stage' }).getByRole('link').count())
    }
    for (const width of [1280, 390]) { await page.setViewportSize({ width, height: 1000 }); await fit() }
    paths.push(track)
    if (track === 'math-ml') {
      await diagram.getByRole('button', { name: /Represent numbers/ }).click()
      await page.locator('.concept-connections').screenshot({ path: path.join(out, 'concept-map-mobile.png') })
    }
    await page.setViewportSize({ width: 1280, height: 1000 })
  }
  for (const id of ['math-m10', 'regression-m2', 'dl-m6']) {
    await open(id)
    const widget = page.getByRole('region', { name: 'From prediction to learning', exact: true })
    await widget.getByRole('button', { name: 'Update the weight', exact: true }).click()
    assert(await widget.getByText('decreased', { exact: true }).count())
    await widget.getByRole('combobox').selectOption('0.8')
    assert(await widget.getByText('increased', { exact: true }).count())
    await widget.getByRole('slider').fill('3')
    assert(await widget.getByText('stayed the same', { exact: true }).count())
    await widget.getByRole('slider').fill('1')
    await widget.getByRole('button', { name: 'Find the slope', exact: true }).click()
    for (const width of [1280, 390]) { await page.setViewportSize({ width, height: 1600 }); await fit() }
    if (id === 'math-m10') await widget.screenshot({ path: path.join(out, 'learning-loop-mobile.png') })
    examples.push(id)
  }
  for (const id of ['aed-m7', 'trf-m4']) {
    await open(id)
    const widget = page.getByRole('region', { name: 'Attention as a weighted mixture', exact: true })
    await widget.getByRole('slider').fill('4')
    assert(await widget.getByRole('img', { name: 'bird attention weight 93.6 percent' }).count())
    await widget.getByRole('checkbox').check()
    assert(await widget.getByRole('slider').isDisabled())
    assert(await widget.getByRole('img', { name: 'bird attention weight 0.0 percent' }).count())
    assert((await widget.getByRole('status').textContent()).includes('4.924'))
    for (const width of [1280, 390]) { await page.setViewportSize({ width, height: 1600 }); await fit() }
    if (id === 'trf-m4') {
      await widget.screenshot({ path: path.join(out, 'attention-mobile.png') })
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
      await page.setViewportSize({ width: 1280, height: 1300 })
      await widget.screenshot({ path: path.join(out, 'attention-desktop-dark.png') })
    }
    examples.push(id)
  }
  assert.deepEqual(errors, [])
  const result = { base, conceptMaps: paths, interactiveLessons: examples, errors }
  fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify(result, null, 2))
} finally { await browser.close() }
