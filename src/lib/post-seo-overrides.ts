import type { SeoMeta } from '../types'

/**
 * 手动 SEO 覆盖表（键 = 帖子 ID，即 `/posts/<id>` 里的 id）。
 *
 * 自动推导的标题与摘要来自频道原文，个别帖子会和真实搜索意图错位。
 * 这里只做定点修正，不承担日常正文维护；清空即回到自动推导。
 */
export const POST_SEO_OVERRIDES: Record<string, SeoMeta> = {
  /**
   * GSC 2026-10-18~11-14：「品技」「品技论坛」「品技論壇」「品技网」「tekqart」
   * 合计 1336 展现 / 11 点击 / CTR 0.8% / 平均排名 6.3——全站最大漏损页。
   * 原自动标题是「…全攻略」长句，而这类查询要的是「地址/入口」，
   * 标题与摘要对齐意图后才有机会吃到排名 6 的点击。
   */
  3835: {
    title: '品技论坛（Tekqart）入口地址与 NS 游戏资源说明',
    text: '品技论坛 tekqart.org 是 Switch（NS）游戏资源分享社区，提供免费 NS 游戏下载与解锁资源。本页收录该论坛的最新入口地址，可直接跳转访问。',
  },
}

export function getPostSeoOverride(id: string): SeoMeta | undefined {
  return Object.hasOwn(POST_SEO_OVERRIDES, id) ? POST_SEO_OVERRIDES[id] : undefined
}
