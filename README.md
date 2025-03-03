# shenzjd.com

## API 文档

### 站点管理 API

#### 获取所有站点数据

```http
GET /api/sites
```

返回所有分类和站点数据。

**响应示例：**

```json
[
  {
    "id": "default",
    "name": "默认分类",
    "icon": "home",
    "sites": [
      {
        "title": "示例站点",
        "favicon": "https://example.com/favicon.ico",
        "url": "https://example.com",
        "id": "1234567890"
      }
    ]
  }
]
```

#### 添加站点

```http
POST /api/sites
```

在指定分类中添加新站点。

**请求体：**

```json
{
  "type": "addSite",
  "data": {
    "categoryId": "default",
    "site": {
      "title": "新站点",
      "favicon": "https://example.com/favicon.ico",
      "url": "https://example.com",
      "id": "1234567890"
    }
  }
}
```

#### 更新站点

```http
PUT /api/sites
```

更新指定分类中的站点信息。

**请求体：**

```json
{
  "type": "updateSite",
  "data": {
    "categoryId": "default",
    "siteId": "1234567890",
    "site": {
      "title": "更新后的标题",
      "favicon": "https://example.com/new-favicon.ico",
      "url": "https://example.com/new-url",
      "id": "1234567890"
    }
  }
}
```

#### 删除站点

```http
DELETE /api/sites
```

删除指定分类中的站点。

**请求体：**

```json
{
  "type": "deleteSite",
  "data": {
    "categoryId": "default",
    "siteId": "1234567890"
  }
}
```

#### 添加分类

```http
POST /api/sites
```

添加新的站点分类。

**请求体：**

```json
{
  "type": "addCategory",
  "data": {
    "id": "new-category",
    "name": "新分类",
    "icon": "folder",
    "sites": []
  }
}
```

#### 更新分类

```http
PUT /api/sites
```

更新分类信息。

**请求体：**

```json
{
  "type": "updateCategory",
  "data": {
    "categoryId": "default",
    "category": {
      "id": "default",
      "name": "更新后的分类名",
      "icon": "new-icon",
      "sites": []
    }
  }
}
```

#### 删除分类

```http
DELETE /api/sites
```

删除指定分类。

**请求体：**

```json
{
  "type": "deleteCategory",
  "data": {
    "categoryId": "default"
  }
}
```

### 错误处理

所有 API 在发生错误时会返回以下格式：

```json
{
  "error": "错误信息描述"
}
```

常见 HTTP 状态码：

- 200: 请求成功
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器内部错误

### 注意事项

1. 所有请求都需要设置 `Content-Type: application/json` 头部
2. 站点 ID 和分类 ID 都是唯一的字符串
3. 更新操作需要提供完整的对象数据
4. 删除操作会级联删除分类下的所有站点
