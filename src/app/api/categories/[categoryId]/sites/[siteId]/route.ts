import { NextRequest } from "next/server";
import { siteUpdateSchema } from "@/lib/validations/site";
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
  request: NextRequest,
  context: { params: { categoryId: string; siteId: string } }
) {
  try {
    const params = await context.params;
    const { categoryId, siteId } = params;
    const data = readData();
    const category = data.find((c) => c.id === categoryId);

    if (!category) {
      return Response.json({ error: "分类不存在" }, { status: 404 });
    }

    const site = category.sites.find((s) => s.id === siteId);

    if (!site) {
      return Response.json({ error: "站点不存在" }, { status: 404 });
    }

    return Response.json(site);
  } catch {
    return Response.json({ error: "获取站点失败" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { categoryId: string; siteId: string } }
) {
  try {
    const params = await context.params;
    const { categoryId, siteId } = params;
    const body = await request.json();
    const validatedData = siteUpdateSchema.parse(body);

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
      ...validatedData,
    };

    writeData(data);
    return Response.json(category.sites[siteIndex]);
  } catch {
    return Response.json({ error: "更新站点失败" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { categoryId: string; siteId: string } }
) {
  try {
    const params = await context.params;
    const { categoryId, siteId } = params;
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
