import { NextResponse } from "next/server";
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/sites";
import { Category } from "@/types/category";

// 获取所有分类
export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("获取分类失败:", error);
    return NextResponse.json({ error: "获取分类失败" }, { status: 500 });
  }
}

// 添加新分类
export async function POST(request: Request) {
  try {
    const category: Category = await request.json();
    await addCategory(category);
    return NextResponse.json({ message: "添加分类成功" });
  } catch (error) {
    console.error("添加分类失败:", error);
    return NextResponse.json({ error: "添加分类失败" }, { status: 500 });
  }
}

// 更新分类
export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json();
    await updateCategory(id, updateData);
    return NextResponse.json({ message: "更新分类成功" });
  } catch (error) {
    console.error("更新分类失败:", error);
    return NextResponse.json({ error: "更新分类失败" }, { status: 500 });
  }
}

// 删除分类
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await deleteCategory(id);
    return NextResponse.json({ message: "删除分类成功" });
  } catch (error) {
    console.error("删除分类失败:", error);
    return NextResponse.json({ error: "删除分类失败" }, { status: 500 });
  }
}
