import type { AnyNode, CheerioAPI } from 'cheerio'
import * as cheerio from 'cheerio'

/**
 * 小程序接口外链脱敏（微信审核合规用）。
 *
 * 只过滤"以链接 / 正文文字形式展示出来"的站外 http(s) 链接；图片、视频等媒体资源
 * 的 http(s) 地址（<img src>、<video poster> 等）是资源不是链接，一律原样保留：
 *  - GitHub 仓库链接改写为纯文本「GitHub：owner/repo」（保留仓库信息）
 *  - 其余 http(s) 链接 / www. 裸域名（<a> 链接能力 + 正文裸 URL）一律删除
 *  - 正文按 <br> 拆行，删链后整行变空的直接剔除；图片行不算空，保留
 *
 * 审核通过后可用环境变量关闭脱敏、恢复原始链接（见 isLinkSanitizationEnabled）。
 */

/** 外链脱敏开关的环境变量名 */
export const MINI_PROGRAM_SANITIZE_ENV = 'MINI_PROGRAM_SANITIZE_LINKS'

/**
 * 外链脱敏是否开启。
 * 默认开启（审核期合规需要）；审核通过后设置 MINI_PROGRAM_SANITIZE_LINKS=false（或 0/no/off）
 * 即可关闭脱敏、恢复正常链接。只有显式传 false 才关闭，误写/漏写都按开启处理（更安全）。
 */
export function isLinkSanitizationEnabled(raw: string | undefined): boolean {
  const value = (raw ?? '').trim().toLowerCase()
  if (!value) {
    return true
  }
  return !['false', '0', 'no', 'off', 'disabled'].includes(value)
}

/** 有效性判断：脱敏后不含任何字母/数字/汉字（只剩表情、箭头、标点）视为空内容 */
export function hasMeaningfulContent(text: string): boolean {
  return /[\w\u4E00-\u9FFF]/u.test(text)
}

/** GitHub 仓库名部分（owner/repo，repo 允许 . _ -，用于剥离深层路径与 .git） */
const GITHUB_REPO_BODY = '[\\w.-]+'

/** URL 主体允许字符：排除空白、HTML 尖括号、引号及中文标点，避免把句末标点一并吞掉 */
const URL_TAIL_BODY = '[^\\s<>"\'`，。！？；：、（）【】《》〈〉「」『』〖〗…—·～]+'

/**
 * 文本里的 GitHub 仓库地址（允许 http/https、www. 前缀；跟随 /tree /blob 等路径与 ? # 参数，
 * 匹配时整体吞掉，替换时只保留 owner/repo）。前置负向断言防止命中 xxx.github.com 之类子域。
 */
const GITHUB_URL_REGEX = new RegExp(
  `(?<![\\w.-])(?:https?://)?(?:www\\.)?github\\.com/([a-z0-9-]+)/(${GITHUB_REPO_BODY})(?:[/?#]${URL_TAIL_BODY})?`,
  'gi',
)

/** 站外 http(s) 链接 */
const HTTP_URL_REGEX = new RegExp(`https?://${URL_TAIL_BODY}`, 'gi')

/** www. 开头的裸域名 */
const WWW_BARE_URL_REGEX = new RegExp(`(?<![\\w.-])www\\.${URL_TAIL_BODY}`, 'gi')

/** 从字符串起始处解析 GitHub 仓库（用于 <a href>） */
function matchGithubRepo(href: string): { owner: string, repo: string } | null {
  const match = new RegExp(
    `^(?:https?://)?(?:www\\.)?github\\.com/([a-z0-9-]+)/(${GITHUB_REPO_BODY})`,
    'i',
  ).exec(href.trim())
  if (!match) {
    return null
  }
  return { owner: match[1], repo: stripGitSuffix(match[2]) }
}

/** 剥离仓库末尾的 .git 后缀 */
function stripGitSuffix(repo: string): string {
  return repo.replace(/\.git$/i, '')
}

function githubLabel({ owner, repo }: { owner: string, repo: string }): string {
  return `GitHub：${owner}/${repo}`
}

