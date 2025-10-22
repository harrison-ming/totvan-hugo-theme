# Phase 2: 首页模板系统

**版本变更**: v0.2.0 → v0.3.0
**工作量**: 3-5 天
**优先级**: 🔥 高
**状态**: 📋 待实施

---

## 📖 目标和背景

### 目标

1. **提供多种首页布局**：4 种预设模板可选
2. **保持简单配置**：一行配置切换首页风格
3. **避免 Blocks 复杂度**：不引入 Hugo Blox 的 blocks 系统
4. **代码复用**：提取可复用的首页组件

### 背景

**当前实现**:
- 单一固定首页：分类网格布局
- 逻辑硬编码在 `home.html` 中
- 无法灵活调整布局

**改进后**:
- 4 种预设首页模板
- 通过配置快速切换
- 共享组件易于维护

### 与 Hugo Blox 的差异

| 方面 | ToTVan 首页系统 | Hugo Blox Blocks |
|------|----------------|------------------|
| **配置复杂度** | 一行：`layout = "magazine"` | 几十行 YAML（sections 数组） |
| **学习曲线** | 低（选择预设） | 高（需理解 blocks 概念） |
| **灵活性** | 中（预设模板+配置项） | 高（无限组合） |
| **适用场景** | 内容站 | 任意站点类型 |

---

## 🎨 首页模板设计

### 模板 1: Category Grid（默认，当前实现）

**适用场景**: 多分类内容站，突出分类体系

**布局**:
```
+----------------------------------+
| 最新文章 (3 posts)                |
| [查看全部]                        |
+----------------------------------+
| 分类 1 (3 posts) [查看全部]       |
+----------------------------------+
| 分类 2 (3 posts) [查看全部]       |
+----------------------------------+
| ...（共 7 个分类）                 |
+----------------------------------+
| Newsletter 订阅                   |
+----------------------------------+
```

**特点**:
- 平衡展示各分类
- 避免重复文章（最新文章排除分类中已展示的）
- 移动端横向卡片，桌面端纵向卡片

---

### 模板 2: Magazine（杂志风格）

**适用场景**: 强调视觉冲击，适合图片丰富的内容站

**布局**:
```
+----------------------------------+
| Hero Featured Post               |
| (大图 + 标题 + 摘要)              |
+----------------------------------+
| 最新文章 (3-6 posts) | 侧边栏    |
|                      | - 热门 5篇|
|                      | - 分类导航|
|                      | - Newsletter|
+----------------------------------+
| 编辑推荐 (3 posts)                |
+----------------------------------+
| 分类展示 (Top 3 categories)       |
+----------------------------------+
```

**特点**:
- Hero 区域展示精选文章
- 双栏布局（主内容 + 侧边栏）
- 侧边栏展示热门文章（按浏览量或日期）

---

### 模板 3: Minimal（极简单列）

**适用场景**: 专注阅读体验，类似 Medium

**布局**:
```
+----------------------------------+
| Logo / Site Title                |
+----------------------------------+
| Post 1                           |
| (全宽卡片：图片 + 标题 + 摘要)   |
+----------------------------------+
| Post 2                           |
+----------------------------------+
| Post 3                           |
+----------------------------------+
| ...                              |
+----------------------------------+
| [加载更多] 或 分页导航            |
+----------------------------------+
```

**特点**:
- 单列全宽布局
- 无分类分组
- 简洁的时间倒序流
- 适合博客型站点

---

### 模板 4: Hero Featured（Hero + 精选）

**适用场景**: 营销型内容站，强调品牌和特定内容

**布局**:
```
+----------------------------------+
| Hero Section                     |
| - 背景图/视频                     |
| - 站点标语                        |
| - CTA 按钮                        |
+----------------------------------+
| Featured Posts (3 大卡片)         |
+----------------------------------+
| 最新文章 (6 posts, 2列)           |
+----------------------------------+
| 分类快速导航 (图标 + 名称)        |
+----------------------------------+
| Newsletter 订阅                   |
+----------------------------------+
```

**特点**:
- 强调品牌形象
- 精选内容突出展示
- 包含 CTA（行动号召）

---

## 📁 文件结构

