import { describe, it, expect } from 'vitest'
import { courses, moduleById, allModules, getPrevNext } from '../data/courses.js'

describe('courses data', () => {
  it('has 7 tracks', () => {
    expect(courses).toHaveLength(7)
  })

  it('has 49 modules total', () => {
    expect(allModules).toHaveLength(49)
  })

  it('every module has required fields', () => {
    for (const m of allModules) {
      expect(m.id).toBeTruthy()
      expect(m.title).toBeTruthy()
      expect(m.file).toBeTruthy()
      expect(m.description).toBeTruthy()
      expect(typeof m.readTime).toBe('number')
      expect(m.courseId).toBeTruthy()
      expect(m.coursePath).toBeTruthy()
      expect(m.courseColor).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('moduleById keys match module ids', () => {
    for (const [key, mod] of Object.entries(moduleById)) {
      expect(key).toBe(mod.id)
    }
  })

  it('getPrevNext returns null at track boundaries', () => {
    const { prev } = getPrevNext('etl-pyspark-m1')
    expect(prev).toBeNull()

    const { next } = getPrevNext('etl-pyspark-m10')
    expect(next).toBeNull()
  })

  it('getPrevNext returns adjacent modules within same track', () => {
    const { prev, next } = getPrevNext('etl-pyspark-m3')
    expect(prev?.id).toBe('etl-pyspark-m2')
    expect(next?.id).toBe('etl-pyspark-m4')
  })

  it('getPrevNext handles unknown id', () => {
    expect(getPrevNext('nonexistent')).toEqual({ prev: null, next: null })
  })
})
