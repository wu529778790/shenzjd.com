import type { ChannelInfo } from '../types'
import { getEnv } from '../lib/env'
import { sanitize } from '../lib/sanitize'

const HIDE_DESCRIPTION = getEnv('HIDE_DESCRIPTION')

export default function Header({ channel }: { channel: ChannelInfo }) {
  if (HIDE_DESCRIPTION === 'true' || !channel?.descriptionHTML || channel.descriptionHTML.length === 0) {
    return null
  }

  return (
    <div
      data-animate="post"
      className="mb-6 break-words rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-card)] px-5 py-4 text-[14px] leading-relaxed text-[var(--color-muted)] content"
      style={{ '--animate-delay': '60ms' } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: sanitize(channel.descriptionHTML) }}
    />
  )
}
