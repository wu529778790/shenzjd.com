import sharp from 'sharp'
import { LRUCache } from 'lru-cache'

/**
 * Semaphore to limit concurrent sharp image transformations.
 * sharp/libvips uses ~5-10x source image size in memory during encode,
 * so unbounded concurrency causes OOM spikes when many images hit at once.
 */
class Semaphore {
  private running = 0
  private queue: (() => void)[] = []

  constructor(private readonly max: number) {}

  async acquire(): Promise<void> {
    if (this.running < this.max) {
      this.running++
      return
    }
    await new Promise<void>(resolve => this.queue.push(resolve))
    this.running++
  }

  release(): void {
    this.running--
    const next = this.queue.shift()
    if (next) next()
  }
}

// Cap at 2 concurrent sharp ops — libvips is threaded internally anyway,
// and going higher just inflates peak memory without meaningful throughput gain.
const sharpSemaphore = new Semaphore(2)

const TARGET_WHITELIST = [
  't.me',
  'telegram.org',
  'telegram.me',
  'telegram.dog',
  'cdn-telegram.org',
  'telesco.pe',
  'yandex.ru',
]

const PROXY_TIMEOUT = 10_000
const RATE_LIMIT_WINDOW_MS = 60_000 // 60 seconds
const RATE_LIMIT_MAX_REQUESTS = 100

const IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'image/bmp',
])

type OutputFormat = 'avif' | 'webp' | 'original'

const rateLimitMap = new Map<string, { count: number, resetAt: number }>()

// Periodic cleanup to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetAt) rateLimitMap.delete(key)
  }
}, RATE_LIMIT_WINDOW_MS).unref()

/** Cache for transformed image buffers — max 30 entries, no TTL (images are immutable) */
const imageCache = new LRUCache<string, { data: Buffer, contentType: string }>({
  max: 30,
})

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
  )
}

function checkRateLimit(request: Request): boolean {
  const ip = getClientIp(request)
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return false

  entry.count++
  return true
}

/**
 * Negotiate the best output image format based on the client's Accept header.
 * AVIF offers the best compression, WebP is a good fallback, original as last resort.
 */
function negotiateImageFormat(accept: string | null): OutputFormat {
  if (!accept) return 'original'
  if (accept.includes('image/avif')) return 'avif'
  if (accept.includes('image/webp')) return 'webp'
  return 'original'
}

function outputContentType(format: OutputFormat, original: string): string {
  if (format === 'avif') return 'image/avif'
  if (format === 'webp') return 'image/webp'
  return original
}

/**
 * Transform an image buffer using sharp: convert to optimal format and optionally resize.
 * Returns the original buffer if transformation fails.
 */
async function transformImage(
  inputBuffer: Buffer,
  format: OutputFormat,
  width?: number,
): Promise<Buffer> {
  let pipeline = sharp(inputBuffer)

  // Resize if width is specified and valid
  if (width && width > 0 && width <= 2000) {
    pipeline = pipeline.resize(width, null, { withoutEnlargement: true })
  }

  if (format === 'avif') {
    // effort 2: ~2x faster than default (4) with only marginally larger files
    pipeline = pipeline.avif({ quality: 70, effort: 2 })
  } else if (format === 'webp') {
    pipeline = pipeline.webp({ quality: 80 })
  }

  return pipeline.toBuffer()
}

export function resolveStaticProxyTarget(rawTarget: string): URL {
  const normalizedTarget = rawTarget.startsWith('//') ? `https:${rawTarget}` : rawTarget
  return new URL(normalizedTarget)
}

export function isStaticProxyWhitelisted(target: URL): boolean {
  return TARGET_WHITELIST.some(domain =>
    target.hostname === domain || target.hostname.endsWith(`.${domain}`),
  )
}

export async function createStaticProxyResponse(request: Request, rawTarget: string): Promise<Response> {
  if (!checkRateLimit(request)) {
    return new Response('Too many requests', { status: 429 })
  }

  const target = resolveStaticProxyTarget(rawTarget)
  if (!isStaticProxyWhitelisted(target)) {
    return new Response('Proxy target not allowed', { status: 403 })
  }

  // Parse optional width parameter for responsive images
  const requestUrl = new URL(request.url)
  const targetWidth = Number(requestUrl.searchParams.get('w')) || undefined

  // Negotiate output format
  const accept = request.headers.get('accept')
  const outputFormat = negotiateImageFormat(accept)

  // Build cache key: URL + format + width
  const cacheKey = `${target.toString()}|${outputFormat}|${targetWidth || ''}`

  // Check image transform cache first
  const cached = imageCache.get(cacheKey)
  if (cached) {
    return new Response(new Uint8Array(cached.data), {
      status: 200,
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=604800, s-maxage=604800',
        'Vary': 'Accept',
      },
    })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT)

  try {
    // Only send User-Agent — do NOT forward client headers to upstream
    const response = await fetch(target.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    })

    const upstreamContentType = response.headers.get('content-type') || ''
    const isImage = IMAGE_CONTENT_TYPES.has(upstreamContentType.split(';')[0].trim().toLowerCase())

    // Only transform raster images (skip SVG, already-optimized formats, and non-images)
    const shouldTransform = isImage
      && outputFormat !== 'original'
      && !upstreamContentType.includes('svg')
      && !upstreamContentType.includes('gif')

    if (shouldTransform) {
      try {
        const inputBuffer = Buffer.from(await response.arrayBuffer())

        // Bound concurrency so peak memory stays predictable
        let outputBuffer: Buffer
        await sharpSemaphore.acquire()
        try {
          outputBuffer = await transformImage(inputBuffer, outputFormat, targetWidth)
        }
        finally {
          sharpSemaphore.release()
        }

        const contentType = outputContentType(outputFormat, upstreamContentType)

        // Store in transform cache
        imageCache.set(cacheKey, { data: outputBuffer, contentType })

        return new Response(new Uint8Array(outputBuffer), {
          status: response.status,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=604800, s-maxage=604800',
            'Vary': 'Accept',
          },
        })
      }
      catch {
        // Transformation failed — fall through to serve original
      }
    }

    // Non-image, SVG, GIF, or transform failed — pass through original
    const headers = new Headers(response.headers)
    headers.set('Cache-Control', 'public, max-age=604800, s-maxage=604800')
    headers.delete('set-cookie')

    return new Response(response.body, { status: response.status, headers })
  }
  catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return new Response('Proxy timeout', { status: 504 })
    }
    throw err
  }
  finally {
    clearTimeout(timeout)
  }
}
