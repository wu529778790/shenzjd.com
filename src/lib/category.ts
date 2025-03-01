import { promises as fs } from "fs";
import path from "path";
import { Category } from "@/types/category";
import { Site } from "@/types/site";

const sitesPath = path.join(process.cwd(), "src/data/sites.json");

// 获取所有分类和站点数据
export async function getAllCategories(): Promise<Category[]> {
  const data = await fs.readFile(sitesPath, "utf8");
  return JSON.parse(data);
}

// 根据ID获取特定分类
export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getAllCategories();
  return categories.find((category) => category.id === id) || null;
}

// 添加新分类
export async function addCategory(category: Category): Promise<void> {
  const categories = await getAllCategories();
  categories.push(category);
  await fs.writeFile(sitesPath, JSON.stringify(categories, null, 2));
}

// 更新分类
export async function updateCategory(
  id: string,
  updatedCategory: Partial<Category>
): Promise<void> {
  const categories = await getAllCategories();
  const index = categories.findIndex((category) => category.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updatedCategory };
    await fs.writeFile(sitesPath, JSON.stringify(categories, null, 2));
  }
}

// 删除分类
export async function deleteCategory(id: string): Promise<void> {
  const categories = await getAllCategories();
  const filteredCategories = categories.filter(
    (category) => category.id !== id
  );
  await fs.writeFile(sitesPath, JSON.stringify(filteredCategories, null, 2));
}

// 向分类添加站点
export async function addSiteToCategory(
  categoryId: string,
  site: Site
): Promise<void> {
  const categories = await getAllCategories();
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    category.sites.push(site);
    await fs.writeFile(sitesPath, JSON.stringify(categories, null, 2));
  }
}

// 从分类中删除站点
export async function removeSiteFromCategory(
  categoryId: string,
  siteUrl: string
): Promise<void> {
  const categories = await getAllCategories();
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    category.sites = category.sites.filter((site) => site.url !== siteUrl);
    await fs.writeFile(sitesPath, JSON.stringify(categories, null, 2));
  }
}

// 更新分类中的站点
export async function updateSiteInCategory(
  categoryId: string,
  oldUrl: string,
  site: Site
): Promise<void> {
  const categories = await getAllCategories();
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    const siteIndex = category.sites.findIndex((s) => s.url === oldUrl);
    if (siteIndex !== -1) {
      category.sites[siteIndex] = site;
      await fs.writeFile(sitesPath, JSON.stringify(categories, null, 2));
    }
  }
}
