# Phase 3: Partials 重构

**版本变更**: v0.3.0 → v0.4.0
**工作量**: 2-3 天
**优先级**: 🟡 中
**状态**: 📋 待实施

---

## 📖 目标和背景

### 目标

1. **清理重复代码**：提取共用逻辑为独立函数
2. **改善代码组织**：按职责分类 partials
3. **提升可维护性**：函数职责单一，易于测试
4. **优化性能**：使用 `partialCached` 缓存不变内容

### 背景

**当前问题**:
- 图片处理逻辑在多处重复（card.html, card-vertical.html 等）
- partials 目录结构扁平，缺乏组织
- 部分 partials 职责不清晰
- 缺少可复用的工具函数

**改进后**:
- 图片处理逻辑集中在一个函数
- 清晰的目录结构（functions/ vs components/）
- 每个 partial 职责单一
- 更多可缓存的 partials

---

## 📁 目标目录结构

```
partials/
├── totvan/                        # ToTVan 专有
│   ├── head-basic.html           # 性能优化（Phase 1 已创建）
│   ├── config-compat.html        # 配置兼容（Phase 1 已创建）
│   └── branding.html             # 品牌信息（新增）
│
├── functions/                     # 纯函数（无 HTML 输出）
│   ├── get-top-categories.html   # Phase 2 已创建
│   ├── get-latest-posts-excluding.html  # Phase 2 已创建
│   ├── get-popular-posts.html    # Phase 2 已创建
│   ├── get-featured-image.html   # 新增
│   ├── get-optimized-image.html  # 新增
│   └── get-reading-time.html     # 新增
│
├── content/                       # 内容组件（有 HTML 输出）
│   ├── card.html                 # 重构：使用 functions
│   ├── card-vertical.html        # 重构：使用 functions
│   ├── breadcrumb.html           # 保持
│   ├── newsletter.html           # 保持
│   ├── post-meta.html            # 新增：文章元信息
│   └── share-buttons.html        # 新增（可选）
│
├── home-layouts/                  # Phase 2 已创建
├── comments/                      # 保持
├── footer/                        # 保持
├── head/                          # 保持
└── header.html, footer.html      # 保持
```

---

## 📝 详细实施步骤

### 步骤 1: 创建图片处理函数

#### 1.1 get-featured-image.html

**创建 `layouts/partials/functions/get-featured-image.html`**:
```go
{{/*
  获取文章的特色图片

  参数:
    - page: 页面对象（默认为当前页面）

  返回: 图片资源对象或 URL 字符串，如果没有则返回 nil

  查找顺序:
    1. page bundle 中的 *featured* 文件
    2. .Params.image.filename
    3. .Params.image (字符串)
    4. assets/media/ 中的图片
*/}}

{{ $page := . }}
{{ $image := nil }}

{{/* 1. 搜索 page bundle 中的 featured 图片 */}}
{{ $resource := ($page.Resources.ByType "image").GetMatch "*featured*" }}

{{ if $resource }}
  {{ $image = $resource }}
{{ else }}
  {{/* 2. 检查 .Params.image.filename */}}
  {{ $filename := "" }}
  {{ if reflect.IsMap $page.Params.image }}
    {{ $filename = $page.Params.image.filename }}
  {{ else if $page.Params.image }}
    {{ $filename = $page.Params.image }}
  {{ end }}

  {{ if $filename }}
    {{/* 如果是完整 URL，直接返回 */}}
    {{ if hasPrefix $filename "http" }}
      {{ $image = $filename }}
    {{ else }}
      {{/* 3. 在 page bundle 中搜索 */}}
      {{ $resource = ($page.Resources.ByType "image").GetMatch $filename }}
      {{ if $resource }}
        {{ $image = $resource }}
      {{ else }}
        {{/* 4. 在 assets/media/ 中搜索 */}}
        {{ $resource = resources.GetMatch (path.Join "media" $filename) }}
        {{ if $resource }}
          {{ $image = $resource }}
        {{ else }}
          {{/* 作为静态文件路径 */}}
          {{ $image = $filename }}
        {{ end }}
      {{ end }}
    {{ end }}
  {{ end }}
{{ end }}

{{ return $image }}
```

---

#### 1.2 get-optimized-image.html

