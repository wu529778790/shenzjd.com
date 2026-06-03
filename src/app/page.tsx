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
  try {
    channel = await getChannelInfo()
  } catch (err) {
    console.error('Failed to fetch channel info, using empty state:', err)
    channel = getEmptyChannel()
  }

  return (
    <Layout channel={channel} siteUrl={siteUrl} pathname="/">
      <List
        channel={channel}
        siteUrl={siteUrl}
        pageHeading={channel.title}
      />
    </Layout>
  )
}
