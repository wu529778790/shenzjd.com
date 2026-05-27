import type { ChannelInfo } from '../types'
import Header from './Header'
import Item from './Item'

interface ListProps {
  channel: ChannelInfo
  siteUrl: string
  rssUrl: string
  before?: boolean
  after?: boolean
  isItem?: boolean
  pageHeading?: string
  children?: React.ReactNode
}

export default function List({
  channel,
  siteUrl,
  rssUrl,
  before = true,
  after = true,
  isItem = false,
  pageHeading,
  children,
}: ListProps) {
  const posts = channel.posts ?? []
  const beforeCursor = posts[posts.length - 1]?.id
  const afterCursor = posts[0]?.id

  return (
    <div>
      {pageHeading && <h1 className="sr-only">{pageHeading}</h1>}
      {children ?? <Header channel={channel} siteUrl={siteUrl} rssUrl={rssUrl} />}
      <ol className="mt-5 mb-0 list-none pl-0 max-sm:ml-0" aria-label={isItem ? 'Post' : 'Posts'}>
        {posts.map(post => (
          <li key={post.id}>
            <Item post={post} isItem={isItem} siteUrl={siteUrl} channelName={process.env.CHANNEL} />
          </li>
        ))}
      </ol>
      <nav className="my-5 flex items-center gap-3" aria-label="Pagination">
        {before && beforeCursor && Number(beforeCursor) > 1 ? (
          <a
            href={`${siteUrl}before/${beforeCursor}`}
            title="Older posts"
            className="inline-flex min-h-[32px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-line)] px-3 py-1 text-[13px] font-medium text-[var(--color-muted)] no-underline transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:no-underline active:bg-[var(--color-line)]">
            &larr; Before
          </a>
        ) : (
          <span className="inline-block w-[34px]" aria-hidden="true">&nbsp;</span>
        )}
        <div className="flex-1 text-center text-[12px] font-medium text-[var(--color-muted)]" />
        {after && afterCursor ? (
          <a
            href={`${siteUrl}after/${afterCursor}`}
            title="Newer posts"
            className="inline-flex min-h-[32px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-line)] px-3 py-1 text-[13px] font-medium text-[var(--color-muted)] no-underline transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:no-underline active:bg-[var(--color-line)]">
            After &rarr;
          </a>
        ) : (
          <span className="inline-block w-[34px]" aria-hidden="true">&nbsp;</span>
        )}
      </nav>
    </div>
  )
}
