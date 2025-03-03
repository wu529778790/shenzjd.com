# shenzjd.com

## api

### 获取所有分类

GET /api/categories

### 创建新分类

POST /api/categories
Body: {
  name: string;
  icon: string;
}

### 获取单个分类

GET /api/categories/[categoryId]

### 更新分类

PATCH /api/categories/[categoryId]
Body: {
  name?: string;
  icon?: string;
}

### 删除分类

DELETE /api/categories/[categoryId]

### 获取分类下的所有站点

GET /api/categories/[categoryId]/sites

### 在分类中创建新站点

POST /api/categories/[categoryId]/sites
Body: {
  title: string;
  favicon: string;
  url: string;
}

### 获取单个站点

GET /api/categories/[categoryId]/sites/[siteId]

### 更新站点

PATCH /api/categories/[categoryId]/sites/[siteId]
Body: {
  title?: string;
  favicon?: string;
  url?: string;
}

### 删除站点

DELETE /api/categories/[categoryId]/sites/[siteId]