```
totvan-hugo-theme/
├── layouts/
│   ├── _default/
│   │   ├── home.html                    # 路由器（新增）
│   │   └── baseof.html
│   │
│   ├── home-layouts/                    # 新增目录
│   │   ├── category-grid.html           # 模板 1（迁移当前 home.html）
│   │   ├── magazine.html                # 模板 2
│   │   ├── minimal.html                 # 模板 3
│   │   ├── hero-featured.html           # 模板 4
│   │   │
│   │   └── _shared/                     # 共享组件
│   │       ├── latest-posts.html
│   │       ├── category-section.html
│   │       ├── hero.html
│   │       └── popular-posts.html
│   │
│   └── partials/
│       ├── functions/                   # 新增（纯函数）
│       │   ├── get-top-categories.html
│       │   ├── get-latest-posts-excluding.html
│       │   └── get-popular-posts.html
│       │
│       └── content/                     # 现有（UI 组件）
│           ├── card.html
│           ├── card-vertical.html
│           ├── breadcrumb.html
│           └── newsletter.html
```

---

## 📝 详细实施步骤

### 步骤 1: 创建目录结构

```bash
cd /Users/ming/Documents/HUGO/totvan-hugo-theme

mkdir -p layouts/home-layouts/_shared
mkdir -p layouts/partials/functions
```

---

### 步骤 2: 提取纯函数

#### 2.1 创建 get-top-categories.html

**创建 `layouts/partials/functions/get-top-categories.html`**:
```go
{{/*
  获取文章数量最多的 N 个分类

  参数 (dict):
    - count: 返回的分类数量（默认 7）
    - minPosts: 最少文章数量（默认 2）

  返回: 分类数组，按文章数量降序排列
    [
      {
        name: "分类名称",
        count: 10,
        taxonomy: <taxonomy object>
      },
      ...
    ]
*/}}

{{ $count := .count | default 7 }}
{{ $minPosts := .minPosts | default 2 }}

{{ $categories := slice }}
{{ range $name, $taxonomy := site.Taxonomies.categories }}
  {{ if ge (len $taxonomy) $minPosts }}
    {{ $categories = $categories | append (dict "name" $name "count" (len $taxonomy) "taxonomy" $taxonomy) }}
  {{ end }}
{{ end }}

{{ $sorted := sort $categories "count" "desc" }}
{{ return first $count $sorted }}
```

---

#### 2.2 创建 get-latest-posts-excluding.html

**创建 `layouts/partials/functions/get-latest-posts-excluding.html`**:
```go
{{/*
  获取最新文章，排除指定的文章列表

  参数 (dict):
    - count: 返回的文章数量（默认 3）
    - excludedPages: 要排除的文章数组（默认 []）

  返回: 文章数组
*/}}

{{ $count := .count | default 3 }}
{{ $excluded := .excludedPages | default slice }}

{{ $result := slice }}
{{ $needed := $count }}

{{ range where site.RegularPages "Type" "in" site.Params.mainSections }}
  {{ if lt (len $result) $needed }}
    {{ $currentPage := . }}
    {{ $isExcluded := false }}

    {{/* 检查是否在排除列表中 */}}
    {{ range $excluded }}
      {{ if eq .File.UniqueID $currentPage.File.UniqueID }}
        {{ $isExcluded = true }}
      {{ end }}
    {{ end }}

    {{ if not $isExcluded }}
      {{ $result = $result | append $currentPage }}
    {{ end }}
  {{ end }}
{{ end }}

{{ return $result }}
```

---

#### 2.3 创建 get-popular-posts.html

**创建 `layouts/partials/functions/get-popular-posts.html`**:
```go
{{/*
  获取热门文章

  参数 (dict):
    - count: 返回的文章数量（默认 5）
    - days: 统计最近 N 天的文章（默认 30，0 表示全部）

  返回: 文章数组

  注: 当前按日期排序，未来可扩展为按浏览量排序
*/}}

{{ $count := .count | default 5 }}
{{ $days := .days | default 30 }}

{{ $posts := slice }}

{{ if gt $days 0 }}
  {{/* 只统计最近 N 天的文章 */}}
  {{ $cutoff := now.AddDate 0 0 (mul $days -1) }}
  {{ $posts = where (where site.RegularPages "Type" "in" site.Params.mainSections) "Date" "ge" $cutoff }}
{{ else }}
  {{/* 全部文章 */}}
  {{ $posts = where site.RegularPages "Type" "in" site.Params.mainSections }}
{{ end }}

{{/* 当前按日期排序，未来可以改为按 .Params.views 排序 */}}
{{ $sorted := $posts }}

{{ return first $count $sorted }}
```

