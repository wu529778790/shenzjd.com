import { describe, it, expect } from 'vitest'
import dayjs from '../dayjs'

describe('dayjs configuration', () => {
  it('has timezone plugin', () => {
    const dt = dayjs('2024-06-15T12:00:00Z')
    expect(typeof dt.tz).toBe('function')
  })

  it('has relativeTime plugin', () => {
    const dt = dayjs().subtract(1, 'hour')
    expect(typeof dt.fromNow).toBe('function')
  })

  it('has localizedFormat plugin', () => {
    const dt = dayjs('2024-06-15T12:00:00Z')
    expect(typeof dt.format).toBe('function')
    // localizedFormat enables LL, LTS, etc.
    expect(dt.locale('en').format('LL')).toContain('June')
  })
})

describe('timezone conversion', () => {
  it('converts UTC to Asia/Shanghai', () => {
    const dt = dayjs('2024-06-15T04:00:00Z').tz('Asia/Shanghai')
    expect(dt.hour()).toBe(12)
    expect(dt.format('YYYY-MM-DD')).toBe('2024-06-15')
  })

  it('converts UTC to America/New_York', () => {
    const dt = dayjs('2024-06-15T16:00:00Z').tz('America/New_York')
    expect(dt.hour()).toBe(12)
  })

  it('handles DST transitions', () => {
    // EST → EDT transition in 2024
    const before = dayjs('2024-03-10T06:59:00Z').tz('America/New_York')
    const after = dayjs('2024-03-10T07:00:00Z').tz('America/New_York')
    expect(before.hour()).toBe(1)
    expect(after.hour()).toBe  (3)
  })
})

describe('relative time formatting', () => {
  it('formats recent times as relative', () => {
    const dt = dayjs().subtract(5, 'minute')
    const result = dt.fromNow()
    expect(result).toContain('minutes ago')
  })

  it('formats older times with absolute format', () => {
    const dt = dayjs('2024-01-15T12:00:00Z')
    const result = dt.format('HH:mm · LL · ddd')
    expect(result).toMatch(/\d{2}:\d{2} · .+ · .+/)
  })
})

describe('locale support', () => {
  it('supports Chinese locale', async () => {
    await import('dayjs/locale/zh-cn.js')
    dayjs.locale('zh-cn')
    const dt = dayjs().subtract(1, 'hour')
    expect(dt.fromNow()).toContain('前')
    dayjs.locale('en')
  })

  it('supports Japanese locale', async () => {
    await import('dayjs/locale/ja.js')
    dayjs.locale('ja')
    const dt = dayjs().subtract(1, 'hour')
    expect(dt.fromNow()).toContain('前')
    dayjs.locale('en')
  })
})
