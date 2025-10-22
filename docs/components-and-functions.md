# ToTVan Components and Functions

ToTVan 主题提供了一套可复用的组件和函数,帮助你构建一致、高质量的内容展示。

## 可复用函数 (Functions)

所有函数位于 `layouts/partials/functions/` 目录。

### get-image-url

获取文章或页面的图片 URL。

**参数**:
```go-html-template
{{ $imgUrl := partial "functions/get-image-url" (dict "page" . "fallback" "/images/default.jpg") }}
```

- `page` (Page, required): 页面对象
- `fallback` (string, optional): 备用图片 URL

**优先级**:
1. `page.Params.image`
2. `page.Params.featured_image`
3. `fallback` 参数
4. 空字符串

**返回值**: string - 图片 URL

### format-date

格式化日期的通用函数。

**参数**:
```go-html-template
{{ $formattedDate := partial "functions/format-date" (dict "date" .Date "format" "long") }}
```

- `date` (time.Time, required): 日期对象
- `format` (string, optional): 格式类型

**支持的格式**:
- `"long"` (默认): January 2, 2006
- `"short"`: Jan 2
- `"iso"`: 2006-01-02
- `"datetime"`: 2006-01-02T15:04:05-07:00
- 自定义: 任何 Go 时间格式字符串

**示例**:
```go-html-template
{{/* 长格式 */}}
{{ partial "functions/format-date" (dict "date" .Date "format" "long") }}
{{/* 输出: October 21, 2025 */}}

{{/* 短格式 */}}
{{ partial "functions/format-date" (dict "date" .Date "format" "short") }}
{{/* 输出: Oct 21 */}}

{{/* 自定义格式 */}}
{{ partial "functions/format-date" (dict "date" .Date "format" "2006年01月02日") }}
{{/* 输出: 2025年10月21日 */}}
```

**返回值**: string - 格式化后的日期

### get-primary-category

获取文章的主分类(通常是第一个分类)。

**参数**:
```go-html-template
{{ $category := partial "functions/get-primary-category" (dict "page" .) }}
```

- `page` (Page, required): 页面对象
- `index` (int, optional): 分类索引,默认 0

**示例**:
```go-html-template
{{/* 获取第一个分类 */}}
{{ $category := partial "functions/get-primary-category" (dict "page" .) }}

{{/* 获取第二个分类 */}}
{{ $secondCategory := partial "functions/get-primary-category" (dict "page" . "index" 1) }}
```

**返回值**: string - 分类名称,无分类时返回空字符串

### get-top-categories

获取按文章数量排序的顶级分类。

**参数**:
```go-html-template
{{ $topCategories := partial "functions/get-top-categories" (dict "context" . "limit" 5 "minPosts" 3) }}
```

- `context` (context, required): Hugo 上下文
- `limit` (int, optional): 返回数量,默认 7
- `minPosts` (int, optional): 最小文章数,默认 2

**返回值**: slice of dict,每个包含:
- `name`: 分类名称
- `count`: 文章数量
- `taxonomy`: 分类对象

**示例**:
```go-html-template
{{ $topCategories := partial "functions/get-top-categories" (dict "context" . "limit" 5) }}
{{ range $topCategories }}
  <h2>{{ .name }} ({{ .count }} 篇)</h2>
  {{ range first 3 .taxonomy.Pages }}
    <article>{{ .Title }}</article>
  {{ end }}
{{ end }}
```

### get-latest-posts-excluding

获取最新文章,排除指定的文章列表。

**参数**:
```go-html-template
{{ $latest := partial "functions/get-latest-posts-excluding" (dict "context" . "excludePages" $excluded "limit" 5) }}
```

- `context` (context, required): Hugo 上下文
- `excludePages` (slice, optional): 要排除的页面列表
- `limit` (int, optional): 返回数量,默认 3

**返回值**: slice of Page - 最新文章列表

**示例**:
```go-html-template
{{/* 排除某些特定文章 */}}
{{ $excluded := slice $heroPost $featuredPost }}
{{ $latest := partial "functions/get-latest-posts-excluding" (dict "context" . "excludePages" $excluded "limit" 10) }}

{{ range $latest }}
  <h3>{{ .Title }}</h3>
{{ end }}
```

## 组件 (Components)

### article-card

统一的文章卡片组件,支持多种样式变体。

**位置**: `layouts/partials/components/article-card.html`

**参数**:
```go-html-template
{{- partial "components/article-card" (dict
  "page" .
  "variant" "vertical"
  "showExcerpt" true
  "cardClass" "my-custom-class") -}}
```

**所有参数**:
- `page` (Page, required): 文章页面对象
- `variant` (string): 卡片样式
  - `"horizontal"` (默认): 横向卡片(图片在左)
  - `"vertical"`: 纵向卡片(图片在上)
  - `"minimal"`: 极简卡片(仅文字)
- `showImage` (bool): 是否显示图片,默认 true
- `showCategory` (bool): 是否显示分类,默认 true
- `showDate` (bool): 是否显示日期,默认 true
- `showExcerpt` (bool): 是否显示摘要,默认 false
- `imageClass` (string): 图片额外的 CSS 类
- `cardClass` (string): 卡片额外的 CSS 类

**样式变体对比**:

