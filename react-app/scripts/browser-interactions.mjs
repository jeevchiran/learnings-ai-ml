import fs from 'node:fs'
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright')
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXE ? { executablePath: process.env.BROWSER_EXE } : {}) })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const base = process.env.AUDIT_URL ?? 'http://127.0.0.1:5173/learnings-ai-ml/'
const errors = [], checks = []
page.on('pageerror', error => errors.push(error.message))
async function lesson(id) {
  await page.goto(`${base}?interaction=${id}#/module/${id}`)
  await page.locator('.module-mdx h1').waitFor()
}
try {
  await lesson('regression-m2')
  for (let n = 0; n < 40; n++) {
    const button = page.getByRole('button', { name: 'Show explanation', exact: true }).first()
    if (!await button.count()) break
    await button.click({ force: true })
  }
  const widget = page.getByRole('region', { name: 'Gradient Descent interactive example; scroll horizontally if needed', exact: true })
  for (let n = 0; n < 3; n++) {
    await widget.getByRole('button', { name: 'Run', exact: true }).click()
    await page.waitForTimeout(400)
    await widget.getByRole('button', { name: 'Reset', exact: true }).click()
    await page.waitForTimeout(250)
    assert.equal(await widget.getByText('Iter:', { exact: false }).textContent(), 'Iter: 0')
    await widget.getByRole('button', { name: 'Step', exact: true }).click()
    assert.equal(await widget.getByText('Iter:', { exact: false }).textContent(), 'Iter: 1')
  }
  await page.waitForTimeout(1200)
  assert.equal(await widget.getByRole('alert').count(), 0)
  checks.push('Gradient descent Run/Reset/Step, repeated three times')
  await widget.getByRole('button', { name: 'Run', exact: true }).click()
  await page.getByRole('button', { name: /Next/ }).first().click()
  await page.waitForTimeout(500)
  checks.push('Navigate away during gradient descent animation')

  await lesson('math-m11')
  await page.getByText('Lesson sections', { exact: true }).click()
  await page.getByRole('button', { name: 'Read a Small Jacobian First', exact: true }).click()
  assert(await page.getByRole('heading', { name: 'Read a Small Jacobian First', exact: true }).evaluate(el => el === document.activeElement))
  checks.push('Lesson outline moves keyboard focus to selected section')

  await lesson('vae-m10')
  const beta = page.locator('.lesson-visual').first()
  assert.match(await beta.getByRole('status').textContent(), /B/)
  await beta.getByRole('slider').fill('4')
  assert.match(await beta.getByRole('status').textContent(), /A/)
  checks.push('Beta loss changes preferred candidate from B to A')

  await lesson('math-m1')
  await page.waitForTimeout(31000)
  assert.equal(await page.getByRole('button', { name: 'Mark complete', exact: true }).count(), 1)
  checks.push('Reading for 31 seconds does not mark a lesson complete')
  assert.deepEqual(errors, [])
  const result = { base, checks, errors }
  fs.writeFileSync(new URL('../../docs/audit/interaction-results.json', import.meta.url), JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify(result, null, 2))
} finally {
  await browser.close()
}
