import { getChannelInfo } from '../../../lib/sources'
import { getEnv } from '../../../lib/env'
import Layout from '../../../components/Layout'
import List from '../../../components/List'

export const dynamic = 'force-dynamic'

export default async function SearchPage({ params }: { params: Promise<{ q: string }> }) {
  const { q } = await params
  const decodedQ = decodeURIComponent(q || '')
  const siteUrl = getEnv('SITE_URL') ?? '/'
  const channel = await getChannelInfo({ q: decodedQ })

  channel.seo = { title: decodedQ, noindex: true }

  return (
    <Layout channel={channel} siteUrl={siteUrl} pathname={`/search/${q}`}>
      <List
        channel={channel}
        siteUrl={siteUrl}
        before={false}
        after={false}
        pageHeading={`Search: ${decodedQ}`}
      />
    </Layout>
  )
}
