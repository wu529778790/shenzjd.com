import type { Metadata } from 'next'
import { getChannelInfo } from '../lib/sources'
import { getEnv } from '../lib/env'
import Layout from '../components/Layout'
import List from '../components/List'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
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
}

export default async function HomePage() {
  const siteUrl = getEnv('SITE_URL') ?? '/'
  const channel = await getChannelInfo()

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
