import type { Post } from '../../types'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { getProcessEnv } from '../env'

/**
 * Incremental persistent store for X tweets.
 *
 * x.com only SSR-renders the latest ~5 tweets, so history is accumulated
 * locally: every fetch merges newly-seen tweets into a JSON file keyed by
 * `x-{handle}-{tweetId}`. Over time the full history builds up without any
 * authenticated API access.
 *
 * Storage: <dataDir>/x-feed.json, where dataDir is X_DATA_DIR or ./data.
 * The Docker deployment mounts a host volume onto /app/data so the file
 * survives container rebuilds.
 */

interface XStoreShape {
  version: 1
  posts: Post[]
}

let _dataDir: string | null = null
let _cache: Record<string, Post> | null = null

function dataDir(): string {
  if (!_dataDir) {
    const cwd = (Reflect.get(globalThis, 'process') as { cwd?: () => string } | undefined)?.cwd?.() ?? '.'
    _dataDir = getProcessEnv('X_DATA_DIR') ?? join(cwd, 'data')
  }
  return _dataDir
}

function storePath(): string {
  return join(dataDir(), 'x-feed.json')
}

function load(): Record<string, Post> {
  if (_cache) {
    return _cache
  }
  try {
    const raw = readFileSync(storePath(), 'utf-8')
    const parsed = JSON.parse(raw) as XStoreShape
    const byId: Record<string, Post> = {}
    for (const post of parsed.posts ?? []) {
      byId[post.id] = post
    }
    _cache = byId
  }
  catch {
    _cache = {}
  }
  return _cache
}

function save(): void {
  if (!_cache)
    return
  const posts = Object.values(_cache).sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
  )
  try {
    mkdirSync(dataDir(), { recursive: true })
    writeFileSync(storePath(), JSON.stringify({ version: 1, posts } satisfies XStoreShape), 'utf-8')
  }
  catch (error) {
    console.warn(`[diag] X store write failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/** Merge newly-fetched posts into the store and return the full history (newest first). */
export function mergeXPosts(incoming: Post[]): Post[] {
  const byId = load()
  for (const post of incoming) {
    // Newer-than-known tweet wins; keep the original otherwise.
    const existing = byId[post.id]
    if (!existing || new Date(post.datetime).getTime() > new Date(existing.datetime).getTime()) {
      byId[post.id] = post
    }
  }
  save()
  return Object.values(byId).sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
  )
}