---

### 步骤 3: 创建路由器

**创建 `layouts/_default/home.html`**:
```go
{{ define "main" }}

{{/* 获取首页布局配置 */}}
{{ $layout := site.Params.homepage.layout | default "category-grid" }}

{{/* 验证布局是否存在 */}}
{{ $validLayouts := slice "category-grid" "magazine" "minimal" "hero-featured" }}
{{ if not (in $validLayouts $layout) }}
  {{ errorf "Invalid homepage layout: %s. Valid options are: %s" $layout (delimit $validLayouts ", ") }}
{{ end }}

{{/* 加载对应的布局模板 */}}
{{ $template := printf "home-layouts/%s.html" $layout }}
{{ partial $template . }}

{{ end }}
```

---

### 步骤 4: 迁移当前首页到 category-grid

**创建 `layouts/home-layouts/category-grid.html`**:

将当前的 `layouts/_default/home.html` 内容复制过来，并使用新的函数：

```go
{{/* Category Grid 布局 - 当前默认首页 */}}

{{/* 配置 */}}
{{ $latestCount := site.Params.homepage.latestPostsCount | default 3 }}
{{ $categoriesCount := site.Params.homepage.categoriesCount | default 7 }}
{{ $postsPerCategory := site.Params.homepage.postsPerCategory | default 3 }}

{{/* 获取顶部分类 */}}
{{ $topCategories := partial "functions/get-top-categories" (dict "count" $categoriesCount "minPosts" 2) }}

{{/* 收集分类中展示的文章,用于排除 */}}
{{ $excludedPages := slice }}
{{ range $topCategories }}
  {{ range first $postsPerCategory .taxonomy.Pages }}
    {{ $excludedPages = $excludedPages | append . }}
  {{ end }}
{{ end }}

{{/* 获取最新文章（排除已在分类中展示的） */}}
{{ $latestPosts := partial "functions/get-latest-posts-excluding" (dict "count" $latestCount "excludedPages" $excludedPages) }}

<!-- 最新文章部分 -->
<section class="mb-8 md:mb-12 mt-10 md:mt-14">
  <div class="flex items-center mb-6 gap-4">
    <h2 class="text-xl md:text-2xl font-bold">最新文章</h2>
    <a class="border rounded-full text-sm py-2 px-4 md:px-5 hover:bg-primary-50 hover:border-primary-300 transition-colors font-medium"
       href="{{ "/posts/" | absURL }}">查看全部</a>
  </div>

  <!-- Web端显示纵向卡片网格 -->
  <div class="hidden md:grid md:grid-cols-3 gap-x-6 gap-y-10">
    {{ range $latestPosts }}
      {{- partial "content/card-vertical" . -}}
    {{ end }}
  </div>

  <!-- 移动端显示横向卡片列表 -->
  <div class="md:hidden space-y-4">
    {{ range $latestPosts }}
      {{- partial "content/card" . -}}
    {{ end }}
  </div>
</section>

<hr class="my-8">

<!-- 分类部分 -->
{{ range $topCategories }}
  <section class="mb-10">
    <div class="flex items-center mb-6 gap-4">
      <h2 class="text-xl font-bold">{{ .name }}</h2>
      <a class="border rounded-full py-2 px-4 md:px-6 hover:bg-primary-50 hover:border-primary-300 transition-colors"
         href="{{ printf "/categories/%s/" (.name | urlize) | relURL }}">查看全部</a>
    </div>

    <!-- Web端显示纵向卡片网格 -->
    <div class="hidden md:grid md:grid-cols-3 gap-x-6 gap-y-10">
      {{ range first $postsPerCategory .taxonomy.Pages }}
        {{- partial "content/card-vertical" . -}}
      {{ end }}
    </div>

    <!-- 移动端显示横向卡片列表 -->
    <div class="md:hidden space-y-4">
      {{ range first $postsPerCategory .taxonomy.Pages }}
        {{- partial "content/card" . -}}
      {{ end }}
    </div>
  </section>

  <hr class="my-8">
{{ end }}

<!-- 订阅部分 -->
{{ if site.Params.homepage.showNewsletter | default true }}
  {{- partial "content/newsletter.html" . -}}
{{ end }}
```

---

### 步骤 5: 创建 Magazine 布局

