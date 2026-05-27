import type { ChannelInfo } from '../types'
import Header from './Header'
import Item from './Item'

const itemsClass = 'mt-5 mb-0 ml-7 list-none pl-0 max-sm:ml-0'
const paginationClass = 'my-5 flex items-center'
const paginationLinkClass = 'inline-flex min-h-9 items-center justify-center rounded-[30px] border border-muted px-[15px] py-[5px] text-[14px] font-medium text-muted no-underline hover:text-accent hover:no-underline active:bg-line'
const paginationInfoClass = 'flex-1 text-center align-middle text-[12px] font-medium text-muted'
const paginationPlaceholderClass = 'inline-block w-[34px]'

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
      <ol className={itemsClass} aria-label={isItem ? 'Post' : 'Posts'}>
        {posts.map(post => (
          <li key={post.id}>
            <Item post={post} isItem={isItem} siteUrl={siteUrl} channelName={process.env.CHANNEL} />
          </li>
        ))}
      </ol>
      <nav className={paginationClass} aria-label="Pagination">
        {before && beforeCursor && Number(beforeCursor) > 1 ? (
          <a href={`${siteUrl}before/${beforeCursor}`} title="Before" className={paginationLinkClass}>
            Before
          </a>
        ) : (
          <span className={paginationPlaceholderClass} aria-hidden="true">&nbsp;</span>
        )}
        <div className={paginationInfoClass} />
        {after && afterCursor ? (
          <a href={`${siteUrl}after/${afterCursor}`} title="After" className={paginationLinkClass}>
            After
          </a>
        ) : (
          <span className={paginationPlaceholderClass} aria-hidden="true">&nbsp;</span>
        )}
      </nav>
    </div>
  )
}
