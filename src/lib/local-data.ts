import { promises as fs } from "fs";
import path from "path";
import { Category } from "@/types";

const DATA_FILE_PATH = path.join(process.cwd(), "src/data/sites.json");

// 读取所有分类数据
export async function readLocalData(): Promise<Category[]> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("读取本地数据失败:", error);
    return [];
  }
}

// 写入所有分类数据
export async function writeLocalData(categories: Category[]): Promise<boolean> {
  try {
    await fs.writeFile(
      DATA_FILE_PATH,
      JSON.stringify(categories, null, 2),
      "utf-8"
    );
    return true;
  } catch (error) {
    console.error("写入本地数据失败:", error);
    return false;
  }
}
