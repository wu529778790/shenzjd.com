import { afterEach, describe, expect, it, vi } from 'vitest'

let seq = 0
async function loadFresh() {
  vi.resetModules()
  seq += 1
  return await import(`./page-cache?fresh=${seq}`)
}

afterEach(() => {
  vi.useRealTimers()
})

describe('page cache', () => {
  it('stores and returns a rendered page', async () => {
    const mod = await loadFresh()
    mod.setCachedPage('/posts/49', {
      status: 200,
      statusText: 'OK',
      headers: [['content-type', 'text/html; charset=utf-8']],
      body: '<html>hello</html>',
    })
    const hit = mod.getCachedPage('/posts/49')
    expect(hit?.body).toBe('<html>hello</html>')
    expect(hit?.status).toBe(200)
  })

  it('returns undefined for unknown keys', async () => {
    const mod = await loadFresh()
    expect(mod.getCachedPage('/posts/999')).toBeUndefined()
  })

  it('reports zero stats before any writes', async () => {
    const mod = await loadFresh()
    expect(mod.getPageCacheStats()).toEqual({ size: 0, max: 0, estimatedBytes: 0 })
  })

  it('reports occupancy after writes', async () => {
    const mod = await loadFresh()
    mod.setCachedPage('/posts/1', {
      status: 200,
      statusText: 'OK',
      headers: [],
      body: 'hello-world',
    })
    const stats = mod.getPageCacheStats()
    expect(stats.size).toBe(1)
    expect(stats.estimatedBytes).toBe('hello-world'.length)
  })

  it('evicts entries after the TTL window', async () => {
    // The cache reads Date.now() for TTL, so fake the Date clock.
    // Advance past 0 first: lru-cache treats a start of 0 as "unset" and would
    // otherwise never expire the entry.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.advanceTimersByTime(100)
    const mod = await loadFresh()
    mod.setCachedPage('/posts/1', {
      status: 200,
      statusText: 'OK',
      headers: [],
      body: 'x',
    })
    expect(mod.getCachedPage('/posts/1')).toBeDefined()
    vi.advanceTimersByTime(301_000)
    expect(mod.getCachedPage('/posts/1')).toBeUndefined()
  })

  it('honors a per-entry TTL override longer than the default', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.advanceTimersByTime(100)
    const mod = await loadFresh()
    // 1h override for posts pages: survives past the 300s default window.
    mod.setCachedPage('/posts/49', {
      status: 200,
      statusText: 'OK',
      headers: [],
      body: 'x',
    }, 3_600_000)
    vi.advanceTimersByTime(301_000)
    expect(mod.getCachedPage('/posts/49')).toBeDefined()
    vi.advanceTimersByTime(3_300_000)
    expect(mod.getCachedPage('/posts/49')).toBeUndefined()
  })

  it('serves expired entries from the stale layer within the stale window', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.advanceTimersByTime(100)
    const mod = await loadFresh()
    mod.setCachedPage('/posts/1', {
      status: 200,
      statusText: 'OK',
      headers: [],
      body: 'stale-body',
    })
    vi.advanceTimersByTime(301_000)
    // 新鲜层已过期，stale 层仍可在 1h 窗口内兜底。
    expect(mod.getCachedPage('/posts/1')).toBeUndefined()
    expect(mod.getStalePage('/posts/1')?.body).toBe('stale-body')
  })

  it('expires stale entries after fresh TTL plus the stale window', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.advanceTimersByTime(100)
    const mod = await loadFresh()
    mod.setCachedPage('/posts/1', {
      status: 200,
      statusText: 'OK',
      headers: [],
      body: 'x',
    }, 3_600_000)
    // 1h 新鲜 TTL + 1h stale 窗口：中间时刻仍在，超过后彻底消失。
    vi.advanceTimersByTime(3_600_000 + 1_800_000)
    expect(mod.getStalePage('/posts/1')).toBeDefined()
    vi.advanceTimersByTime(1_800_000 + 1_000)
    expect(mod.getStalePage('/posts/1')).toBeUndefined()
  })

  it('refreshes the stale entry when a page is re-rendered', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.advanceTimersByTime(100)
    const mod = await loadFresh()
    mod.setCachedPage('/posts/1', {
      status: 200,
      statusText: 'OK',
      headers: [],
      body: 'old',
    })
    vi.advanceTimersByTime(301_000)
    expect(mod.getStalePage('/posts/1')?.body).toBe('old')
    // 后台重渲染完成后回写，stale 层同步拿到新值。
    mod.setCachedPage('/posts/1', {
      status: 200,
      statusText: 'OK',
      headers: [],
      body: 'new',
    })
    expect(mod.getCachedPage('/posts/1')?.body).toBe('new')
    expect(mod.getStalePage('/posts/1')?.body).toBe('new')
  })
})