/** 移除一段纯文本里的站外链接：GitHub 改写为纯文本，其余 URL / www 裸域名删除 */
function scrubUrls(text: string): string {
  return text
    .replace(GITHUB_URL_REGEX, (_match, owner: string, repo: string) => githubLabel({ owner, repo: stripGitSuffix(repo) }))
    .replace(HTTP_URL_REGEX, '')
    .replace(WWW_BARE_URL_REGEX, '')
}

/**
 * 列表摘要（desc）用的纯文本脱敏：删/改写链接后压缩空白并去首尾空白。
 * 判空由调用方（buildSanitizedDescription）在最终文本上做。
 */
export function sanitizeLinksInText(text: string): string {
  return scrubUrls(text).replace(/\s+/g, ' ').trim()
}

// ---------------------------------------------------------------------------
// HTML（正文 content_html）处理
// ---------------------------------------------------------------------------

/** 判定 <a href> 是否为站外链接（http(s)、协议相对、www 裸地址） */
function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || /^\/\//.test(href) || /^www\./i.test(href)
}

/**
 * 处理 <a>：GitHub 改写为纯文本；其余站外链接去掉链接能力（保留可见内容）。
 * 只过滤"以链接/文字形式展示"的站外链接：图片/视频的 http(s) 地址是资源不是链接，
 * 不在此列——链接内部裹着图片（如链接预览卡）时解包保图，媒体 src 原样展示。
 */
function sanitizeAnchors($: CheerioAPI): void {
  for (const element of $('a').toArray()) {
    const $a = $(element)
    const href = $a.attr('href')?.trim() ?? ''
    if (!href) {
      continue
    }

    const github = matchGithubRepo(href)
    // 链接内若带图片/视频等媒体，不能整条替换丢图：一律解包保留，URL 文本交给后续文本清理处理
    const hasMedia = $a.find('img, video, audio, iframe, svg, canvas').length > 0

    if (github && !hasMedia) {
      // 整个链接改写成纯文本「GitHub：owner/repo」，不再可点击
      $a.replaceWith(githubLabel(github))
      continue
    }

    if (isExternalHref(href)) {
      // 站外链接去掉链接能力、保留可见内容（含其中的图片）；
      // 若可见文字本身是 URL，接下来文本节点清理会把它删掉 / 改写成 GitHub 文本
      $a.replaceWith($a.contents())
    }
    // 站内相对链接（如回复框 /posts/N、已被 cleanContentHtml 移除的搜索链接）不属于站外导流，保持原样
  }
}

/** 清理文本节点里残留的裸 URL（原文直接粘贴的网址），同样按 GitHub 改写 / 其余删除处理 */
function scrubTextNodeUrls($: CheerioAPI): void {
  const walk = (node: AnyNode): void => {
    if (node.type === 'text') {
      const data = node.data
      if (data) {
        node.data = scrubUrls(data).replace(/\s+/g, ' ')
      }
      return
    }
    // 代码块里的 URL 是代码内容而非外链，跳过以免破坏代码示例
    if (node.type === 'tag' && (node.name === 'pre' || node.name === 'code')) {
      return
    }
    for (const child of $(node).contents().toArray()) {
      walk(child)
    }
  }
  walk($.root()[0])
}

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

/** 图片/音视频等媒体标签：所在行不算空，正常保留 */
const MEDIA_TAGS = new Set(['img', 'video', 'audio', 'source', 'iframe', 'svg', 'canvas'])

function isBrNode(node: AnyNode): boolean {
  return node.type === 'tag' && node.name === 'br'
}

/** 节点内（含子孙）是否包含媒体 */
function nodeContainsMedia(node: AnyNode): boolean {
  if (node.type !== 'tag') {
    return false
  }
  if (MEDIA_TAGS.has(node.name)) {
    return true
  }
  return (node.children ?? []).some(nodeContainsMedia)
}

/** 节点（含子孙）的纯文本 */
function nodeText(node: AnyNode): string {
  if (node.type === 'text') {
    return node.data ?? ''
  }
  if (node.type === 'tag') {
    return (node.children ?? []).map(nodeText).join('')
  }
  return ''
}

