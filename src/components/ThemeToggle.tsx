'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const icons = {
  dark: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  light: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  system: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
}

const labels: Record<Theme, string> = {
  dark: 'Light mode',
  light: 'System preference',
  system: 'Dark mode',
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function applyTheme() {
      const isDark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches)
      document.documentElement.classList.toggle('dark', isDark)
    }

    applyTheme()

    const handler = () => {
      if (theme === 'system') applyTheme()
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme, mounted])

  function cycleTheme() {
    const next: Record<Theme, Theme> = {
      system: 'dark',
      dark: 'light',
      light: 'system',
    }
    const newTheme = next[theme]
    setTheme(newTheme)
    if (newTheme === 'system') {
      localStorage.removeItem('theme')
    } else {
      localStorage.setItem('theme', newTheme)
    }
  }

  if (!mounted) {
    return (
      <button
        className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)]"
        aria-label="Toggle theme"
      >
        <span className="inline-block h-4 w-4" />
      </button>
    )
  }

  return (
    <button
      onClick={cycleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted)] transition-all duration-200 hover:bg-[var(--color-line)] hover:text-[var(--color-heading)]"
      title={labels[theme]}
      aria-label={labels[theme]}
    >
      {icons[theme]}
    </button>
  )
}
