import { z } from "zod";

export const siteSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  favicon: z.string().url("请输入有效的图标URL"),
  url: z.string().url("请输入有效的网站URL"),
  id: z.string(),
});

export const siteCreateSchema = siteSchema.omit({ id: true });
export const siteUpdateSchema = siteCreateSchema.partial();

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "分类名称不能为空"),
  icon: z.string().min(1, "图标不能为空"),
  sites: z.array(siteSchema),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "分类名称不能为空"),
  icon: z.string().min(1, "图标不能为空"),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();