**创建 `layouts/home-layouts/magazine.html`**:
```go
{{/* Magazine 布局 - 杂志风格 */}}

{{ $heroPost := index (where site.RegularPages "Type" "in" site.Params.mainSections) 0 }}
{{ $latestCount := site.Params.homepage.magazine.latestCount | default 6 }}
{{ $popularCount := site.Params.homepage.magazine.popularCount | default 5 }}

<!-- Hero Featured Post -->
{{ if $heroPost }}
<section class="mb-12">
  <a href="{{ $heroPost.Permalink }}" class="block group">
    <div class="relative overflow-hidden rounded-lg aspect-[16/9] md:aspect-[21/9]">
      {{ if $heroPost.Params.image }}
        {{ $img := $heroPost.Params.image }}
        {{ if hasPrefix $img "http" }}
          <img src="{{ $img }}" alt="{{ $heroPost.Title }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        {{ else }}
          {{ with resources.Get $img }}
            {{ $optimized := . }}
            {{ if ge .Width 1200 }}
              {{ $optimized = .Resize "1200x" }}
            {{ end }}
            <img src="{{ $optimized.RelPermalink }}" alt="{{ $heroPost.Title }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          {{ end }}
        {{ end }}
      {{ end }}

      <!-- 渐变遮罩 -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      <!-- 文字内容 -->
      <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
        {{ if $heroPost.Params.categories }}
          <span class="inline-block px-3 py-1 bg-primary-600 text-white text-sm rounded-full mb-3">
            {{ index $heroPost.Params.categories 0 }}
          </span>
        {{ end }}
        <h1 class="text-2xl md:text-4xl font-bold mb-3">{{ $heroPost.Title }}</h1>
        {{ if $heroPost.Summary }}
          <p class="text-gray-200 text-sm md:text-base line-clamp-2 md:line-clamp-3">{{ $heroPost.Summary }}</p>
        {{ end }}
      </div>
    </div>
  </a>
</section>
{{ end }}

<!-- 主内容区 + 侧边栏 -->
<div class="grid md:grid-cols-3 gap-8">
  <!-- 主内容区 (左侧 2/3) -->
  <div class="md:col-span-2">
    <h2 class="text-2xl font-bold mb-6">最新文章</h2>

    {{ $latestPosts := partial "functions/get-latest-posts-excluding" (dict "count" $latestCount "excludedPages" (slice $heroPost)) }}

    <div class="space-y-6">
      {{ range $latestPosts }}
        {{- partial "content/card" . -}}
      {{ end }}
    </div>
  </div>

  <!-- 侧边栏 (右侧 1/3) -->
  <aside class="md:col-span-1 space-y-8">
    <!-- 热门文章 -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h3 class="text-lg font-bold mb-4">热门文章</h3>
      {{ $popularPosts := partial "functions/get-popular-posts" (dict "count" $popularCount) }}
      <ul class="space-y-4">
        {{ range $popularPosts }}
          <li>
            <a href="{{ .Permalink }}" class="group">
              <h4 class="font-medium text-sm group-hover:text-primary-600 transition-colors line-clamp-2">
                {{ .Title }}
              </h4>
              <time class="text-xs text-gray-500 mt-1 block">{{ .Date.Format "2006-01-02" }}</time>
            </a>
          </li>
        {{ end }}
      </ul>
    </div>

    <!-- 分类导航 -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h3 class="text-lg font-bold mb-4">分类</h3>
      {{ $categories := partial "functions/get-top-categories" (dict "count" 10) }}
      <ul class="space-y-2">
        {{ range $categories }}
          <li>
            <a href="{{ printf "/categories/%s/" (.name | urlize) | relURL }}"
               class="flex justify-between items-center hover:text-primary-600 transition-colors">
              <span>{{ .name }}</span>
              <span class="text-sm text-gray-500">{{ .count }}</span>
            </a>
          </li>
        {{ end }}
      </ul>
    </div>

    <!-- Newsletter -->
    {{ if site.Params.homepage.showNewsletter | default true }}
      <div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
        {{- partial "content/newsletter.html" . -}}
      </div>
    {{ end }}
  </aside>
</div>
```

---

### 步骤 6: 创建 Minimal 布局

