'use client'

import { useEffect, useRef, useState } from 'react'

interface LazyTelegramWidgetProps {
  channelName: string
  postId: string
}

export default function LazyTelegramWidget({ channelName, postId }: LazyTelegramWidgetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!shouldLoad) {
    return <div ref={ref} className="mt-4 min-h-[100px]" />
  }

  return (
    <div ref={ref}>
      <script
        async
        src="https://telegram.org/js/telegram-widget.js"
        data-telegram-discussion={`${channelName}/${postId}`}
        data-comments-limit="50"
        data-colorful="1"
      />
    </div>
  )
}
