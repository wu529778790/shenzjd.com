import { notFound, redirect } from 'next/navigation'
import { getChannelInfo, getChannelPost } from '../../../lib/sources'
import { getEnv } from '../../../lib/env'
import Layout from '../../../components/Layout'
import List from '../../../components/List'

export const dynamic = 'force-dynamic'

const breadcrumbClass = 'mb-5 py-[10px] font-semibold'
const breadcrumbListClass = 'm-0 flex list-none items-center p-0'
const breadcrumbLinkClass = 'inline-flex items-center no-underline'
const breadcrumbAvatarClass = 'block h-5 w-5 rounded-full border-2 border-white object-cover shadow-soft'
const breadcrumbTitleClass = 'ml-[10px] flex-1 text-[14px] text-heading'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) redirect('/')

  const siteUrl = getEnv('SITE_URL') ?? '/'
  const rssUrl = `${siteUrl}rss.xml`
  const staticProxy = getEnv('STATIC_PROXY') ?? '/static/'

  const channelInfo = await getChannelInfo()
  const post = await getChannelPost(id)

  if (!post) notFound()

  const channel = {
    ...channelInfo,
    posts: [post],
    seo: post,
  }

  return (
    <Layout channel={channel} siteUrl={siteUrl} rssUrl={rssUrl} pathname={`/posts/${id}`}>
      <nav className={breadcrumbClass} aria-label="Breadcrumb">
        <ol className={breadcrumbListClass}>
          <li>
            <a href={siteUrl} title={channelInfo?.title} className={breadcrumbLinkClass}>
              <img
                src={channelInfo?.avatar?.startsWith('http') ? staticProxy + channelInfo?.avatar : '/void.png'}
                alt={channelInfo?.title}
                loading="eager"
                width="20"
                height="20"
                className={breadcrumbAvatarClass}
              />
              <span className={breadcrumbTitleClass} style={{ viewTransitionName: 'site-title', transition: '0.2s ease' } as React.CSSProperties}>
                {channelInfo.title}
              </span>
            </a>
          </li>
        </ol>
      </nav>
      <List
        channel={channel}
        siteUrl={siteUrl}
        rssUrl={rssUrl}
        before={false}
        after={false}
        isItem={true}
        pageHeading={post.title || channelInfo.title}
      />
    </Layout>
  )
}
