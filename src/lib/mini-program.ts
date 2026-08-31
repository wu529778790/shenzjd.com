import * as cheerio from 'cheerio'

const pad = (n: number): string => String(n).padStart(2, '0')

/** 把 ISO 8601 UTC 时间格式化为本地时间 MM-DD HH:mm（首页列表用） */
export function formatListTime(datetime: string): string {
  const date = new Date(datetime)
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** 把 ISO 8601 UTC 时间格式化为本地时间 YYYY-MM-DD HH:mm（详情页用） */
export function formatDetailTime(datetime: string): string {
  const date = new Date(datetime)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * 生成首页列表摘要：
 * 1. 压缩空白（连续空白 -> 单个空格）
 * 2. 去掉标题前缀（正文自带标题，与卡片标题重复）
 * 3. 截取前 60 字
 */
export function buildDescription(text: string, title?: string): string {
  let desc = text.replace(/\s+/g, ' ').trim()
  if (title && desc.startsWith(title)) {
    desc = desc.slice(title.length).trim()
  }
  return desc.slice(0, 60)
}

/** 需要从正文中移除的无用 / 浏览器专属属性 */
const REMOVE_ATTRIBUTES = [
  'popover',
  'popovertarget',
  'popovertargetaction',
  'aria-label',
  'loading',
  'target',
  'rel',
  'title',
]

/** 图片自适应样式（小程序 rich-text 使用） */
const IMG_STYLE = 'max-width:100%;height:auto;display:block;border-radius:8px;margin:8rpx 0;'

/** 把文本节点中的换行 \n 转成 <br/> */
function convertNewlinesToBr($: cheerio.CheerioAPI, root: cheerio.Cheerio<cheerio.AnyNode>): void {
  root.contents().each((_, node) => {
    if (node.type === 'text') {
      if (node.data && node.data.includes('\n')) {
        const escaped = node.data
          .split('\n')
          .map(part => $('<span></span>').text(part).html())
          .join('<br/>')
        $(node).replaceWith(escaped)
      }
    }
    else if (node.type === 'tag') {
      convertNewlinesToBr($, $(node))
    }
  })
}

/**
 * 清洗正文 HTML，供小程序详情页直接渲染，前端不再二次加工：
 * 1. 移除弹窗结构 <div class="modal...">…</div>
 * 2. 移除 <button> 标签（保留内部 <img>）
 * 3. 移除无用 / 浏览器专属属性（popover、popovertarget、popovertargetaction、aria-label、aria-*、loading、target、rel、title）
 * 4. 移除正文里重复的标题（<i class="emoji">…</i> <b>标题</b>）
 * 5. 移除正文里的标签链接（<a href="/search/result?q=...">#标签</a>）
 * 6. 移除图片容器 <div class="image-list-container...">（保留内部 <img>）
 * 7. 给 <img> 加自适应样式并删除 width/height 属性
 * 8. 移除图片后紧跟的 <br/>
 * 9. 换行 \n -> <br/>，并压缩连续多个 <br/>（2 个以上 -> 1 个）
 */
export function cleanContentHtml(content: string, title?: string): string {
  const $ = cheerio.load(content)

  // 1. 移除弹窗结构
  $('div[class*="modal"]').remove()

  // 2. 移除 <button> 标签，保留内部 <img>
  $('button').each((_, el) => {
    $(el).replaceWith($(el).html() ?? '')
  })

  // 3. 移除无用 / 浏览器专属属性
  $('*').each((_, el) => {
    const $el = $(el)
    for (const attr of REMOVE_ATTRIBUTES) {
      $el.removeAttr(attr)
    }
    for (const attr of Object.keys($el.attr() ?? {})) {
      if (attr.startsWith('aria-')) {
        $el.removeAttr(attr)
      }
    }
  })

  // 4. 移除正文里重复的标题（<i class="emoji">…</i> <b>标题</b>）
  if (title) {
    const normalizedTitle = title.trim()
    $('b').each((_, el) => {
      const $el = $(el)
      if ($el.text().trim() === normalizedTitle) {
        const prev = $el.prev()
        if (prev.is('i.emoji')) {
          prev.remove()
        }
        $el.remove()
        return false // 只移除第一个匹配
      }
    })
  }

  // 5. 移除标签链接
  $('a').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    if (href.includes('/search/result?q=')) {
      $(el).remove()
    }
  })

  // 6. 移除图片容器，保留内部 <img>
  $('div[class*="image-list-container"]').each((_, el) => {
    $(el).replaceWith($(el).html() ?? '')
  })

  // 7. <img> 加自适应样式，删除 width/height
  $('img').each((_, el) => {
    const $el = $(el)
    $el.removeAttr('width').removeAttr('height')
    $el.attr('style', IMG_STYLE)
  })

  // 8. 移除图片后紧跟的 <br/>
  $('img').each((_, el) => {
    const next = $(el).next()
    if (next.is('br')) {
      next.remove()
    }
  })

  // 9. 换行 \n -> <br/>，压缩连续多个 <br/>
  convertNewlinesToBr($, $.root())
  let html = $.html()
  html = html.replace(/(<br\s*\/?>\s*){2,}/gi, '<br/>')

  return html
}
