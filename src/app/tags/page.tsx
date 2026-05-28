import { getChannelInfo } from '../../lib/sources'
import { getEnv } from '../../lib/env'
import Layout from '../../components/Layout'
import Header from '../../components/Header'
import TagCloud from '../../components/TagCloud'

export const dynamic = 'force-dynamic'

export default async function TagsPage() {
  const siteUrl = getEnv('SITE_URL') ?? '/'
  const channel = await getChannelInfo()

  channel.seo = { title: 'Tags' }

  const items = (getEnv('TAGS') || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
    .map(tag => ({
      href: `/search/result?q=${encodeURIComponent(`#${tag}`)}`,
      label: tag,
    }))

  return (
    <Layout channel={channel} siteUrl={siteUrl} pathname="/tags">
      <Header channel={channel} />
      <TagCloud title="Tags" items={items} />
    </Layout>
  )
}