**创建 `layouts/partials/functions/get-optimized-image.html`**:
```go
{{/*
  获取优化后的图片 URL

  参数 (dict):
    - image: 图片资源或 URL
    - width: 目标宽度（可选）
    - quality: 质量 1-100（默认 85）
    - format: 输出格式（可选：webp, jpeg, png）

  返回: 图片 URL
*/}}

{{ $image := .image }}
{{ $width := .width | default 0 }}
{{ $quality := .quality | default 85 }}
{{ $format := .format | default "" }}

{{ $result := "" }}

{{/* 如果是字符串（URL） */}}
{{ if and $image (or (eq (printf "%T" $image) "string") (hasPrefix (string $image) "http")) }}
  {{ $result = $image }}
{{ else if $image }}
  {{/* 如果是资源对象 */}}
  {{ $processed := $image }}

  {{/* 调整大小 */}}
  {{ if and (gt $width 0) (gt $image.Width $width) }}
    {{ $processed = $image.Resize (printf "%dx" $width) }}
  {{ end }}

  {{/* 转换格式（如果需要） */}}
  {{ if $format }}
    {{ if eq $format "webp" }}
      {{ $processed = $processed.Process (printf "webp q%d" $quality) }}
    {{ else if eq $format "jpeg" }}
      {{ $processed = $processed.Process (printf "jpeg q%d" $quality) }}
    {{ end }}
  {{ end }}

  {{ $result = $processed.RelPermalink }}
{{ end }}

{{ return $result }}
```

---

#### 1.3 get-reading-time.html

**创建 `layouts/partials/functions/get-reading-time.html`**:
```go
{{/*
  计算文章阅读时间

  参数:
    - page: 页面对象

  返回: 阅读时间（分钟）
*/}}

{{ $page := . }}
{{ $wordsPerMinute := 200 }}  # 中英文混合，保守估计

{{ $wordCount := $page.WordCount }}
{{ $readingTime := div $wordCount $wordsPerMinute }}

{{ if lt $readingTime 1 }}
  {{ $readingTime = 1 }}
{{ end }}

{{ return $readingTime }}
```

---

### 步骤 2: 重构 content 组件

#### 2.1 重构 card.html

**编辑 `layouts/partials/content/card.html`**:

**当前版本**（简化示例）:
```html
{{ if .Params.image }}
  {{ if hasPrefix .Params.image "http" }}
    <img src="{{ .Params.image }}" alt="{{ .Title }}">
  {{ else }}
    {{ with resources.Get .Params.image }}
      <img src="{{ .RelPermalink }}" alt="{{ $.Title }}">
    {{ end }}
  {{ end }}
{{ end }}
```

**重构后**:
```html
{{ $image := partial "functions/get-featured-image" . }}
{{ $optimized := "" }}

{{ if $image }}
  {{ $optimized = partial "functions/get-optimized-image" (dict "image" $image "width" 400 "quality" 85) }}
{{ end }}

<article class="flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded-lg transition-colors">
  {{/* 图片 */}}
  {{ if $optimized }}
    <a href="{{ .Permalink }}" class="flex-shrink-0">
      <div class="w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-lg">
        <img src="{{ $optimized }}" alt="{{ .Title }}" class="w-full h-full object-cover">
      </div>
    </a>
  {{ end }}

  {{/* 内容 */}}
  <div class="flex-1 min-w-0">
    {{/* 元信息 */}}
    {{ partial "content/post-meta" . }}

    {{/* 标题 */}}
    <h3 class="font-bold text-lg mb-2 line-clamp-2">
      <a href="{{ .Permalink }}" class="hover:text-primary-600 transition-colors">
        {{ .Title }}
      </a>
    </h3>

    {{/* 摘要（仅桌面端） */}}
    {{ if .Summary }}
      <p class="hidden md:block text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
        {{ .Summary | truncate 100 }}
      </p>
    {{ end }}
  </div>
</article>
```

---

#### 2.2 重构 card-vertical.html

**编辑 `layouts/partials/content/card-vertical.html`**:

