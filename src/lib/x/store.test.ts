import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Post } from '../../types'

let tmp: string | null = null
let seq = 0

function makePost(id: string, datetime: string): Post {
  return {
    id,
    title: `t-${id}`,
    type: 'text',
    datetime,
    tags: [],
    text: 'x',
    content: 'x',
    reactions: [],
  }
}

async function loadFresh() {
  tmp = mkdtempSync(join(tmpdir(), 'xstore-'))
  process.env.X_DATA_DIR = tmp
  vi.resetModules()
  seq += 1
  return await import(`./store?fresh=${seq}`)
}

afterEach(() => {
  if (tmp) {
    rmSync(tmp, { recursive: true, force: true })
    tmp = null
  }
  delete process.env.X_DATA_DIR
})

describe('x store', () => {
  it('merges new tweets and persists them', async () => {
    const mod = await loadFresh()
    const posts = mod.mergeXPosts([
      makePost('x-a-1', '2026-08-01T00:00:00.000Z'),
      makePost('x-a-2', '2026-08-02T00:00:00.000Z'),
    ])
    expect(posts).toHaveLength(2)
    expect(posts[0].id).toBe('x-a-2') // newest first

    // Reload from disk to confirm persistence
    vi.resetModules()
    seq += 1
    const mod2 = await import(`./store?fresh2=${seq}`)
    expect(mod2.mergeXPosts([])).toHaveLength(2)
  })

  it('deduplicates by id and keeps the newest version', async () => {
    const mod = await loadFresh()
    mod.mergeXPosts([makePost('x-a-1', '2026-08-01T00:00:00.000Z')])
    const merged = mod.mergeXPosts([
      makePost('x-a-1', '2026-08-03T00:00:00.000Z'), // newer, wins
      makePost('x-a-3', '2026-08-03T01:00:00.000Z'),
    ])
    expect(merged).toHaveLength(2)
    expect(merged.find((p) => p.id === 'x-a-1')?.datetime).toBe('2026-08-03T00:00:00.000Z')
  })

  it('returns empty store when file is missing', async () => {
    const mod = await loadFresh()
    expect(mod.mergeXPosts([])).toEqual([])
  })
})
