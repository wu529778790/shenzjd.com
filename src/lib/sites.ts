import { getFile, updateFile } from "./github";

export interface Site {
  title: string;
  favicon: string;
  url: string;
  id: string;
}

export interface SiteCategory {
  id: string;
  name: string;
  icon: string;
  sites: Site[];
}

const SITES_FILE_PATH = "src/data/sites.json";

export async function getSites(): Promise<SiteCategory[]> {
  try {
    const file = await getFile(SITES_FILE_PATH);
    return JSON.parse(file.content);
  } catch (error) {
    console.error("Error getting sites:", error);
    return [];
  }
}

export async function updateSites(sites: SiteCategory[]): Promise<void> {
  try {
    // 直接尝试更新文件，如果文件不存在，updateFile 函数会创建新文件
    await updateFile(SITES_FILE_PATH, JSON.stringify(sites, null, 2));
  } catch (error) {
    console.error("Error updating sites:", error);
    throw error;
  }
}

export async function addSite(categoryId: string, site: Site): Promise<void> {
  const sites = await getSites();
  const categoryIndex = sites.findIndex((cat) => cat.id === categoryId);

  if (categoryIndex === -1) {
    throw new Error("Category not found");
  }

  sites[categoryIndex].sites.push(site);
  await updateSites(sites);
}

export async function updateSite(
  categoryId: string,
  siteId: string,
  updatedSite: Site
): Promise<void> {
  const sites = await getSites();
  const categoryIndex = sites.findIndex((cat) => cat.id === categoryId);

  if (categoryIndex === -1) {
    throw new Error("Category not found");
  }

  const siteIndex = sites[categoryIndex].sites.findIndex(
    (site) => site.id === siteId
  );
  if (siteIndex === -1) {
    throw new Error("Site not found");
  }

  sites[categoryIndex].sites[siteIndex] = updatedSite;
  await updateSites(sites);
}

export async function deleteSite(
  categoryId: string,
  siteId: string
): Promise<void> {
  const sites = await getSites();
  const categoryIndex = sites.findIndex((cat) => cat.id === categoryId);

  if (categoryIndex === -1) {
    throw new Error("Category not found");
  }

  sites[categoryIndex].sites = sites[categoryIndex].sites.filter(
    (site) => site.id !== siteId
  );
  await updateSites(sites);
}

export async function addCategory(category: SiteCategory): Promise<void> {
  const sites = await getSites();
  sites.push(category);
  await updateSites(sites);
}

export async function updateCategory(
  categoryId: string,
  updatedCategory: SiteCategory
): Promise<void> {
  const sites = await getSites();
  const categoryIndex = sites.findIndex((cat) => cat.id === categoryId);

  if (categoryIndex === -1) {
    throw new Error("Category not found");
  }

  sites[categoryIndex] = updatedCategory;
  await updateSites(sites);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const sites = await getSites();
  const filteredSites = sites.filter((cat) => cat.id !== categoryId);
  await updateSites(filteredSites);
}
