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
      className="transition-opacity duration-150"
      style={{ viewTransitionName: `post-${post.id}` } as React.CSSProperties}>
      {/* Timestamp */}
      <header className="flex items-center leading-none">
        <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
        <p className="m-0 flex-1 pl-2.5 text-[13px] font-medium tracking-wide text-[var(--color-muted)]">
          <a
            href={`${siteUrl}posts/${post.id}`}
            title={post.datetime}
            className="text-[var(--color-muted)] no-underline transition-colors hover:text-[var(--color-heading)]">
            <time dateTime={post.datetime} title={timeago}>{timeago}</time>
          </a>
        </p>
      </header>

      {/* Content */}
      {hasContent && (
        <div
          className="ml-[3px] border-l-2 border-[var(--color-line)] py-6 pl-4 text-[16px] leading-[1.8] sm:pl-7 content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}

      {/* Reactions */}
      {hasReactions && (
        <div className={`ml-[3px] border-l-2 border-[var(--color-line)] pb-5 pl-4 pt-1.5 sm:pl-7 ${hasContent ? '-mt-2 pt-0' : ''}`}>
          <div className="m-0 flex flex-wrap gap-1.5">
            {post.reactions.map((reaction, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-0.5 text-[13px] text-[var(--color-muted)] ${reaction.isPaid ? 'border-amber-300 bg-amber-50 text-amber-700' : ''}`}>
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
        <footer className={`ml-[3px] flex flex-wrap items-center gap-1.5 border-l-2 border-[var(--color-line)] pl-4 text-[13px] leading-relaxed sm:pl-7 ${!hasContent ? 'pt-5' : COMMENTS ? 'pb-7' : 'pb-4'}`}>
          {post.tags.map(tag => (
            <a
              key={tag}
              href={getTagHref(tag)}
              title={tag}
              className="inline-block rounded-[var(--radius-sm)] bg-[var(--color-line)] px-2 py-0.5 text-[12px] font-medium text-[var(--color-muted)] no-underline transition-colors hover:bg-[var(--color-accent)] hover:text-white hover:no-underline">
              {tag}
            </a>
          ))}
        </footer>
      )}

      {/* Comments */}
      {COMMENTS && isItem && channelName && (
        <section className="ml-[3px] border-l-2 border-[var(--color-line)] pb-6 pl-4 pt-1.5 sm:pl-7" aria-label="Comments">
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
