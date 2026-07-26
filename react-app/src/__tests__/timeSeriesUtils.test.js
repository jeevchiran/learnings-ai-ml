import { describe, it, expect } from 'vitest'
import { simulateSARIMA, acf, pacf, forecastARIMA } from '../components/widgets/time-series/timeSeriesUtils.js'

// The widgets teach the identification rule by *showing* it, so the simulator and
// the PACF recursion have to actually produce the textbook patterns. If these
// break, the ACF/PACF lab silently teaches the wrong thing.
describe('time series simulation + identification', () => {
  it('AR(1): PACF cuts off after lag 1, ACF does not', () => {
    const { y } = simulateSARIMA({ n: 4000, phi: [0.8], seed: 1 })
    const p = pacf(y, 6)
    const a = acf(y, 6)
    expect(p[1]).toBeCloseTo(0.8, 1)
    expect(Math.abs(p[2])).toBeLessThan(0.06)   // cut off
    expect(a[2]).toBeGreaterThan(0.5)           // still decaying (0.8^2 = 0.64)
  })

  it('MA(1): ACF cuts off after lag 1, PACF does not', () => {
    const { y } = simulateSARIMA({ n: 4000, theta: [0.8], seed: 2 })
    const a = acf(y, 6)
    expect(a[1]).toBeCloseTo(0.8 / (1 + 0.8 ** 2), 1)  // theoretical 0.488
    expect(Math.abs(a[2])).toBeLessThan(0.06)          // cut off
    expect(Math.abs(pacf(y, 6)[2])).toBeGreaterThan(0.1)
  })

  it('the seasonal block multiplies, generating the lag-13 cross term', () => {
    const { arPoly } = simulateSARIMA({ n: 10, phi: [0.5], sphi: [0.6], m: 12, seed: 3 })
    expect(arPoly[1]).toBeCloseTo(-0.5, 10)
    expect(arPoly[12]).toBeCloseTo(-0.6, 10)
    expect(arPoly[13]).toBeCloseTo(0.3, 10)   // (-phi)(-Phi)
  })

  it('forecastARIMA integrates a d=1 forecast back onto the original scale', () => {
    const y = Array.from({ length: 50 }, (_, i) => i)   // ramp: every change is exactly 1
    const fc = forecastARIMA(y, { p: 1, d: 1, h: 3 })
    expect(fc.point[0]).toBeCloseTo(50, 6)
    expect(fc.point[2]).toBeCloseTo(52, 6)
  })

  it('integration makes the prediction interval fan out faster than d=0', () => {
    const { y } = simulateSARIMA({ n: 200, phi: [0.5], d: 1, sigma: 1, level: 40, seed: 4 })
    const flat = forecastARIMA(y, { p: 2, d: 0, h: 10 })
    const integrated = forecastARIMA(y, { p: 2, d: 1, h: 10 })
    for (let h = 1; h < 10; h++) {
      expect(integrated.halfWidth[h]).toBeGreaterThan(integrated.halfWidth[h - 1])
    }
    expect(integrated.halfWidth[9]).toBeGreaterThan(flat.halfWidth[9])
  })
})
