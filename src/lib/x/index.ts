import type { Post } from '../../types'
import { getProcessEnv } from '../env'
import { parseXProfile } from './parse'
import { loadXProfileHtml } from './request'
import { mergeXPosts } from './store'

/**
 * X source aggregation: fetch configured profiles, parse tweets, merge into
 * the incremental store, and return the full accumulated history (newest
 * first). A failed fetch degrades to the stored history rather than an error.
 */

function getXHandles(): string[] {
  const raw = getProcessEnv('X_USERS') ?? ''
  return raw
    .split(',')
    .map(h => h.trim().replace(/^@/, ''))
    .filter(Boolean)
}

export async function getXPosts(): Promise<Post[]> {
  const handles = getXHandles()
  if (handles.length === 0) {
    return []
  }

  const all: Post[] = []
  for (const handle of handles) {
    try {
      const html = await loadXProfileHtml(handle)
      const posts = parseXProfile(html, handle)
      if (posts.length > 0) {
        all.push(...posts)
      }
    }
    catch (error) {
      // Log and continue with other handles / stored history.
      console.warn(`[diag] X fetch failed for @${handle}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (all.length === 0) {
    // Every fetch failed — return whatever history we already have.
    return mergeXPosts([])
  }
  return mergeXPosts(all)
}
