import { z } from "zod";
import { config } from "@/config";

// 定义站点数据的 Schema
const SiteSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  favicon: z.string().url(),
});

const SiteCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  sites: z.array(SiteSchema),
});

export type Site = z.infer<typeof SiteSchema>;
export type SiteCategory = z.infer<typeof SiteCategorySchema>;

const { owner, repo, branch, path } = config.github;
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

export async function getSites(): Promise<SiteCategory[]> {
  try {
    const response = await fetch(GITHUB_RAW_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch sites data");
    }

    const data = await response.json();
    return z.array(SiteCategorySchema).parse(data);
  } catch (error) {
    console.error("Error fetching sites:", error);
    return [];
  }
}
