import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SearchRedirect({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  if (q) {
    redirect(`/search/${encodeURIComponent(q)}`)
  }
  redirect('/')
}
