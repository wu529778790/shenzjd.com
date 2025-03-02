import { NextResponse } from "next/server";
import { readCategories, writeCategories } from "@/lib/category";
import { Category } from "@/types/category";

// PUT 请求处理更新分类
export async function PUT(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { name, icon } = await request.json();
    const categories = await readCategories();
    const categoryIndex = categories.findIndex(
      (category: Category) => category.id === params.categoryId
    );

    if (categoryIndex === -1) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 更新分类信息
    categories[categoryIndex] = {
      ...categories[categoryIndex],
      name,
      icon,
    };

    await writeCategories(categories);

    return NextResponse.json({
      message: "更新分类成功",
      category: categories[categoryIndex],
    });
  } catch (error) {
    console.error("更新分类失败:", error);
    return NextResponse.json({ error: "更新分类失败" }, { status: 500 });
  }
}

// DELETE 请求处理删除分类
export async function DELETE(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categories = await readCategories();
    const categoryIndex = categories.findIndex(
      (category: Category) => category.id === params.categoryId
    );

    if (categoryIndex === -1) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 删除分类
    categories.splice(categoryIndex, 1);
    await writeCategories(categories);

    return NextResponse.json({ message: "删除分类成功" });
  } catch (error) {
    console.error("删除分类失败:", error);
    return NextResponse.json({ error: "删除分类失败" }, { status: 500 });
  }
}
