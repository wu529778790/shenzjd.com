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
      className="transition-opacity duration-200"
      style={{ viewTransitionName: `post-${post.id}` } as React.CSSProperties}>
      {/* Timestamp */}
      <header className="flex items-center leading-none">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
        <p className="m-0 flex-1 pl-3 text-[15px] font-semibold tracking-tight text-[var(--color-accent)]">
          <a
            href={`${siteUrl}posts/${post.id}`}
            title={post.datetime}
            className="text-[var(--color-accent)] no-underline hover:underline">
            <time dateTime={post.datetime} title={timeago}>{timeago}</time>
          </a>
        </p>
      </header>

      {/* Content */}
      {hasContent && (
        <div
          className="ml-[3px] border-l-[3px] border-[var(--color-accent)]/20 py-7 pl-5 text-[17px] leading-[1.75] sm:pl-9 content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}

      {/* Reactions */}
      {hasReactions && (
        <div className={`ml-[3px] border-l-[3px] border-[var(--color-accent)]/20 pb-6 pl-5 pt-2 sm:pl-9 ${hasContent ? '-mt-3 pt-0' : ''}`}>
          <div className="m-0 flex flex-wrap gap-2">
            {post.reactions.map((reaction, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-white py-1 pl-2 pr-2.5 text-sm text-[var(--color-muted)] shadow-sm ${reaction.isPaid ? 'border-amber-300 bg-amber-50 text-amber-700' : ''}`}>
                <span className="inline-flex items-center text-sm leading-none">
                  {reaction.isPaid ? '⭐' : reaction.emojiImage ? (
                    <img src={reaction.emojiImage} alt={reaction.emoji || 'emoji'} loading="lazy" width="20" height="20" className="block h-4 w-4" />
                  ) : (
                    reaction.emoji
                  )}
                </span>
                <span className="font-medium opacity-80 tabular-nums">{reaction.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {hasTags && (
        <footer className={`ml-[3px] flex flex-wrap items-center gap-2 border-l-[3px] border-[var(--color-accent)]/20 pl-5 text-sm leading-relaxed sm:pl-9 ${!hasContent ? 'pt-6' : COMMENTS ? 'pb-8' : 'pb-5'}`}>
          <span className="tag-icon" aria-hidden="true" />
          {post.tags.map(tag => (
            <a
              key={tag}
              href={getTagHref(tag)}
              title={tag}
              className="inline-block rounded-[var(--radius-full)] bg-[var(--color-accent)]/8 px-3 py-1 text-[13px] font-medium text-[var(--color-accent)] no-underline transition-all hover:bg-[var(--color-accent)] hover:text-white hover:no-underline">
              {tag}
            </a>
          ))}
        </footer>
      )}

      {/* Comments */}
      {COMMENTS && isItem && channelName && (
        <section className="ml-[3px] border-l-2 border-[var(--color-line)] pb-6 pl-4 pt-1.5 sm:pl-8" aria-label="Comments">
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
