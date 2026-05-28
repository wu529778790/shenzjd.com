import { getChannelInfo } from '../../../lib/sources'
import { getEnv } from '../../../lib/env'
import Layout from '../../../components/Layout'
import List from '../../../components/List'

export const dynamic = 'force-dynamic'

export default async function BeforePage({ params }: { params: Promise<{ cursor: string }> }) {
  const { cursor } = await params
  const siteUrl = getEnv('SITE_URL') ?? '/'
  const channel = await getChannelInfo({ before: cursor })

  return (
    <Layout channel={channel} siteUrl={siteUrl} pathname={`/before/${cursor}`}>
      <List
        channel={channel}
        siteUrl={siteUrl}
        pageType="before"
        pageHeading={channel.title}
      />
    </Layout>
  )
}
