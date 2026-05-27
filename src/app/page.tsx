import { getChannelInfo } from '../lib/sources'
import { getEnv } from '../lib/env'
import Layout from '../components/Layout'
import List from '../components/List'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const siteUrl = getEnv('SITE_URL') ?? '/'
  const rssUrl = `${siteUrl}rss.xml`
  const channel = await getChannelInfo()

  return (
    <Layout channel={channel} siteUrl={siteUrl} rssUrl={rssUrl} pathname="/">
      <List
        channel={channel}
        siteUrl={siteUrl}
        rssUrl={rssUrl}
        pageHeading={channel.title}
      />
    </Layout>
  )
}
