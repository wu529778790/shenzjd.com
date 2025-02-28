export interface Category {
  id: string;
  name: string;
  icon: string;
  sites: string[]; // 存储该分类下的站点ID
}
