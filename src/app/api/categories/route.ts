import { NextRequest } from "next/server";
import { categoryCreateSchema } from "@/lib/validations/site";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Category } from "@/types";

const DATA_FILE = join(process.cwd(), "src/data/sites.json");

function readData(): Category[] {
  const data = readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

function writeData(data: Category[]) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = readData();
    return Response.json(data);
  } catch {
    return Response.json({ error: "获取分类列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = categoryCreateSchema.parse(body);

    const data = readData();
    const newCategory = {
      ...validatedData,
      sites: [],
    };

    data.push(newCategory);
    writeData(data);

    return Response.json(
      {
        message: "创建分类成功",
        data: newCategory,
      },
      { status: 201 }
    );
  } catch {
    return Response.json(
      {
        error: "创建分类失败",
        code: "CATEGORY_CREATE_FAILED",
      },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    const data = readData();
    const categoryIndex = data.findIndex(
      (category: Category) => category.id === id
    );

    if (categoryIndex === -1) {
      return Response.json({ error: "分类不存在" }, { status: 404 });
    }

    data[categoryIndex] = {
      ...data[categoryIndex],
      ...updateData,
    };

    writeData(data);
    return Response.json({ message: "更新成功" });
  } catch {
    return Response.json({ error: "更新分类失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const data = readData();

    // 先检查分类是否存在
    const categoryIndex = data.findIndex((category) => category.id === id);
    if (categoryIndex === -1) {
      return Response.json(
        {
          error: "分类不存在",
          code: "CATEGORY_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // 删除分类
    data.splice(categoryIndex, 1);
    writeData(data);

    // 返回 204 No Content，表示删除成功
    return new Response(null, { status: 204 });
  } catch {
    return Response.json(
      {
        error: "删除分类失败",
        code: "CATEGORY_DELETE_FAILED",
      },
      { status: 500 }
    );
  }
}
