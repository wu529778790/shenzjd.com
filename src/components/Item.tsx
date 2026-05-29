import type { Post } from '../types'
import dayjs from '../lib/dayjs'
import { getEnv } from '../lib/env'

const locale = getEnv('LOCALE')
const timezone = getEnv('TIMEZONE')
const COMMENTS = getEnv('COMMENTS')
const REACTIONS = getEnv('REACTIONS')

if (locale) dayjs.locale(locale)

const getTagHref = (tag: string) => `/search/result?q=${encodeURIComponent(`#${tag}`)}`

interface ItemProps {
  post: Post
  isItem?: boolean
  siteUrl: string
  channelName?: string
}

export default function Item({ post, isItem = false, siteUrl, channelName }: ItemProps) {
  const datetime = dayjs(post.datetime).tz(timezone)
  const timeago = datetime.isBefore(dayjs().subtract(1, 'w'))
    ? datetime.format('HH:mm · ll · ddd')
    : datetime.fromNow()
  const hasContent = post.content.length > 0
  const hasReactions = Boolean(REACTIONS && post.reactions?.length > 0)
  const hasTags = post.tags.length > 0

  return (
    <article
      data-animate="post"
      className={`group rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-soft)] sm:p-6 ${isItem ? '' : 'mb-4'}`}
      style={{ viewTransitionName: `post-${post.id}` } as React.CSSProperties}>
      {/* Timestamp */}
      <header className="mb-3 flex items-center leading-none">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
        <p className="m-0 flex-1 pl-2 text-[12px] font-medium tracking-wide text-[var(--color-muted)]">
          <a
            href={`${siteUrl}posts/${post.id}`}
            title={post.datetime}
            className="text-[var(--color-muted)] no-underline transition-colors duration-200 hover:text-[var(--color-heading)]">
            <time dateTime={post.datetime} title={timeago}>{timeago}</time>
          </a>
        </p>
      </header>

      {/* Content */}
      {hasContent && (
        <div
          className="text-[15px] leading-[1.8] text-[var(--color-ink)] content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}

      {/* Reactions */}
      {hasReactions && (
        <div className={`mt-3 ${hasContent ? '' : ''}`}>
          <div className="m-0 flex flex-wrap gap-1.5">
            {post.reactions.map((reaction, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] px-2.5 py-1 text-[12px] text-[var(--color-muted)] transition-colors duration-200 hover:border-[var(--color-accent-light)] hover:bg-[var(--color-accent-light)] ${reaction.isPaid ? 'border-amber-300 bg-amber-50 text-amber-700' : ''}`}>
                <span className="inline-flex items-center leading-none">
                  {reaction.isPaid ? '⭐' : reaction.emojiImage ? (
                    <img src={reaction.emojiImage} alt={reaction.emoji || 'emoji'} loading="lazy" width="16" height="16" className="block h-4 w-4" />
                  ) : (
                    reaction.emoji
                  )}
                </span>
                <span className="tabular-nums opacity-70">{reaction.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {hasTags && (
        <footer className={`mt-3 flex flex-wrap items-center gap-1.5 text-[13px] leading-relaxed ${!hasContent ? 'pt-2' : COMMENTS ? 'pb-2' : ''}`}>
          {post.tags.map(tag => (
            <a
              key={tag}
              href={getTagHref(tag)}
              title={tag}
              className="inline-block rounded-[var(--radius-full)] bg-[var(--color-tag-bg)] px-3 py-1 text-[11px] font-medium text-[var(--color-muted)] no-underline transition-all duration-200 hover:bg-[var(--color-tag-hover)] hover:text-white hover:no-underline">
              {tag}
            </a>
          ))}
        </footer>
      )}

      {/* Comments */}
      {COMMENTS && isItem && channelName && (
        <section className="mt-4 border-t border-[var(--color-line)] pt-4" aria-label="Comments">
          <script
            async
            src="https://telegram.org/js/telegram-widget.js"
            data-telegram-discussion={`${channelName}/${post.id}`}
            data-comments-limit="50"
            data-colorful="1"
            data-color="454545"
          />
        </section>
      )}
    </article>
  )
}
