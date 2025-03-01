import { NextRequest, NextResponse } from "next/server";
import {
  addSiteToCategory,
  removeSiteFromCategory,
  updateSiteInCategory,
} from "@/lib/category";

// PUT 请求处理站点更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { oldUrl, site } = await request.json();
    await updateSiteInCategory(params.categoryId, oldUrl, site);
    return NextResponse.json({ message: "站点更新成功" });
  } catch (error) {
    console.error("更新站点失败:", error);
    return NextResponse.json({ error: "更新站点失败" }, { status: 500 });
  }
}

// DELETE 请求处理站点删除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { url } = await request.json();
    await removeSiteFromCategory(params.categoryId, url);
    return NextResponse.json({ message: "站点删除成功" });
  } catch (error) {
    console.error("删除站点失败:", error);
    return NextResponse.json({ error: "删除站点失败" }, { status: 500 });
  }
}

// POST 请求处理添加新站点
export async function POST(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { sites } = await request.json();
    for (const site of sites) {
      await addSiteToCategory(params.categoryId, site);
    }
    return NextResponse.json({ message: "站点添加成功" });
  } catch (error) {
    console.error("添加站点失败:", error);
    return NextResponse.json({ error: "添加站点失败" }, { status: 500 });
  }
}
