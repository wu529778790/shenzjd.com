import type { NextRequest } from "next/server";
import { siteCreateSchema } from "@/lib/validations/site";
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
      return Response.json({ error: "分类不存在" }, { status: 404 });
    }

    return Response.json(category.sites);
  } catch {
    return Response.json({ error: "获取站点列表失败" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { categoryId: string } }
) {
  const { categoryId } = await context.params;
  try {
    const body = await request.json();
    const validatedData = siteCreateSchema.parse(body);

    const data = readData();
    const categoryIndex = data.findIndex((c) => c.id === categoryId);

    if (categoryIndex === -1) {
      return Response.json({ error: "分类不存在" }, { status: 404 });
    }

    const newSite = {
      ...validatedData,
      id: crypto.randomUUID(),
    };

    data[categoryIndex].sites.push(newSite);
    writeData(data);

    return Response.json(newSite, { status: 201 });
  } catch {
    return Response.json({ error: "创建站点失败" }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { categoryId: string } }
) {
  const { categoryId } = await context.params;
  try {
    const { siteId, ...updateData } = await request.json();

    const data = readData();
    const category = data.find((c) => c.id === categoryId);

    if (!category) {
      return Response.json({ error: "分类不存在" }, { status: 404 });
    }

    const siteIndex = category.sites.findIndex((s) => s.id === siteId);

    if (siteIndex === -1) {
      return Response.json({ error: "站点不存在" }, { status: 404 });
    }

    category.sites[siteIndex] = {
      ...category.sites[siteIndex],
      ...updateData,
    };

    writeData(data);
    return Response.json(category.sites[siteIndex]);
  } catch {
    return Response.json({ error: "更新站点失败" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { categoryId: string } }
) {
  const { categoryId } = await context.params;
  try {
    const { siteId } = await request.json();
    const data = readData();
    const category = data.find((c) => c.id === categoryId);

    if (!category) {
      return Response.json({ error: "分类不存在" }, { status: 404 });
    }

    const siteIndex = category.sites.findIndex((s) => s.id === siteId);

    if (siteIndex === -1) {
      return Response.json({ error: "站点不存在" }, { status: 404 });
    }

    category.sites.splice(siteIndex, 1);
    writeData(data);

    return Response.json({ message: "删除成功" });
  } catch {
    return Response.json({ error: "删除站点失败" }, { status: 500 });
  }
}