```html
{{ $image := partial "functions/get-featured-image" . }}
{{ $optimized := "" }}

{{ if $image }}
  {{ $optimized = partial "functions/get-optimized-image" (dict "image" $image "width" 600 "quality" 85) }}
{{ end }}

<article class="group">
  <a href="{{ .Permalink }}" class="block">
    {{/* 图片 */}}
    {{ if $optimized }}
      <div class="aspect-[16/9] overflow-hidden rounded-lg mb-4">
        <img src="{{ $optimized }}"
             alt="{{ .Title }}"
             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
      </div>
    {{ else }}
      {{/* 无图片时的占位 */}}
      <div class="aspect-[16/9] bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
        <span class="text-gray-400 text-4xl">📄</span>
      </div>
    {{ end }}

    {{/* 元信息 */}}
    {{ partial "content/post-meta" . }}

    {{/* 标题 */}}
    <h3 class="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
      {{ .Title }}
    </h3>

    {{/* 摘要 */}}
    {{ if .Summary }}
      <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
        {{ .Summary | truncate 150 }}
      </p>
    {{ end }}
  </a>
</article>
```

---

#### 2.3 创建 post-meta.html

**创建 `layouts/partials/content/post-meta.html`**:
```html
{{/*
  文章元信息组件

  显示: 分类、日期、阅读时间等
*/}}

<div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
  {{/* 分类 */}}
  {{ if .Params.categories }}
    <a href="{{ printf "/categories/%s/" (index .Params.categories 0 | urlize) | relURL }}"
       class="text-primary-600 hover:text-primary-700 font-medium">
      {{ index .Params.categories 0 }}
    </a>
  {{ end }}

  {{/* 日期 */}}
  <time datetime="{{ .Date.Format "2006-01-02" }}">
    {{ .Date.Format "2006-01-02" }}
  </time>

  {{/* 阅读时间 */}}
  {{ $readingTime := partial "functions/get-reading-time" . }}
  <span>· {{ $readingTime }} 分钟</span>
</div>
```

---

### 步骤 3: 创建品牌信息组件

**创建 `layouts/partials/totvan/branding.html`**:
```html
{{/*
  ToTVan 品牌信息组件

  可在 header, footer 等处复用
*/}}

<div class="flex items-center gap-3">
  {{/* Logo */}}
  {{ if site.Params.logo.url }}
    <img src="{{ site.Params.logo.url }}"
         alt="{{ site.Params.logo.alt | default site.Title }}"
         {{ with site.Params.logo.width }}width="{{ . }}"{{ end }}
         {{ with site.Params.logo.height }}height="{{ . }}"{{ end }}
         class="flex-shrink-0">
  {{ end }}

  {{/* 站点名称 */}}
  <span class="text-xl md:text-2xl font-bold">
    {{ site.Title }}
  </span>
</div>
```

---

### 步骤 4: 优化缓存策略

#### 4.1 识别可缓存的 partials

**可以使用 `partialCached` 的场景**:
- header/footer（全站通用）
- 分类列表（不常变化）
- 侧边栏组件
- Newsletter 表单

#### 4.2 示例：缓存 header

**如果 header.html 是静态的，可以缓存**:

**编辑 `baseof.html`**:
```html
<!-- 当前 -->
{{ partial "header.html" . }}

<!-- 改为 -->
{{ partialCached "header.html" . }}
```

**注意**: 只有当 header 内容不依赖当前页面时才能缓存！

---

### 步骤 5: 清理重复代码

#### 5.1 审查代码重复

```bash
cd /Users/ming/Documents/HUGO/totvan-hugo-theme

# 查找重复的图片处理逻辑
grep -r "hasPrefix.*image.*http" layouts/
grep -r "resources.Get.*image" layouts/
```

#### 5.2 替换为统一函数

将所有图片处理逻辑替换为：
```go
{{ $image := partial "functions/get-featured-image" . }}
{{ $optimized := partial "functions/get-optimized-image" (dict "image" $image "width" 800) }}
```

---

### 步骤 6: 文档注释

为所有函数添加清晰的注释：

```go
{{/*
  函数名称

  功能描述: 简短说明这个函数做什么

  参数:
    - param1: 说明（类型，默认值）
    - param2: 说明

  返回: 返回值说明

  示例:
    {{ $result := partial "functions/xxx" (dict "param1" "value") }}
*/}}
```

---

### 步骤 7: 本地测试

#### 7.1 测试图片处理

