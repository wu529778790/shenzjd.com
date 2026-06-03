'use client'

import { useEffect } from 'react'
import { animate, stagger } from 'animejs'

export default function Animations() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-animate]').forEach((el) => {
        el.removeAttribute('data-animate')
      })
      return
    }

    const posts = document.querySelectorAll('[data-animate="post"]')
    if (posts.length) {
      animate('[data-animate="post"]', {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 350,
        delay: stagger(50, { start: 60 }),
        ease: 'outQuad',
        onComplete() {
          posts.forEach((el) => el.removeAttribute('data-animate'))
        },
      })
    }

    const promos = document.querySelectorAll('[data-animate="promo"]')
    if (promos.length) {
      animate('[data-animate="promo"]', {
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 350,
        delay: stagger(60, { start: 150 }),
        ease: 'outQuad',
        onComplete() {
          promos.forEach((el) => el.removeAttribute('data-animate'))
        },
      })
    }
  }, [])

  return null
}
