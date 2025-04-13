import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // 获取网页内容
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // 提取标题
    const title =
      $("title").text() || $('meta[property="og:title"]').attr("content") || "";

    // 使用 unavatar.io 获取 favicon
    const urlObj = new URL(url);
    const favicon = `https://unavatar.io/${urlObj.hostname}`;

    return NextResponse.json({
      title,
      favicon,
      url,
    });
  } catch (error) {
    console.error("解析URL时出错:", error);
    return NextResponse.json({ error: "解析URL时出错" }, { status: 500 });
  }
}
