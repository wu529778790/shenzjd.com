import * as cheerio from 'cheerio'

/**
 * 按北京时间（Asia/Shanghai）取各时间字段。
 * 用 Intl 而非 getHours() 等本地时区方法：部署环境时区是 UTC（如 Cloudflare Workers），
 * 用本地时区会返回 UTC 时间。
 */
const BEIJING_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function formatBeijing(datetime: string): { date: string, time: string } {
  const parts = Object.fromEntries(
    BEIJING_FORMATTER.formatToParts(new Date(datetime)).map(p => [p.type, p.value]),
  )
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  }
}

/** 把 ISO 8601 UTC 时间格式化为北京时间 MM-DD HH:mm（首页列表用） */
export function formatListTime(datetime: string): string {
  const { date, time } = formatBeijing(datetime)
  return `${date.slice(5)} ${time}`
}

/** 把 ISO 8601 UTC 时间格式化为北京时间 YYYY-MM-DD HH:mm（详情页用） */
export function formatDetailTime(datetime: string): string {
  const { date, time } = formatBeijing(datetime)
  return `${date} ${time}`
}

/** 匹配 emoji（含变体选择符、ZWJ 序列、肤色修饰符、键帽等） */
const EMOJI_REGEX = /\p{Extended_Pictographic}/gu

/** 去掉字符串中的 emoji，用于标题与正文的"去前缀"匹配（标题可能带 emoji，正文可能不带） */
function stripEmoji(text: string): string {
  return text.replace(EMOJI_REGEX, '').replace(/\s+/g, ' ').trim()
}

/**
 * 生成首页列表摘要：
 * 1. 压缩空白（连续空白 -> 单个空格）
 * 2. 去掉标题前缀（正文自带标题，与卡片标题重复）
 * 3. 截取前 60 字
 *
 * 标题可能带 emoji（如"🧠 即梦AI视频CLI工作流"），而正文 text 里自定义 emoji
 * 被渲染成 <img>，.text() 取不到，导致直接 startsWith(title) 匹配失败。
 * 因此先按原样匹配，失败后再去掉 emoji 匹配。
 */
export function buildDescription(text: string, title?: string): string {
  let desc = text.replace(/\s+/g, ' ').trim()
  if (title) {
    const trimmedTitle = title.trim()
    if (desc.startsWith(trimmedTitle)) {
      desc = desc.slice(trimmedTitle.length).trim()
    }
    else {
      const strippedTitle = stripEmoji(trimmedTitle)
      if (strippedTitle && desc.startsWith(strippedTitle)) {
        desc = desc.slice(strippedTitle.length).trim()
      }
    }
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
 * 8. 换行 \n -> <br/>（需在移除图片后 <br/> 之前，因为图片后常是 \n 文本节点）
 * 9. 移除图片后紧跟的 <br/>（跳过空白文本节点）
 * 10. 压缩连续多个 <br/>（2 个以上 -> 1 个）
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
    const trimmedTitle = title.trim()
    const strippedTitle = stripEmoji(trimmedTitle)
    $('b').each((_, el) => {
      const $el = $(el)
      const text = $el.text().trim()
      // 标题可能带 emoji，正文 <b> 可能不带，做 emoji 无关比较
      if (text === trimmedTitle || (strippedTitle && stripEmoji(text) === strippedTitle)) {
        // 标题前可能隔着空白文本节点，用 prevAll 找最近的 <i class="emoji">
        const prevEmoji = $el.prevAll('i.emoji').first()
        if (prevEmoji.length) {
          prevEmoji.remove()
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

  // 8. 换行 \n -> <br/>（先于"移除图片后 <br/>"，因为图片后常是 \n 文本节点）
  convertNewlinesToBr($, $.root())

  // 9. 移除图片后所有紧跟的 <br/> 与空白文本节点，避免产生空白行。
  //    图片后常是"换行 + 缩进 + 换行"的空白序列，仅删第一个 <br/> 不够，
  //    剩余的 <br/> 会被第 10 步压缩成一个，仍会留下空白行，因此要全部删掉。
  //    注意：cheerio 的 .next() 会跳过文本节点，这里改用原生兄弟节点遍历，
  //    才能同时删掉夹在 <br/> 之间的空白文本节点。
  $('img').each((_, el) => {
    let node = el.nextSibling
    while (node) {
      const next = node.nextSibling
      if (node.type === 'tag' && node.name === 'br') {
        $(node).remove()
      }
      else if (node.type === 'text' && (node.data ?? '').trim() === '') {
        $(node).remove()
      }
      else {
        break
      }
      node = next
    }
  })

  // 10. 压缩连续多个 <br/>
  let out = $.html()
  out = out.replace(/(<br\s*\/?>\s*){2,}/gi, '<br/>')

  return out
}
