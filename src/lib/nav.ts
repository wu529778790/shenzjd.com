import type { NavItem } from '../types'

export interface NavGroup {
  title: string
  items: NavItem[]
}

/**
 * Default sidebar navigation, grouped by category.
 * Overridable at runtime via the `NAVS` env var (flat `title,URL;title,URL` list).
 */
export const defaultNavGroups: NavGroup[] = [
  {
    title: '',
    items: [
      { title: '网址导航', href: 'https://navhub.shenzjd.com' },
      { title: '热门资源', href: 'https://shenzjd.com' },
      { title: '网盘搜索', href: 'https://panhub.shenzjd.com' },
      { title: '在线网盘', href: 'https://alist.shenzjd.com' },
      { title: '视频解析', href: 'https://parse.shenzjd.com' },
      { title: 'GIT 图床', href: 'https://img.shenzjd.com' },
      { title: 'GIT 短链', href: 'https://duanlian.shenzjd.com' },
      { title: '热点聚合', href: 'https://newshub.shenzjd.com' },
      { title: '必应壁纸', href: 'https://bing.shenzjd.com' },
    ],
  },
]
