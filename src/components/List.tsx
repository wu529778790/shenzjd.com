import type { ChannelInfo } from '../types'
import { getEnv } from '../lib/env'
import ErrorBoundary from './ErrorBoundary'
import Item from './Item'
import ItemError from './ItemError'

interface ListProps {
  channel: ChannelInfo
  siteUrl: string
  before?: boolean
  after?: boolean
  isItem?: boolean
  pageHeading?: string
  pageType?: 'home' | 'before' | 'after'
  children?: React.ReactNode
}

/** Extract numeric message ID from post ID like "channel/4327" → "4327" */
function extractId(postId: string): string | undefined {
  const parts = postId.split('/')
  return parts[parts.length - 1]
}

export default function List({
  channel,
  siteUrl,
  before = true,
  after = true,
  isItem = false,
  pageHeading,
  pageType = 'home',
  children,
}: ListProps) {
  const posts = channel.posts ?? []
  // Posts array is ordered oldest-first: posts[0]=oldest, posts[last]=newest
  const oldestId = extractId(posts[0]?.id)
  const newestId = extractId(posts[posts.length - 1]?.id)

  // "上一页" = newer posts = after/${oldestId}
  // "下一页" = older posts = before/${newestId}
  const prevCursor = oldestId
  const nextCursor = newestId

  return (
    <div>
      {pageHeading && <h1 className="sr-only">{pageHeading}</h1>}
      {children}
      <div className="flex flex-col gap-3">
        {posts.length === 0 && (
          <div className="py-12 text-center">
            <p className="ui-font text-[14px] text-[var(--color-muted)]">No posts yet.</p>
          </div>
        )}
        {posts.map((post, index) => (
          <ErrorBoundary key={post.id} fallback={<ItemError />}>
            <Item post={post} isItem={isItem} siteUrl={siteUrl} channelName={getEnv('CHANNEL')} index={index} />
          </ErrorBoundary>
        ))}
      </div>
      <nav className="mt-6 flex items-center justify-between" aria-label="Pagination">
        {before && prevCursor ? (
          pageType === 'home' ? (
            <span className="ui-font inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-md)] px-4 py-2 text-[13px] font-medium text-[var(--color-line-strong)] cursor-default select-none">
              &larr; 上一页
            </span>
          ) : (
            <a
              href={`${siteUrl}before/${prevCursor}`}
              title="上一页"
              className="ui-font inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-2 text-[13px] font-medium text-[var(--color-muted)] no-underline transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:no-underline active:translate-y-px">
              &larr; 上一页
            </a>
          )
        ) : (
          <span className="inline-block w-[44px]" aria-hidden="true">&nbsp;</span>
        )}
        <div className="flex-1" />
        {after && nextCursor ? (
          <a
            href={`${siteUrl}before/${nextCursor}`}
            title="下一页"
            className="ui-font inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-2 text-[13px] font-medium text-[var(--color-muted)] no-underline transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:no-underline active:translate-y-px">
            下一页 &rarr;
          </a>
        ) : (
          <span className="inline-block w-[36px]" aria-hidden="true">&nbsp;</span>
        )}
      </nav>
    </div>
  )
}
