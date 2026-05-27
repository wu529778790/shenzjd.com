import { createStaticProxyResponse } from '../../../lib/proxy'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ url: string[] }> },
) {
  try {
    const { url } = await params
    const rawTarget = url.join('/') + new URL(request.url).search
    return await createStaticProxyResponse(request, rawTarget)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(message, { status: 500 })
  }
}
