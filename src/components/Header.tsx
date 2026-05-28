import type { ChannelInfo } from '../types'
import { getEnv } from '../lib/env'

const HIDE_DESCRIPTION = getEnv('HIDE_DESCRIPTION')

export default function Header({ channel }: { channel: ChannelInfo }) {
  if (HIDE_DESCRIPTION === 'true' || !channel?.descriptionHTML || channel.descriptionHTML.length === 0) {
    return null
  }

  return (
    <div
      className="mb-6 break-words rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-card)] px-5 py-4 text-[14px] leading-relaxed text-[var(--color-muted)] shadow-[var(--shadow-card)] content"
      dangerouslySetInnerHTML={{ __html: channel.descriptionHTML }}
    />
  )
}
