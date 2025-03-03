import { Category } from "@/types";
import { Site } from "@/types";
import { readLocalData, writeLocalData } from "./local-data";

// 读取所有分类数据
export async function readCategories(): Promise<Category[]> {
  return readLocalData();
}

// 写入所有分类数据
export async function writeCategories(categories: Category[]): Promise<void> {
  const success = await writeLocalData(categories);
  if (!success) {
    throw new Error("Failed to update categories");
  }
}

// 获取所有分类和站点数据
export async function getAllCategories(): Promise<Category[]> {
  return readCategories();
}

// 获取单个分类
export async function getCategory(id: string): Promise<Category | undefined> {
  const categories = await readCategories();
  return categories.find((category) => category.id === id);
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
  siteId: string
): Promise<void> {
  const categories = await readCategories();
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    category.sites = category.sites.filter((site) => site.id !== siteId);
    await writeCategories(categories);
  }
}

// 更新分类中的站点
export async function updateSiteInCategory(
  categoryId: string,
  siteId: string,
  site: Site
): Promise<void> {
  const categories = await readCategories();
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    const siteIndex = category.sites.findIndex((s) => s.id === siteId);
    if (siteIndex !== -1) {
      category.sites[siteIndex] = { ...site, id: siteId };
      await writeCategories(categories);
    }
  }
}