```bash
cd /Users/ming/Documents/HUGO/ToTVan
hugo server --buildDrafts
```

访问首页和文章页，检查：
- ✅ 图片正常显示
- ✅ 图片优化生效（查看生成的图片尺寸）
- ✅ 无图片时显示占位符
- ✅ 外部图片（HTTP）正常显示

#### 7.2 测试阅读时间

查看文章卡片，确认：
- ✅ 显示"X 分钟"
- ✅ 短文章显示"1 分钟"
- ✅ 长文章时间合理

#### 7.3 性能测试

```bash
time hugo
```

对比 v0.3.0，应该相差不大或更快（如果缓存生效）。

---

### 步骤 8: 代码审查

#### 8.1 检查清单

- [ ] 所有图片处理统一使用函数
- [ ] 无重复代码
- [ ] 函数注释完整
- [ ] partials 职责清晰
- [ ] 目录结构清晰
- [ ] 使用了 `partialCached`（适当的地方）

#### 8.2 代码统计

```bash
# 统计删除的重复代码行数
git diff v0.3.0 --stat
```

---

### 步骤 9: 提交代码

```bash
cd /Users/ming/Documents/HUGO/totvan-hugo-theme

git add .
git commit -m "Phase 3: Refactor partials for better maintainability

Improvements:
- Created reusable image processing functions:
  * get-featured-image: Unified image retrieval logic
  * get-optimized-image: Automatic image optimization
  * get-reading-time: Calculate reading time
- Refactored card components to use new functions
- Created post-meta component for consistency
- Added branding component for reuse
- Improved partials organization:
  * functions/: Pure functions (no HTML)
  * content/: UI components
  * totvan/: ToTVan-specific components
- Added comprehensive documentation comments
- Applied caching where appropriate

Code quality:
- Eliminated ~100 lines of duplicate code
- Improved separation of concerns
- Enhanced maintainability

See docs/improvement-plan/phase3-partials-refactor.md for details"

git push origin main
git tag -a v0.4.0 -m "Phase 3: Partials Refactoring"
git push origin v0.4.0
```

---

### 步骤 10: 更新站点

```bash
cd /Users/ming/Documents/HUGO/ToTVan

# 更新到 v0.4.0
hugo mod get github.com/harrison-ming/totvan-hugo-theme@v0.4.0
hugo mod tidy

# 重新构建
rm -rf public resources/_gen
hugo

# 测试
hugo server
```

---

## ✅ 验证清单

### 功能验证

- [ ] **图片处理**
  - 内部图片正常显示
  - 外部图片（HTTP）正常显示
  - 图片优化生效
  - 无图片时占位符显示

- [ ] **元信息显示**
  - 分类链接正确
  - 日期格式正确
  - 阅读时间合理

- [ ] **组件复用**
  - post-meta 在多处使用
  - 样式一致

### 性能验证

```bash
# 构建时间
time hugo

# 生成的图片大小
ls -lh resources/_gen/images/ | head -10

# 应该看到优化后的图片（小于原图）
```

### 代码质量

- [ ] 无重复的图片处理逻辑
- [ ] 函数注释完整
- [ ] 目录结构清晰
- [ ] partials 职责单一

---

## 📊 成功指标

- ✅ 删除 ~100 行重复代码
- ✅ 新增 ~80 行函数实现
- ✅ 净减少 ~20 行代码
- ✅ 代码复用性大幅提升
- ✅ 可维护性改善
- ✅ 构建性能保持或提升

---

## 🔄 回滚方案

```bash
cd /Users/ming/Documents/HUGO/ToTVan

# 回滚到 v0.3.0
hugo mod get github.com/harrison-ming/totvan-hugo-theme@v0.3.0
hugo mod tidy
rm -rf public resources/_gen
hugo
```

---

## 📚 相关资源

- [Hugo Partials 文档](https://gohugo.io/templates/partials/)
- [Hugo Image Processing](https://gohugo.io/content-management/image-processing/)
- [Hugo Template Functions](https://gohugo.io/functions/)

---

## 🎯 下一步

Phase 3 是最后一个主要开发阶段，完成后进入文档完善和发布阶段：

1. 完善使用文档
2. 创建示例站点
3. 更新主 README
4. 发布 v1.0.0

---

**最后更新**: 2025-10-22