**创建 `layouts/home-layouts/minimal.html`**:
```go
{{/* Minimal 布局 - 极简单列 */}}

{{ $postsCount := site.Params.homepage.minimal.postsCount | default 10 }}

<!-- 简洁的标题区 -->
<div class="text-center mb-12 mt-8">
  <h1 class="text-3xl md:text-4xl font-bold mb-2">{{ site.Title }}</h1>
  {{ if site.Params.description }}
    <p class="text-gray-600 dark:text-gray-400">{{ site.Params.description }}</p>
  {{ end }}
</div>

<!-- 文章列表（单列全宽） -->
<div class="max-w-3xl mx-auto">
  {{ $posts := first $postsCount (where site.RegularPages "Type" "in" site.Params.mainSections) }}

  <div class="space-y-12">
    {{ range $posts }}
      <article class="group">
        <!-- 特色图片 -->
        {{ if .Params.image }}
          <a href="{{ .Permalink }}" class="block mb-4">
            <div class="aspect-[16/9] overflow-hidden rounded-lg">
              {{ $img := .Params.image }}
              {{ if hasPrefix $img "http" }}
                <img src="{{ $img }}" alt="{{ .Title }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              {{ else }}
                {{ with resources.Get $img }}
                  {{ $optimized := . }}
                  {{ if ge .Width 800 }}
                    {{ $optimized = .Resize "800x" }}
                  {{ end }}
                  <img src="{{ $optimized.RelPermalink }}" alt="{{ $.Title }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                {{ end }}
              {{ end }}
            </div>
          </a>
        {{ end }}

        <!-- 文章信息 -->
        <div class="space-y-3">
          <!-- 分类和日期 -->
          <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            {{ if .Params.categories }}
              <span class="text-primary-600 font-medium">{{ index .Params.categories 0 }}</span>
            {{ end }}
            <time>{{ .Date.Format "2006年01月02日" }}</time>
          </div>

          <!-- 标题 -->
          <h2 class="text-2xl md:text-3xl font-bold">
            <a href="{{ .Permalink }}" class="hover:text-primary-600 transition-colors">
              {{ .Title }}
            </a>
          </h2>

          <!-- 摘要 -->
          {{ if .Summary }}
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ .Summary | truncate 200 }}
            </p>
          {{ end }}

          <!-- 阅读更多 -->
          <a href="{{ .Permalink }}" class="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
            阅读全文 →
          </a>
        </div>
      </article>
    {{ end }}
  </div>

  <!-- 分页导航 -->
  <div class="mt-12 text-center">
    <a href="/posts/" class="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
      查看所有文章
    </a>
  </div>
</div>
```

---

### 步骤 7: 创建 Hero Featured 布局

