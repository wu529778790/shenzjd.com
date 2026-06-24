import type { Metadata } from 'next'
import { getChannelInfo, getEmptyChannel } from '../../../lib/sources'
import { getEnv } from '../../../lib/env'
import Layout from '../../../components/Layout'
import List from '../../../components/List'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ q: string }> }): Promise<Metadata> {
  const { q } = await params
  const decodedQ = decodeURIComponent(q || '')
  return {
    title: `Search: ${decodedQ}`,
    robots: { index: false, follow: false },
  }
}

export default async function SearchPage({ params }: { params: Promise<{ q: string }> }) {
  const { q } = await params
  const decodedQ = decodeURIComponent(q || '')
  const siteUrl = getEnv('SITE_URL') ?? '/'

  let channel
  try {
    channel = await getChannelInfo({ q: decodedQ })
  } catch (err) {
    console.error('Failed to fetch search results, using empty state:', err)
    channel = getEmptyChannel()
  }

  const channelWithSeo = { ...channel, seo: { title: decodedQ, noindex: true } }

  return (
    <Layout channel={channelWithSeo} siteUrl={siteUrl} pathname={`/search/${q}`}>
      <List
        channel={channelWithSeo}
        siteUrl={siteUrl}
        before={false}
        after={false}
        pageHeading={`Search: ${decodedQ}`}
      />
    </Layout>
  )
}
