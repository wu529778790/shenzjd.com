import type { ChannelInfo } from '../types'
import Header from './Header'
import Item from './Item'

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
  const newestDatetime = posts[0]?.datetime
  const oldestDatetime = posts[posts.length - 1]?.datetime

  // On "before" pages: "Before" uses oldest (go further back), "After" uses oldest (go forward)
  // On other pages: "Before" uses oldest (go back), "After" uses newest (go forward)
  const beforeCursor = oldestDatetime
  const afterCursor = pageType === 'before' ? oldestDatetime : newestDatetime

  return (
    <div>
      {pageHeading && <h1 className="sr-only">{pageHeading}</h1>}
      {children ?? <Header channel={channel} />}
      <div className="flex flex-col gap-4">
        {posts.map(post => (
          <Item key={post.id} post={post} isItem={isItem} siteUrl={siteUrl} channelName={process.env.CHANNEL} />
        ))}
      </div>
      <nav className="mt-6 flex items-center justify-between" aria-label="Pagination">
        {before && beforeCursor ? (
          pageType === 'home' ? (
            <span className="inline-flex min-h-[36px] items-center justify-center rounded-[var(--radius-md)] px-4 py-2 text-[13px] font-medium text-[var(--color-line-strong)] cursor-default select-none">
              &larr; 上一页
            </span>
          ) : (
            <a
              href={`${siteUrl}before/${beforeCursor}`}
              title="上一页"
              className="inline-flex min-h-[36px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-2 text-[13px] font-medium text-[var(--color-muted)] no-underline shadow-[var(--shadow-card)] transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-[var(--shadow-soft)] hover:no-underline active:translate-y-px">
              &larr; 上一页
            </a>
          )
        ) : (
          <span className="inline-block w-[36px]" aria-hidden="true">&nbsp;</span>
        )}
        <div className="flex-1" />
        {after && afterCursor ? (
          <a
            href={`${siteUrl}after/${afterCursor}`}
            title="下一页"
            className="inline-flex min-h-[36px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-2 text-[13px] font-medium text-[var(--color-muted)] no-underline shadow-[var(--shadow-card)] transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-[var(--shadow-soft)] hover:no-underline active:translate-y-px">
            下一页 &rarr;
          </a>
        ) : (
          <span className="inline-block w-[36px]" aria-hidden="true">&nbsp;</span>
        )}
      </nav>
    </div>
  )
}
