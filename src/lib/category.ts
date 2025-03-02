import { promises as fs } from "fs";
import path from "path";
import { Category } from "@/types/category";
import { Site } from "@/types/site";

const sitesPath = path.join(process.cwd(), "src/data/sites.json");

// 读取所有分类数据
export async function readCategories(): Promise<Category[]> {
  const data = await fs.readFile(sitesPath, "utf8");
  return JSON.parse(data);
}

// 写入所有分类数据
export async function writeCategories(categories: Category[]): Promise<void> {
  await fs.writeFile(sitesPath, JSON.stringify(categories, null, 2));
}

// 获取所有分类和站点数据
export async function getAllCategories(): Promise<Category[]> {
  return readCategories();
}

// 根据ID获取特定分类
export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await readCategories();
  return categories.find((category) => category.id === id) || null;
}

// 添加新分类
export async function addCategory(category: Category): Promise<void> {
  const categories = await readCategories();
  categories.push(category);
  await writeCategories(categories);
}

// 更新分类
export async function updateCategory(
  id: string,
  updatedCategory: Partial<Category>
): Promise<void> {
  const categories = await readCategories();
  const index = categories.findIndex((category) => category.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updatedCategory };
    await writeCategories(categories);
  }
}

// 删除分类
export async function deleteCategory(id: string): Promise<void> {
  const categories = await readCategories();
  const filteredCategories = categories.filter(
    (category) => category.id !== id
  );
  await writeCategories(filteredCategories);
}

// 向分类添加站点
export async function addSiteToCategory(
  categoryId: string,
  site: Site
): Promise<void> {
  const categories = await readCategories();
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    category.sites.push(site);
    await writeCategories(categories);
  }
}

// 从分类中删除站点
export async function removeSiteFromCategory(
  categoryId: string,
  siteUrl: string
): Promise<void> {
  const categories = await readCategories();
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    category.sites = category.sites.filter((site) => site.url !== siteUrl);
    await writeCategories(categories);
  }
}

// 更新分类中的站点
export async function updateSiteInCategory(
  categoryId: string,
  oldUrl: string,
  site: Site
): Promise<void> {
  const categories = await readCategories();
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    const siteIndex = category.sites.findIndex((s) => s.url === oldUrl);
    if (siteIndex !== -1) {
      category.sites[siteIndex] = site;
      await writeCategories(categories);
    }
  }
}
