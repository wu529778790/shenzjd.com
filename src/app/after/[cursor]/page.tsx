import { getChannelInfo } from '../../../lib/sources'
import { getEnv } from '../../../lib/env'
import Layout from '../../../components/Layout'
import List from '../../../components/List'

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

export default async function AfterPage({ params }: { params: Promise<{ cursor: string }> }) {
  const { cursor } = await params
  const siteUrl = getEnv('SITE_URL') ?? '/'

  let channel
  try {
    channel = await getChannelInfo({ after: cursor })
  } catch (err) {
    console.error('Failed to fetch newer posts, using empty state:', err)
    channel = getEmptyChannel()
  }

  return (
    <Layout channel={channel} siteUrl={siteUrl} pathname={`/after/${cursor}`}>
      <List
        channel={channel}
        siteUrl={siteUrl}
        pageType="after"
        pageHeading={channel.title}
      />
    </Layout>
  )
}