function isMediaNode(node: AnyNode): boolean {
  return node.type === 'tag' && MEDIA_TAGS.has(node.name)
}

/** 规整容器内残留的 <br>：去掉行首/行尾、连续多余的、以及紧邻媒体的 */
function normalizeBrs($: CheerioAPI, container: AnyNode): void {
  const snapshot = $(container).contents().toArray()
  const drop = new Set<AnyNode>()
  const kept: AnyNode[] = []
  let pendingBr: AnyNode | null = null

  for (const node of snapshot) {
    if (isBrNode(node)) {
      if (pendingBr) {
        drop.add(pendingBr) // 连续多个 <br> 只留一个
      }
      pendingBr = node
      continue
    }

    if (pendingBr) {
      const prev = kept[kept.length - 1]
      // 行首 <br>、上一段是媒体、下一段是媒体时都不需要这个 <br>
      if (kept.length > 0 && prev && !isMediaNode(prev) && !isMediaNode(node)) {
        kept.push(pendingBr)
      }
      else {
        drop.add(pendingBr)
      }
      pendingBr = null
    }
    kept.push(node)
  }
  if (pendingBr) {
    drop.add(pendingBr) // 行尾 <br> 去掉
  }

  for (const node of drop) {
    $(node).remove()
  }
}

/**
 * 删除容器内"删链后变空"的行：
 * 按 <br> 把直接子节点拆成行，整行不含任何字母/数字/汉字、且不含图片等媒体时，整行剔除。
 */
function cleanupContainer($: CheerioAPI, container: AnyNode): void {
  const snapshot = $(container).contents().toArray()

  const rows: AnyNode[][] = []
  let current: AnyNode[] = []
  for (const child of snapshot) {
    if (isBrNode(child)) {
      rows.push(current)
      current = []
    }
    else {
      current.push(child)
    }
  }
  rows.push(current)

  for (const row of rows) {
    if (!row.length) {
      continue
    }
    const hasMedia = row.some(nodeContainsMedia)
    const text = row.map(nodeText).join('')
    if (!hasMedia && !hasMeaningfulContent(text)) {
      for (const node of row) {
        $(node).remove()
      }
    }
  }

  normalizeBrs($, container)

  // 整个容器内容被清空时（如 <p> 里只剩一条被删的链接），把空容器本身也剔除
  if (
    container.type === 'tag'
    && $(container).contents().length === 0
    && !VOID_TAGS.has(container.name)
    && !MEDIA_TAGS.has(container.name)
  ) {
    $(container).remove()
  }
}

/** 自底向上遍历：先清理子孙容器，再清理本层空行 */
function cleanupTree($: CheerioAPI, node: AnyNode): void {
  if (node.type !== 'tag' && node.type !== 'root') {
    return
  }
  if (node.type === 'tag' && (VOID_TAGS.has(node.name) || node.name === 'pre' || node.name === 'code')) {
    return
  }
  for (const child of $(node).contents().toArray()) {
    if (child.type === 'tag') {
      cleanupTree($, child)
    }
  }
  cleanupContainer($, node)
}

/**
 * 正文 HTML 脱敏（content_html 用）：
 *  - <a href>：GitHub 改写为「GitHub：owner/repo」纯文本；其余站外链接去掉链接能力
 *  - 文本节点残留裸 URL：删除（代码块除外）
 *  - 删链后整行变空的 <br> 行整行剔除；图片行正常保留
 * 返回处理后的 HTML（输入无链接/无 URL 时结果与输入基本一致，幂等）。
 */
export function sanitizeLinksInHtml(html: string): string {
  if (!html) {
    return html
  }

  const $ = cheerio.load(html)
  sanitizeAnchors($)
  scrubTextNodeUrls($)
  cleanupTree($, $.root()[0])

  const out = $.html()
  // 收尾：任何残留的连续 <br>（含跨容器）再压成单个
  return out.replace(/(<br\s*\/?>\s*){2,}/gi, '<br/>')
}
