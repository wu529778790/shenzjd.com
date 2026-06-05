import type { NavItem } from '../types'

export function parseNavs(raw: string | undefined): NavItem[] {
  return (raw || '')
    .split(';')
    .filter(Boolean)
    .map((link) => {
      const [title = '', href = ''] = link.split(',')
      return { title, href }
    })
}