**创建 `layouts/home-layouts/hero-featured.html`**:
```go
{{/* Hero Featured 布局 - Hero + 精选内容 */}}

<!-- Hero Section -->
<section class="relative -mt-4 mb-12">
  {{ $heroConfig := site.Params.homepage.hero }}
  {{ $bgImage := $heroConfig.backgroundImage | default "" }}

  <div class="relative overflow-hidden rounded-xl {{ if not $bgImage }}bg-gradient-to-r from-primary-600 to-primary-800{{ end }} text-white py-20 md:py-32">
    <!-- 背景图 -->
    {{ if $bgImage }}
      <div class="absolute inset-0">
        <img src="{{ $bgImage }}" alt="" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/50"></div>
      </div>
    {{ end }}

    <!-- 内容 -->
    <div class="relative z-10 text-center px-6">
      <h1 class="text-4xl md:text-6xl font-bold mb-4">
        {{ $heroConfig.title | default site.Title }}
      </h1>
      {{ if $heroConfig.subtitle }}
        <p class="text-xl md:text-2xl mb-8 text-gray-100">{{ $heroConfig.subtitle }}</p>
      {{ end }}
      {{ if $heroConfig.ctaText }}
        <a href="{{ $heroConfig.ctaUrl | default "#" }}"
           class="inline-block px-8 py-3 bg-white text-primary-700 rounded-lg font-bold hover:bg-gray-100 transition-colors">
          {{ $heroConfig.ctaText }}
        </a>
      {{ end }}
    </div>
  </div>
</section>

<!-- Featured Posts -->
<section class="mb-12">
  <h2 class="text-2xl md:text-3xl font-bold mb-8 text-center">精选文章</h2>

  {{ $featuredCount := site.Params.homepage.featuredCount | default 3 }}
  {{ $featuredPosts := first $featuredCount (where site.RegularPages "Type" "in" site.Params.mainSections) }}

  <div class="grid md:grid-cols-3 gap-8">
    {{ range $featuredPosts }}
      <article class="group">
        <a href="{{ .Permalink }}" class="block">
          <!-- 大卡片样式 -->
          <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <!-- 图片 -->
            {{ if .Params.image }}
              <div class="aspect-[16/9] overflow-hidden">
                {{ $img := .Params.image }}
                {{ if hasPrefix $img "http" }}
                  <img src="{{ $img }}" alt="{{ .Title }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                {{ else }}
                  {{ with resources.Get $img }}
                    {{ $optimized := .Resize "600x" }}
                    <img src="{{ $optimized.RelPermalink }}" alt="{{ $.Title }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                  {{ end }}
                {{ end }}
              </div>
            {{ end }}

            <!-- 内容 -->
            <div class="p-6">
              {{ if .Params.categories }}
                <span class="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded mb-3">
                  {{ index .Params.categories 0 }}
                </span>
              {{ end }}
              <h3 class="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                {{ .Title }}
              </h3>
              {{ if .Summary }}
                <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{{ .Summary }}</p>
              {{ end }}
            </div>
          </div>
        </a>
      </article>
    {{ end }}
  </div>
</section>

<!-- 最新文章 -->
<section class="mb-12">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold">最新文章</h2>
    <a href="/posts/" class="text-primary-600 hover:text-primary-700 font-medium">
      查看全部 →
    </a>
  </div>

  {{ $latestCount := site.Params.homepage.latestPostsCount | default 6 }}
  {{ $latestPosts := first $latestCount (where site.RegularPages "Type" "in" site.Params.mainSections) }}

  <div class="grid md:grid-cols-2 gap-6">
    {{ range $latestPosts }}
      {{- partial "content/card" . -}}
    {{ end }}
  </div>
</section>

<!-- 分类快速导航 -->
<section class="mb-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
  <h2 class="text-2xl font-bold mb-6 text-center">浏览分类</h2>

  {{ $categories := partial "functions/get-top-categories" (dict "count" 8) }}

  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    {{ range $categories }}
      <a href="{{ printf "/categories/%s/" (.name | urlize) | relURL }}"
         class="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg hover:shadow-lg hover:scale-105 transition-all">
        <span class="text-3xl mb-2">📁</span>
        <span class="font-medium text-center">{{ .name }}</span>
        <span class="text-sm text-gray-500">{{ .count }} 篇</span>
      </a>
    {{ end }}
  </div>
</section>

<!-- Newsletter -->
{{ if site.Params.homepage.showNewsletter | default true }}
  <section class="bg-primary-600 text-white rounded-xl p-8 md:p-12 text-center">
    {{- partial "content/newsletter.html" . -}}
  </section>
{{ end }}
```

---

### 步骤 8: 配置文档

**在 ToTVan 站点的 `hugo.toml` 中添加配置**:

```toml
# 首页配置
[params.homepage]
  # 布局选择: category-grid | magazine | minimal | hero-featured
  layout = "category-grid"  # 默认

  # 通用配置
  latestPostsCount = 3        # 最新文章数量
  categoriesCount = 7         # 显示的分类数量
  postsPerCategory = 3        # 每个分类显示的文章数
  showNewsletter = true       # 是否显示 Newsletter 订阅
  featuredCount = 3           # 精选文章数量（hero-featured 布局）

  # Magazine 布局专用
  [params.homepage.magazine]
    latestCount = 6           # 主内容区文章数
    popularCount = 5          # 侧边栏热门文章数

  # Minimal 布局专用
  [params.homepage.minimal]
    postsCount = 10           # 首页显示文章数

  # Hero Featured 布局专用
  [params.homepage.hero]
    title = "欢迎来到 ToTVan"
    subtitle = "温哥华生活资讯"
    backgroundImage = "/images/hero-bg.jpg"  # 可选
    ctaText = "开始阅读"
    ctaUrl = "/posts/"
```

---

### 步骤 9: 本地测试

#### 9.1 测试 Category Grid（默认）

```bash
cd /Users/ming/Documents/HUGO/ToTVan

# 确保配置为 category-grid 或不设置（使用默认）
hugo server --buildDrafts
```

