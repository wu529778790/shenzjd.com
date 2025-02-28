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

    // 提取favicon
    let favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href");

    // 处理相对路径的favicon
    if (favicon && !favicon.startsWith("http")) {
      const urlObj = new URL(url);
      favicon = favicon.startsWith("/")
        ? `${urlObj.protocol}//${urlObj.host}${favicon}`
        : `${urlObj.protocol}//${urlObj.host}/${favicon}`;
    }

    // 如果没有找到favicon，使用默认的favicon路径
    if (!favicon) {
      const urlObj = new URL(url);
      favicon = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
    }

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
