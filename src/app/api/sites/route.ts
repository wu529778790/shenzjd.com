import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Site } from "@/types/site";

interface SitesData {
  sites: Site[];
}

const dataFilePath = path.join(process.cwd(), "src/data/sites.json");

// 读取数据
async function readSitesData(): Promise<SitesData> {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data) as SitesData;
  } catch (error) {
    console.error("读取数据失败:", error);
    return { sites: [] };
  }
}

// 写入数据
async function writeSitesData(data: SitesData): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// GET 获取所有站点
export async function GET() {
  try {
    const data = await readSitesData();
    return NextResponse.json(data.sites);
  } catch (error) {
    console.error("获取数据失败:", error);
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 });
  }
}

// POST 添加新站点
export async function POST(request: Request) {
  try {
    const newSite = (await request.json()) as Site;
    const data = await readSitesData();

    data.sites.push(newSite);
    await writeSitesData(data);

    return NextResponse.json(newSite);
  } catch (error) {
    console.error("保存数据失败:", error);
    return NextResponse.json({ error: "保存数据失败" }, { status: 500 });
  }
}
