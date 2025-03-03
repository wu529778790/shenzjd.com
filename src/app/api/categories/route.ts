import { NextResponse } from "next/server";
import { readLocalData, writeLocalData } from "@/lib/local-data";
import { Category } from "@/types/category";

// GET 请求处理
export async function GET() {
  try {
    const categories = await readLocalData();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("获取分类失败:", error);
    return NextResponse.json({ error: "获取分类失败" }, { status: 500 });
  }
}

// POST 请求处理
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const categories = await readLocalData();

    // 判断是添加分类还是添加站点
    if ("categoryId" in data) {
      // 添加站点
      const { categoryId, sites } = data;
      const categoryIndex = categories.findIndex(
        (category) => category.id === categoryId
      );

      if (categoryIndex === -1) {
        return NextResponse.json({ error: "分类不存在" }, { status: 404 });
      }

      // 添加新站点到分类
      categories[categoryIndex].sites.push(...sites);
      const success = await writeLocalData(categories);

      if (!success) {
        return NextResponse.json({ error: "更新数据失败" }, { status: 500 });
      }

      return NextResponse.json({
        message: "添加站点成功",
        category: categories[categoryIndex],
      });
    } else {
      // 添加新分类
      const newCategory = data as Category;

      // 验证必要字段
      if (!newCategory.id || !newCategory.name || !newCategory.icon) {
        return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
      }

      // 检查 ID 是否已存在
      if (categories.some((category) => category.id === newCategory.id)) {
        return NextResponse.json({ error: "分类ID已存在" }, { status: 400 });
      }

      // 确保有 sites 数组
      newCategory.sites = newCategory.sites || [];

      // 添加新分类
      categories.push(newCategory);
      const success = await writeLocalData(categories);

      if (!success) {
        return NextResponse.json({ error: "更新数据失败" }, { status: 500 });
      }

      return NextResponse.json({
        message: "添加分类成功",
        category: newCategory,
      });
    }
  } catch (error) {
    console.error("操作失败:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

// 更新分类
export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json();
    const categories = await readLocalData();
    const categoryIndex = categories.findIndex(
      (category) => category.id === id
    );

    if (categoryIndex === -1) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    categories[categoryIndex] = {
      ...categories[categoryIndex],
      ...updateData,
    };

    await writeLocalData(categories);
    return NextResponse.json({ message: "更新成功" });
  } catch (error) {
    console.error("更新分类失败:", error);
    return NextResponse.json({ error: "更新分类失败" }, { status: 500 });
  }
}

// 删除分类
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const categories = await readLocalData();

    const filteredCategories = categories.filter(
      (category) => category.id !== id
    );

    await writeLocalData(filteredCategories);
    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除分类失败:", error);
    return NextResponse.json({ error: "删除分类失败" }, { status: 500 });
  }
}
