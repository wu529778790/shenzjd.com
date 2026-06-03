import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getChannelInfo, getChannelPost } from '../../../lib/sources'
import { getEnv } from '../../../lib/env'
import Layout from '../../../components/Layout'
import List from '../../../components/List'

export const dynamic = 'force-dynamic'

const breadcrumbClass = 'mb-5 py-[10px] font-semibold'
const breadcrumbListClass = 'm-0 flex list-none items-center p-0'
const breadcrumbLinkClass = 'inline-flex items-center no-underline'
const breadcrumbAvatarClass = 'block h-5 w-5 rounded-full border-2 border-[var(--color-card)] object-cover shadow-soft'
const breadcrumbTitleClass = 'ml-[10px] flex-1 text-[14px] text-[var(--color-heading)]'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params
    const siteUrl = getEnv('SITE_URL') ?? '/'
    const channelInfo = await getChannelInfo()
    const post = await getChannelPost(id)
    if (!post) return {}

    const title = post.title || channelInfo.title
    const description = post.description || post.text?.slice(0, 160) || undefined
    const url = `${siteUrl}posts/${post.id}`

    // Extract first image from content for OG
    const imgMatch = post.content.match(/src="([^"]+)"/)
    const ogImage = imgMatch ? `/static/${imgMatch[1]}` : channelInfo.avatar ? `/static/${channelInfo.avatar}` : undefined

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        type: 'article',
        publishedTime: post.datetime,
        images: ogImage ? [{ url: ogImage, width: 800, height: 600 }] : undefined,
      },
      alternates: {
        canonical: url,
      },
    }
  } catch {
    return {}
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) redirect('/')

  const siteUrl = getEnv('SITE_URL') ?? '/'
  const staticProxy = getEnv('STATIC_PROXY') ?? '/static/'

  let channelInfo, post
  try {
    channelInfo = await getChannelInfo()
    post = await getChannelPost(id)
  } catch (err) {
    console.error('Failed to fetch post data:', err)
    notFound()
  }

  if (!post) notFound()

  const channel = {
    ...channelInfo,
    posts: [post],
    seo: post,
  }

  return (
    <Layout channel={channel} siteUrl={siteUrl} pathname={`/posts/${id}`}>
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
        before={false}
        after={false}
        isItem={true}
        pageHeading={post.title || channelInfo.title}
      />
    </Layout>
  )
}
