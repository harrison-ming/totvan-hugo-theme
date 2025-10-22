# ToTVan Homepage Layouts

ToTVan 主题提供 4 种灵活的首页布局选择,满足不同类型网站的需求。

## 可用布局

### 1. Category Grid (分类网格) - 默认布局

**适用场景**: 内容站点、新闻网站、多分类博客

**特点**:
- 顶部显示最新文章 (默认 3 篇)
- 按文章数量展示前 7 个分类
- 每个分类显示 3 篇文章
- 网格布局,响应式设计

**配置示例**:
```toml
[params.homepage]
  layout = "category-grid"  # 或者不设置,默认就是这个

  [params.homepage.categoryGrid]
    topCategoriesCount = 7      # 显示的分类数量
    postsPerCategory = 3        # 每个分类显示的文章数
    latestPostsCount = 3        # 最新文章数量
```

### 2. Magazine (杂志风格)

**适用场景**: 新闻媒体、杂志、视觉冲击力强的网站

**特点**:
- Hero区域: 1篇大型特色文章 + 2篇小型特色文章
- 编辑推荐: 6篇精选文章(横向卡片)
- 热门分类: 前3个分类,每个显示4篇文章
- 强调大图和视觉冲击力

**配置示例**:
```toml
[params.homepage]
  layout = "magazine"

  [params.homepage.magazine]
    heroPostsCount = 3          # Hero区域文章数
    featuredPostsCount = 6      # 编辑推荐文章数
    topCategoriesCount = 3      # 分类区域数量
    postsPerCategory = 4        # 每个分类显示的文章数
```

### 3. Minimal (极简风格)

**适用场景**: 个人博客、技术博客、文字为主的内容

**特点**:
- 极简设计,专注内容
- 时间线式文章列表
- 仅显示标题、摘要、日期
- 无图片,纯文字布局
- 可选按月份分组

**配置示例**:
```toml
[params.homepage]
  layout = "minimal"

  [params.homepage.minimal]
    title = "我的博客"                 # 自定义标题
    subtitle = "分享技术与生活的点滴"   # 自定义副标题
    postsCount = 15                   # 显示的文章数量
    showCategories = true             # 显示分类标签
    groupByMonth = false              # 是否按月份分组
    showCategoryCloud = true          # 显示分类云
```

### 4. Hero-Featured (Hero + 特色文章)

**适用场景**: 新闻网站、媒体平台、品牌网站

**特点**:
- 全宽 Hero 特色文章(视觉冲击强)
- 特色文章网格 (6-9篇)
- 按分类分组的文章区域
- 现代、专业的设计风格

**配置示例**:
```toml
[params.homepage]
  layout = "hero-featured"

  [params.homepage.heroFeatured]
    featuredPostsCount = 6      # 特色文章数量
    topCategoriesCount = 4      # 分类区域数量
    postsPerCategory = 3        # 每个分类显示的文章数
```

## 布局对比

| 布局 | 视觉冲击 | 内容密度 | 适合图片 | 适合文字 | 复杂度 |
|------|----------|----------|----------|----------|--------|
| category-grid | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 简单 |
| magazine | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | 中等 |
| minimal | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | 简单 |
| hero-featured | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 复杂 |

## 切换布局

在你的站点配置文件 (`hugo.toml` 或 `config.toml`) 中设置:

```toml
[params.homepage]
  layout = "magazine"  # 或 "category-grid", "minimal", "hero-featured"
```

更改后重新构建站点即可:
```bash
hugo server
```

## 向后兼容

如果未设置 `params.homepage.layout`,主题会自动使用 `category-grid` 布局,与 v0.1.0 的行为完全一致。

现有站点升级到 v0.3.0 后无需任何配置修改即可正常工作。

## 自定义布局

如果内置的4种布局都不满足需求,可以创建自定义布局:

1. 在你的站点目录创建: `layouts/partials/home-layouts/custom.html`
2. 实现你的布局代码
3. 在配置中使用: `params.homepage.layout = "custom"`

参考主题中的现有布局作为模板:
- [category-grid.html](../layouts/partials/home-layouts/category-grid.html)
- [magazine.html](../layouts/partials/home-layouts/magazine.html)
- [minimal.html](../layouts/partials/home-layouts/minimal.html)
- [hero-featured.html](../layouts/partials/home-layouts/hero-featured.html)

## 可复用函数

主题提供了两个辅助函数,便于自定义布局:

### get-top-categories

获取按文章数量排序的顶级分类。

```go-html-template
{{ $topCategories := partial "functions/get-top-categories" (dict "context" . "limit" 5 "minPosts" 3) }}
{{ range $topCategories }}
  <h2>{{ .name }} ({{ .count }} 篇)</h2>
{{ end }}
```

参数:
- `context`: Hugo 上下文 (必需)
- `limit`: 返回分类数量限制 (默认: 7)
- `minPosts`: 最小文章数量 (默认: 2)

### get-latest-posts-excluding

获取最新文章,排除指定的文章列表。

```go-html-template
{{ $excluded := slice $page1 $page2 }}
{{ $latest := partial "functions/get-latest-posts-excluding" (dict "context" . "excludePages" $excluded "limit" 5) }}
{{ range $latest }}
  <h3>{{ .Title }}</h3>
{{ end }}
```

参数:
- `context`: Hugo 上下文 (必需)
- `excludePages`: 要排除的页面切片 (默认: 空)
- `limit`: 返回文章数量 (默认: 3)

## 最佳实践

1. **选择合适的布局**: 根据你的内容类型和受众选择布局
   - 图片丰富的内容 → `magazine` 或 `hero-featured`
   - 文字为主的博客 → `minimal`
   - 多分类新闻站 → `category-grid`

2. **配置参数调整**: 根据实际内容调整显示数量
   - 文章多的站点可以增加每个分类的显示数量
   - 文章少的站点可以减少分类数量,集中展示

3. **响应式设计**: 所有布局都已优化移动端显示,无需额外配置

4. **性能考虑**: 首页显示的文章越多,构建时间越长,建议合理控制数量

## 问题排查

**问题**: 修改配置后首页没有变化

**解决方案**:
1. 确认配置格式正确(TOML语法)
2. 重启 `hugo server`
3. 清除浏览器缓存

**问题**: 自定义布局不生效

**解决方案**:
1. 确认文件路径正确: `layouts/partials/home-layouts/你的布局名.html`
2. 确认 `params.homepage.layout` 值与文件名匹配(不含.html后缀)
3. 检查Hugo日志中的警告信息

## 版本信息

- 引入版本: v0.3.0
- 向后兼容: 是(默认使用 category-grid)
- 最后更新: 2025-10-21
