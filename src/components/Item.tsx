import type { Post } from '../types'
import dayjs from '../lib/dayjs'
import { getEnv } from '../lib/env'

const locale = getEnv('LOCALE')
const timezone = getEnv('TIMEZONE')
const COMMENTS = getEnv('COMMENTS')
const REACTIONS = getEnv('REACTIONS')

if (locale) dayjs.locale(locale)

const articleClass = 'transition duration-200'
const timeBoxClass = 'flex items-center leading-none'
const timeDotClass = 'h-[8px] w-[8px] rounded-full bg-accent'
const timeTextClass = 'm-0 flex-1 pl-[10px] text-[14px] font-medium text-accent'
const itemLinkClass = 'text-accent no-underline hover:underline'
const contentClass = 'ml-[3px] border-l-2 border-line py-[30px] pl-[15px] text-base leading-[1.6] sm:pl-[30px]'
const reactionBoxClass = 'ml-[3px] border-l-2 border-line pb-6 pl-[15px] pt-[6px] sm:pl-[30px]'
const reactionListClass = 'm-0 flex flex-wrap gap-[6px]'
const reactionPillClass = 'inline-flex items-center gap-1 rounded-full border border-line bg-code py-[3px] pl-[6px] pr-[8px] text-[12px] text-muted'
const reactionPaidClass = 'border-[rgba(255,196,0,0.35)] bg-[rgba(255,196,0,0.12)] text-[#9a6a00]'
const reactionEmojiClass = 'inline-flex items-center text-[14px] leading-none'
const reactionCountClass = 'font-medium opacity-80 [font-variant-numeric:tabular-nums]'
const tagBoxClass = 'ml-[3px] flex flex-wrap items-center gap-2 border-l-2 border-line pl-[15px] text-[14px] leading-[1.6] sm:pl-[30px]'
const tagPaddingClass = COMMENTS ? 'pb-[30px]' : 'pb-5'
const tagStandaloneClass = 'pt-[30px]'
const tagLinkClass = 'inline-block rounded-[4px] border border-line px-[10px] py-[2px] text-muted no-underline hover:border-accent hover:text-accent hover:no-underline'
const commentsClass = 'ml-[3px] border-l-2 border-line pb-6 pl-[15px] pt-[6px] sm:pl-[30px]'
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
    <article className={articleClass} style={{ viewTransitionName: `post-${post.id}` } as React.CSSProperties}>
      <header className={timeBoxClass}>
        <span className={timeDotClass} aria-hidden="true" />
        <p className={timeTextClass}>
          <a href={`${siteUrl}posts/${post.id}`} title={post.datetime} className={itemLinkClass}>
            <time dateTime={post.datetime} title={timeago}>{timeago}</time>
          </a>
        </p>
      </header>
      {hasContent && <div className={`${contentClass} content`} dangerouslySetInnerHTML={{ __html: post.content }} />}
      {hasReactions && (
        <div className={`${reactionBoxClass} ${hasContent ? '-mt-3 pt-0' : ''}`}>
          <div className={reactionListClass}>
            {post.reactions.map((reaction, i) => (
              <span key={i} className={`${reactionPillClass} ${reaction.isPaid ? reactionPaidClass : ''}`}>
                <span className={reactionEmojiClass}>
                  {reaction.isPaid ? '⭐' : reaction.emojiImage ? (
                    <img src={reaction.emojiImage} alt={reaction.emoji || 'emoji'} loading="lazy" width="20" height="20" className="block h-[1em] w-[1em]" />
                  ) : (
                    reaction.emoji
                  )}
                </span>
                <span className={reactionCountClass}>{reaction.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      {hasTags && (
        <footer className={`${tagBoxClass} ${!hasContent ? tagStandaloneClass : tagPaddingClass}`}>
          <span className="tag-icon" aria-hidden="true" />
          {post.tags.map(tag => (
            <a key={tag} href={getTagHref(tag)} title={tag} className={tagLinkClass}>
              {tag}
            </a>
          ))}
        </footer>
      )}
      {COMMENTS && isItem && channelName && (
        <section className={commentsClass} aria-label="Comments">
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
