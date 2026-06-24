import { redirect } from 'next/navigation'
import { getChannelInfo, getEmptyChannel } from '../../../lib/sources'
import { getEnv } from '../../../lib/env'
import { isValidCursor } from '../../../lib/cursor'
import Layout from '../../../components/Layout'
import List from '../../../components/List'

export const dynamic = 'force-dynamic'

export default async function BeforePage({ params }: { params: Promise<{ cursor: string }> }) {
  const { cursor } = await params
  if (!isValidCursor(cursor)) redirect('/')
  const siteUrl = getEnv('SITE_URL') ?? '/'

  let channel
  let error: string | null = null
  try {
    channel = await getChannelInfo({ before: cursor })
  } catch (err) {
    console.error('Failed to fetch older posts:', err)
    channel = getEmptyChannel()
    error = '内容加载失败，请稍后刷新。'
  }

  return (
    <Layout channel={channel} siteUrl={siteUrl} pathname={`/before/${cursor}`}>
      {error ? (
        <div className="rounded-[var(--radius-md)] bg-[var(--color-card)] px-5 py-12 text-center">
          <p className="ui-font text-[14px] text-[var(--color-muted)]">{error}</p>
        </div>
      ) : (
        <List
          channel={channel}
          siteUrl={siteUrl}
          pageType="before"
          pageHeading={channel.title}
        />
      )}
    </Layout>
  )
}
