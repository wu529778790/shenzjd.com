import type { Metadata } from 'next'
import { getChannelInfo } from '../lib/sources'
import { getEnv } from '../lib/env'
import Layout from '../components/Layout'
import List from '../components/List'

export const dynamic = 'force-dynamic'

function getEmptyChannel() {
  return {
    posts: [],
    title: getEnv('CHANNEL') ?? '',
    description: '',
    descriptionHTML: null,
    avatar: undefined,
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const channel = await getChannelInfo()
    const siteUrl = getEnv('SITE_URL') ?? '/'
    return {
      title: channel.title,
      description: channel.description || undefined,
      openGraph: {
        title: channel.title,
        description: channel.description || undefined,
        url: siteUrl,
        images: channel.avatar ? [{ url: `/static/${channel.avatar}`, width: 200, height: 200 }] : undefined,
      },
      alternates: {
        canonical: siteUrl,
      },
    }
  } catch {
    return {}
  }
}

export default async function HomePage() {
  const siteUrl = getEnv('SITE_URL') ?? '/'

  let channel
  let error: string | null = null
  try {
    channel = await getChannelInfo()
  } catch (err) {
    console.error('Failed to fetch channel info:', err)
    channel = getEmptyChannel()
    error = '内容加载失败，请稍后刷新。'
  }

  return (
    <Layout channel={channel} siteUrl={siteUrl} pathname="/">
      {error ? (
        <div className="rounded-[var(--radius-md)] bg-[var(--color-card)] px-5 py-12 text-center">
          <p className="ui-font text-[14px] text-[var(--color-muted)]">{error}</p>
        </div>
      ) : (
        <List
          channel={channel}
          siteUrl={siteUrl}
          pageHeading={channel.title}
        />
      )}
    </Layout>
  )
}
