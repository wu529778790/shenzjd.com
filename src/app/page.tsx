import { getChannelInfo } from '../lib/sources'
import { getEnv } from '../lib/env'
import Layout from '../components/Layout'
import List from '../components/List'

export const dynamic = 'force-dynamic'

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