| 变体 | 用途 | 特点 |
|------|------|------|
| horizontal | 移动端、列表页 | 图片在左,节省垂直空间 |
| vertical | 首页、网格布局 | 图片在上,视觉冲击力强 |
| minimal | 博客风格、文字为主 | 无图片,纯文字,简约 |

**示例**:

```go-html-template
{{/* 基础用法 - 纵向卡片 */}}
{{ partial "components/article-card" (dict "page" . "variant" "vertical") }}

{{/* 横向卡片带摘要 */}}
{{ partial "components/article-card" (dict
  "page" .
  "variant" "horizontal"
  "showExcerpt" true) }}

{{/* 极简卡片 */}}
{{ partial "components/article-card" (dict
  "page" .
  "variant" "minimal"
  "showImage" false) }}

{{/* 自定义样式 */}}
{{ partial "components/article-card" (dict
  "page" .
  "variant" "vertical"
  "cardClass" "shadow-2xl hover:scale-105"
  "imageClass" "brightness-90") }}
```

## 兼容性包装器

为了向后兼容,以下 partial 仍然可用,但它们现在只是调用统一的 `article-card` 组件:

### content/card.html

横向卡片的兼容性包装器。

```go-html-template
{{/* 旧用法(仍然有效) */}}
{{ partial "content/card" . }}

{{/* 等价于 */}}
{{ partial "components/article-card" (dict "page" . "variant" "horizontal") }}
```

### content/card-vertical.html

纵向卡片的兼容性包装器。

```go-html-template
{{/* 旧用法(仍然有效) */}}
{{ partial "content/card-vertical" . }}

{{/* 等价于 */}}
{{ partial "components/article-card" (dict "page" . "variant" "vertical") }}
```

**推荐**: 在新代码中直接使用 `components/article-card`,获得更多自定义选项。

## 最佳实践

### 1. 使用函数减少重复代码

**不推荐**:
```go-html-template
{{- with .Params.categories }}
  {{- $category := index . 0 }}
  <span>{{ $category }}</span>
{{- end }}
```

**推荐**:
```go-html-template
{{ $category := partial "functions/get-primary-category" (dict "page" .) }}
{{ if $category }}
  <span>{{ $category }}</span>
{{ end }}
```

### 2. 使用统一组件保持一致性

**不推荐**:
```go-html-template
{{/* 每个地方都写不同的卡片HTML */}}
<div class="custom-card">
  <img src="{{ .Params.image }}">
  <h3>{{ .Title }}</h3>
</div>
```

**推荐**:
```go-html-template
{{/* 使用统一组件 */}}
{{ partial "components/article-card" (dict "page" . "variant" "vertical") }}
```

### 3. 利用参数自定义

```go-html-template
{{/* 根据上下文调整显示 */}}
{{ if .IsHome }}
  {{/* 首页显示完整卡片 */}}
  {{ partial "components/article-card" (dict
    "page" .
    "variant" "vertical"
    "showExcerpt" true) }}
{{ else }}
  {{/* 列表页使用紧凑卡片 */}}
  {{ partial "components/article-card" (dict
    "page" .
    "variant" "horizontal"
    "showExcerpt" false) }}
{{ end }}
```

### 4. 组合多个函数

```go-html-template
{{/* 获取顶级分类和对应文章 */}}
{{ $topCategories := partial "functions/get-top-categories" (dict "context" . "limit" 3) }}

{{/* 收集已显示的文章 */}}
{{ $excludedPages := slice }}
{{ range $topCategories }}
  {{ range first 3 .taxonomy.Pages }}
    {{ $excludedPages = $excludedPages | append . }}
  {{ end }}
{{ end }}

{{/* 获取最新文章,排除已显示的 */}}
{{ $latestPosts := partial "functions/get-latest-posts-excluding" (dict
  "context" .
  "excludePages" $excludedPages
  "limit" 5) }}
```

## 性能考虑

1. **函数调用**: Hugo 的 partial 调用有一定开销,但可以使用 `partialCached` 缓存结果
2. **图片处理**: `get-image-url` 只获取 URL,不进行图片处理,性能开销小
3. **组件复用**: 统一组件减少了代码重复,Hugo 构建时更高效

## 扩展指南

### 创建自定义函数

1. 在 `layouts/partials/functions/` 创建新文件
2. 遵循现有函数的模式:
   - 清晰的文档注释
   - 参数验证
   - 合理的默认值
   - 返回单一类型

```go-html-template
{{- /*
  my-custom-function - 功能描述

  参数:
    . (dict)
      param1 (type, required): 描述
      param2 (type, optional): 描述,默认值

  返回:
    type - 返回值描述

  用法示例:
    {{ $result := partial "functions/my-custom-function" (dict "param1" $value) }}
*/ -}}

{{- $param1 := .param1 -}}
{{- $param2 := .param2 | default "default" -}}

{{- /* 函数逻辑 */ -}}

{{- return $result -}}
```

### 自定义组件

参考 `components/article-card.html` 创建新组件:
- 支持多种变体
- 提供丰富的自定义选项
- 保持向后兼容性
- 完整的文档注释

## 版本信息

- 引入版本: v0.4.0 (Phase 3)
- 向后兼容: 完全兼容(旧 partial 仍可用)
- 最后更新: 2025-10-21
