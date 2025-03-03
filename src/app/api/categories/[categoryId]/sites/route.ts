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
  const categoryId = params.categoryId;
  if (!categoryId) {
    return NextResponse.json({ error: "分类ID不能为空" }, { status: 400 });
  }

  try {
    const { siteId, site } = await request.json();
    await updateSiteInCategory(categoryId, siteId, site);
    return NextResponse.json({ message: "站点更新成功" });
  } catch (error) {
    console.error("更新站点失败:", error);
    return NextResponse.json(
      { error: "更新站点失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE 请求处理站点删除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  const categoryId = params.categoryId;
  if (!categoryId) {
    return NextResponse.json({ error: "分类ID不能为空" }, { status: 400 });
  }

  try {
    const { siteId } = await request.json();
    await removeSiteFromCategory(categoryId, siteId);
    return NextResponse.json({ message: "站点删除成功" });
  } catch (error) {
    console.error("删除站点失败:", error);
    return NextResponse.json(
      { error: "删除站点失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST 请求处理添加新站点
export async function POST(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  const categoryId = params.categoryId;
  if (!categoryId) {
    return NextResponse.json({ error: "分类ID不能为空" }, { status: 400 });
  }

  try {
    const { sites } = await request.json();
    for (const site of sites) {
      await addSiteToCategory(categoryId, site);
    }
    return NextResponse.json({ message: "站点添加成功" });
  } catch (error) {
    console.error("添加站点失败:", error);
    return NextResponse.json(
      { error: "添加站点失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}
