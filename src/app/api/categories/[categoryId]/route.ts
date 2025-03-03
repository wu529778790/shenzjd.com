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
  context: { params: { categoryId: string } }
) {
  const { categoryId } = await context.params;
  try {
    const data = readData();
    const category = data.find((c) => c.id === categoryId);

    if (!category) {
      return Response.json(
        {
          error: "分类不存在",
          code: "CATEGORY_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return Response.json(category);
  } catch {
    return Response.json(
      {
        error: "获取分类失败",
        code: "CATEGORY_GET_FAILED",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { categoryId: string } }
) {
  const { categoryId } = await context.params;
  try {
    const body = await request.json();
    const validatedData = categoryUpdateSchema.parse(body);

    const data = readData();
    const categoryIndex = data.findIndex((c) => c.id === categoryId);

    if (categoryIndex === -1) {
      return Response.json(
        {
          error: "分类不存在",
          code: "CATEGORY_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // 更新分类
    const updatedCategory = {
      ...data[categoryIndex],
      ...validatedData,
    };
    data[categoryIndex] = updatedCategory;
    writeData(data);

    // 返回更新后的数据
    return Response.json({
      message: "更新成功",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("更新分类失败:", error);
    return Response.json(
      {
        error: "更新分类失败",
        code: "CATEGORY_UPDATE_FAILED",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: { categoryId: string } }
) {
  const { categoryId } = await context.params;
  try {
    const data = readData();
    const categoryIndex = data.findIndex((c) => c.id === categoryId);

    if (categoryIndex === -1) {
      return Response.json(
        {
          error: "分类不存在",
          code: "CATEGORY_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    data.splice(categoryIndex, 1);
    writeData(data);

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
