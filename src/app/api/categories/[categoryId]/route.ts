import type { NextRequest } from "next/server";
import { categoryUpdateSchema } from "@/lib/validations/site";
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

export async function GET(
  _request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const data = readData();
    const category = data.find((c) => c.id === params.categoryId);

    if (!category) {
      return Response.json({ error: "分类不存在" }, { status: 404 });
    }

    return Response.json(category);
  } catch {
    return Response.json({ error: "获取分类失败" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = categoryUpdateSchema.parse(body);

    const data = readData();
    const categoryIndex = data.findIndex((c) => c.id === params.categoryId);

    if (categoryIndex === -1) {
      return Response.json({ error: "分类不存在" }, { status: 404 });
    }

    data[categoryIndex] = {
      ...data[categoryIndex],
      ...validatedData,
    };

    writeData(data);
    return Response.json(data[categoryIndex]);
  } catch {
    return Response.json({ error: "更新分类失败" }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const data = readData();
    const categoryIndex = data.findIndex((c) => c.id === params.categoryId);

    if (categoryIndex === -1) {
      return Response.json({ error: "分类不存在" }, { status: 404 });
    }

    data.splice(categoryIndex, 1);
    writeData(data);

    return Response.json({ message: "删除成功" });
  } catch {
    return Response.json({ error: "删除分类失败" }, { status: 500 });
  }
}
