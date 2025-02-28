import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Category } from "@/types/category";

const sitesPath = path.join(process.cwd(), "src/data/sites.json");

// 读取所有分类数据
async function readCategories(): Promise<Category[]> {
  const data = await fs.readFile(sitesPath, "utf8");
  return JSON.parse(data);
}

// 写入分类数据
async function writeCategories(categories: Category[]): Promise<void> {
  await fs.writeFile(sitesPath, JSON.stringify(categories, null, 2));
}

// 获取所有分类
export async function GET() {
  try {
    const categories = await readCategories();
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
    const categories = await readCategories();

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
      await writeCategories(categories);

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
      await writeCategories(categories);

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
    const categories = await readCategories();
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

    await writeCategories(categories);
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
    const categories = await readCategories();

    const filteredCategories = categories.filter(
      (category) => category.id !== id
    );

    await writeCategories(filteredCategories);
    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除分类失败:", error);
    return NextResponse.json({ error: "删除分类失败" }, { status: 500 });
  }
}
