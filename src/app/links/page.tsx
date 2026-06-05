import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getChannelInfo } from '../../lib/sources'
import { getEnv } from '../../lib/env'
import Layout from '../../components/Layout'
import Header from '../../components/Header'
import TagCloud from '../../components/TagCloud'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getEnv('SITE_URL') ?? '/'
  return {
    title: 'Links',
    alternates: { canonical: `${siteUrl}links` },
  }
}

export default async function LinksPage() {
  const siteUrl = getEnv('SITE_URL') ?? '/'
  const channel = await getChannelInfo()

  channel.seo = { title: 'Links' }

  const links = (getEnv('LINKS') || '')
    .split(';')
    .filter(Boolean)
    .map((link) => {
      const [title = '', href = ''] = link.split(',')
      return { title, href }
    })

  if (!links.length) redirect('/')

  const items = links.map(link => ({
    href: link.href,
    label: link.title,
    title: link.title,
    external: true,
  }))

  return (
    <Layout channel={channel} siteUrl={siteUrl} pathname="/links">
      <Header channel={channel} />
      <TagCloud title="Links" items={items} />
    </Layout>
  )
}
