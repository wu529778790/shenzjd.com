import type { MetadataRoute } from 'next'
import { getEnv } from '../lib/env'

const SITE_URL = getEnv('SITE_URL') ?? '/'
const NO_INDEX = getEnv('NO_INDEX')
const NO_FOLLOW = getEnv('NO_FOLLOW')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: NO_FOLLOW ? '' : '/',
      disallow: NO_INDEX ? '/' : undefined,
    },
    sitemap: `${SITE_URL}sitemap.xml`,
  }
}
