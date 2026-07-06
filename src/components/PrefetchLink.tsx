'use client'

import { useCallback, useRef } from 'react'

interface PrefetchLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
}

/**
 * A link that prefetches its target on pointer hover or touch start.
 * Uses <link rel="prefetch"> to warm the browser cache, making
 * navigation feel near-instant.
 */
export default function PrefetchLink({ href, children, ...props }: PrefetchLinkProps) {
  const prefetchedRef = useRef(false)

  const prefetch = useCallback(() => {
    if (prefetchedRef.current || !href) return
    prefetchedRef.current = true
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'document'
    link.crossOrigin = 'anonymous'
    link.href = href
    document.head.appendChild(link)
  }, [href])

  return (
    <a
      href={href}
      onPointerEnter={prefetch}
      onTouchStart={prefetch}
      {...props}
    >
      {children}
    </a>
  )
}
