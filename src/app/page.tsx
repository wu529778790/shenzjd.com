import { getChannelInfo } from '../lib/sources'
import { getEnv } from '../lib/env'
import Layout from '../components/Layout'
import Header from '../components/Header'
import Item from '../components/Item'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const siteUrl = getEnv('SITE_URL') ?? '/'
  const rssUrl = `${siteUrl}rss.xml`
  const channel = await getChannelInfo()

  return (
    <Layout channel={channel} siteUrl={siteUrl} rssUrl={rssUrl} pathname="/">
      <Header channel={channel} siteUrl={siteUrl} rssUrl={rssUrl} />
      <ol className="mt-5 mb-0 ml-7 list-none pl-0 max-sm:ml-0" aria-label="Posts">
        {channel.posts.map(post => (
          <li key={post.id}>
            <Item post={post} siteUrl={siteUrl} channelName={process.env.CHANNEL} />
          </li>
        ))}
      </ol>
    </Layout>
  )
}