访问 http://localhost:1313，验证：
- ✅ 最新文章显示 3 篇
- ✅ 分类展示 7 个
- ✅ 每个分类 3 篇文章
- ✅ Newsletter 订阅框显示

---

#### 9.2 测试 Magazine 布局

**修改 `hugo.toml`**:
```toml
[params.homepage]
  layout = "magazine"
```

```bash
hugo server --buildDrafts
```

验证：
- ✅ Hero 区域显示最新一篇文章
- ✅ 左侧主内容区显示 6 篇文章
- ✅ 右侧侧边栏显示热门和分类

---

#### 9.3 测试 Minimal 布局

**修改 `hugo.toml`**:
```toml
[params.homepage]
  layout = "minimal"
```

验证：
- ✅ 单列居中布局
- ✅ 显示 10 篇文章
- ✅ 全宽卡片样式

---

#### 9.4 测试 Hero Featured 布局

**修改 `hugo.toml`**:
```toml
[params.homepage]
  layout = "hero-featured"

  [params.homepage.hero]
    title = "欢迎来到 ToTVan"
    subtitle = "温哥华生活资讯"
    ctaText = "开始阅读"
    ctaUrl = "/posts/"
```

验证：
- ✅ Hero 区域显示
- ✅ 精选文章 3 篇大卡片
- ✅ 分类导航显示

---

### 步骤 10: 提交代码

```bash
cd /Users/ming/Documents/HUGO/totvan-hugo-theme

git add .
git commit -m "Phase 2: Add homepage template system

Features:
- Created homepage router (home.html)
- Implemented 4 homepage layouts:
  * category-grid (default, migrated from current)
  * magazine (hero + sidebar)
  * minimal (single column)
  * hero-featured (hero + featured posts)
- Extracted reusable functions:
  * get-top-categories
  * get-latest-posts-excluding
  * get-popular-posts
- Simple configuration: one line to switch layout

Usage:
params.homepage.layout = \"category-grid\" | \"magazine\" | \"minimal\" | \"hero-featured\"

See docs/improvement-plan/phase2-homepage-system.md for details"

git push origin main
git tag -a v0.3.0 -m "Phase 2: Homepage Template System"
git push origin v0.3.0
```

---

### 步骤 11: 更新站点

```bash
cd /Users/ming/Documents/HUGO/ToTVan

# 更新到 v0.3.0
hugo mod get github.com/harrison-ming/totvan-hugo-theme@v0.3.0
hugo mod tidy

# 选择首页布局（编辑 hugo.toml）
# 默认为 category-grid，保持当前行为

# 重新构建
rm -rf public resources/_gen
hugo

# 测试
hugo server
```

---

## ✅ 验证清单

### 功能验证

- [ ] **路由器工作正常**
  - 默认加载 category-grid
  - 可通过配置切换布局
  - 无效布局抛出错误

- [ ] **Category Grid 布局**
  - 最新文章不重复
  - 分类排序正确
  - 移动端/桌面端样式正确

- [ ] **Magazine 布局**
  - Hero 区域图片加载
  - 侧边栏显示正确
  - 响应式布局正常

- [ ] **Minimal 布局**
  - 单列居中
  - 图片优化正确
  - 分页链接正常

- [ ] **Hero Featured 布局**
  - Hero 背景图显示
  - CTA 按钮链接正确
  - 分类导航可点击

### 性能验证

```bash
# 构建时间
time hugo

# 应该与 v0.2.0 相差不大（±15%）
```

### 代码质量

- [ ] 无重复代码
- [ ] 函数可复用
- [ ] 注释清晰
- [ ] 错误处理完善

---

## 🔄 回滚方案

```bash
cd /Users/ming/Documents/HUGO/ToTVan

# 回滚到 v0.2.0
hugo mod get github.com/harrison-ming/totvan-hugo-theme@v0.2.0
hugo mod tidy

# 恢复配置（如果需要）
# ...

# 重新构建
rm -rf public resources/_gen
hugo
```

---

## 📊 成功指标

- ✅ 新增 4 种首页布局
- ✅ 配置切换简单（1 行）
- ✅ 代码复用性高
- ✅ 用户可自由选择风格
- ✅ 构建时间增加 <15%
- ✅ 保持代码简洁性

---

## 🎯 下一步

完成 Phase 2 后，继续：
- [Phase 3: Partials 重构](./phase3-partials-refactor.md)

---

**最后更新**: 2025-10-22
