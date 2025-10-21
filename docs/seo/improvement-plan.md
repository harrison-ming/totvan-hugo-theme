# ToTVan Theme SEO 改进方案

**制定日期**: 2025-10-21
**基于评估**: [current-assessment.md](current-assessment.md)
**目标**: 将 SEO 评分从 85/100 提升至 95+/100

---

## 目录

1. [问题分类](#一问题分类)
2. [优先级 1：紧急修复](#二优先级-1紧急修复)
3. [优先级 2：重要改进](#三优先级-2重要改进)
4. [优先级 3：优化改进](#四优先级-3优化改进)
5. [配置文件重构](#五配置文件重构)
6. [实施路线图](#六实施路线图)

---

## 一、问题分类

### 🔴 严重问题（优先级 1）

影响主题复用性和基本 SEO 效果，**必须立即修复**。

| 问题 | 影响 | 影响范围 |
|------|------|---------|
| 硬编码的 Google Analytics ID | 数据混乱、隐私问题 | 所有使用主题的站点 |
| 默认 og:image 使用 SVG | 社交分享图片不显示 | 所有社交分享 |
| JSON-LD Article Schema 不完整 | 富媒体搜索结果缺失 | 文章页面 SEO |

### 🟡 中等问题（优先级 2）

影响 SEO 效果和搜索排名，**应该尽快实施**。

| 问题 | 影响 | 优先级 |
|------|------|--------|
| 缺少 FAQ Schema | 错失问答式搜索结果 | 高 |
| 缺少 Video Schema | 视频内容 SEO 缺失 | 高 |
| 缺少 HowTo Schema | 教程类文章 SEO 不足 | 中 |
| Organization Schema 不完整 | 品牌信任度降低 | 中 |
| 缺少 Image Sitemap | 图片搜索优化不足 | 中 |
| 缺少 News Sitemap | 无法被 Google News 收录 | 中 |

### 🟢 轻微问题（优先级 3）

改善用户体验和细节优化，**可以逐步实施**。

| 问题 | 影响 |
|------|------|
| Description 截断不智能 | 描述可能在句子中间断开 |
| 缺少分页 Meta Tags | 分页页面 SEO 较差 |
| robots.txt 可以更精细 | 爬虫效率不是最优 |
| 缺少移动优化标记 | 移动搜索排名影响 |
| 缺少 Author Person Schema | 作者权威性无法体现 |

---

## 二、优先级 1：紧急修复

### 改进 1.1：参数化 Google Analytics ID

#### 问题描述
```html
<!-- 当前实现 - head.html:177 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**严重性**: 🔴 严重
- 所有使用主题的站点数据都发送到 ToTVan 的 GA
- 违反隐私原则
- 其他站点无法追踪自己的数据

#### 解决方案

**步骤 1**: 在 `hugo.toml` 中添加配置

```toml
[params.analytics]
  # Google Analytics 4
  google = ""  # 格式：G-XXXXXXXXXX

  # 可选：支持其他分析工具
  plausible = ""  # Plausible Analytics
  umami = ""      # Umami Analytics
  matomo = ""     # Matomo Analytics
```

**步骤 2**: 修改 `head.html`

```html
<!-- Google Analytics（仅当配置了 ID 时加载） -->
{{- with site.Params.analytics.google -}}
<script async src="https://www.googletagmanager.com/gtag/js?id={{ . }}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{{ . }}');
</script>
{{- end -}}

<!-- Plausible Analytics（可选） -->
{{- with site.Params.analytics.plausible -}}
<script defer data-domain="{{ . }}" src="https://plausible.io/js/script.js"></script>
{{- end -}}

<!-- Umami Analytics（可选） -->
{{- with site.Params.analytics.umami -}}
<script async src="https://analytics.umami.is/script.js" data-website-id="{{ . }}"></script>
{{- end -}}
```

**步骤 3**: 更新 ToTVan 站点配置

在 `/Users/ming/Documents/HUGO/ToTVan/hugo.toml` 中：

```toml
[params.analytics]
  google = "G-XXXXXXXXXX"  # ToTVan 的 GA ID
```

**文件位置**: `layouts/partials/head.html:176-184`

**测试验证**:
- [ ] 配置 GA ID 后，页面源代码中应包含正确的 ID
- [ ] 不配置时，不应加载任何分析脚本
- [ ] Google Analytics 后台能接收到数据

---

### 改进 1.2：修复默认 og:image 为 PNG/JPG

#### 问题描述

```html
<!-- 当前实现 - head.html:81 -->
<meta property="og:image" content="{{ "/images/logo.svg" | absURL }}">
```

**问题**:
- SVG 不被大多数社交平台支持（Facebook, Twitter, LinkedIn）
- Facebook 推荐尺寸：1200x630 px
- Twitter 推荐尺寸：1200x675 px（比例 16:9）

#### 解决方案

**步骤 1**: 创建默认 OG 图片

在主题 `static/images/` 目录创建：
- `default-og-image.jpg` (1200x630, < 300KB)

**步骤 2**: 在 `hugo.toml` 中配置

```toml
[params.seo]
  # 默认 Open Graph 图片（社交分享时使用）
  defaultImage = "/images/default-og-image.jpg"
  defaultImageWidth = 1200
  defaultImageHeight = 630

  # 或使用外部 CDN
  # defaultImage = "https://cdn.example.com/og-image.jpg"
```

**步骤 3**: 修改 `head.html`

```html
{{- $ogImage := "" -}}
{{- $ogImageWidth := 0 -}}
{{- $ogImageHeight := 0 -}}

{{- if .Params.image -}}
  {{- /* 文章有特色图片 */ -}}
  {{- if hasPrefix .Params.image "http" -}}
    {{- $ogImage = .Params.image -}}
  {{- else -}}
    {{- with resources.Get .Params.image -}}
      {{- $ogImage = .Permalink -}}
      {{- $ogImageWidth = .Width -}}
      {{- $ogImageHeight = .Height -}}
    {{- end -}}
  {{- end -}}
{{- else if site.Params.seo.defaultImage -}}
  {{- /* 使用配置的默认图片 */ -}}
  {{- $ogImage = site.Params.seo.defaultImage | absURL -}}
  {{- $ogImageWidth = site.Params.seo.defaultImageWidth | default 1200 -}}
  {{- $ogImageHeight = site.Params.seo.defaultImageHeight | default 630 -}}
{{- else -}}
  {{- /* 回退到 logo（但警告用户应配置 og:image） */ -}}
  {{- with resources.Get "images/logo.png" -}}
    {{- $ogImage = .Permalink -}}
    {{- $ogImageWidth = .Width -}}
    {{- $ogImageHeight = .Height -}}
  {{- end -}}
{{- end -}}

<meta property="og:image" content="{{ $ogImage }}">
{{- if gt $ogImageWidth 0 -}}
<meta property="og:image:width" content="{{ $ogImageWidth }}">
<meta property="og:image:height" content="{{ $ogImageHeight }}">
{{- end -}}
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:alt" content="{{ if .IsHome }}{{ site.Title }}{{ else }}{{ .Title }}{{ end }}">

<!-- Twitter Cards 使用相同图片 -->
<meta name="twitter:image" content="{{ $ogImage }}">
{{- if gt $ogImageWidth 0 -}}
<meta name="twitter:image:alt" content="{{ if .IsHome }}{{ site.Title }}{{ else }}{{ .Title }}{{ end }}">
{{- end -}}
```

**文件位置**: `layouts/partials/head.html:70-110`

**测试验证**:
- [ ] Facebook Sharing Debugger 正常显示图片
- [ ] Twitter Card Validator 正常显示图片
- [ ] 图片尺寸符合推荐（1200x630）

---

### 改进 1.3：增强 JSON-LD Article Schema

#### 问题描述

当前 Article Schema 缺少重要字段，影响富媒体搜索结果。

**缺失字段**:
- `inLanguage` - 文章语言
- `keywords` - 关键词（SEO 重要）
- `thumbnailUrl` - 缩略图
- `articleSection` - 文章分类
- `commentCount` - 评论数
- `interactionStatistic` - 阅读量统计

#### 解决方案

**步骤 1**: 创建独立的 Schema partial

新建文件：`layouts/partials/schema/article.html`

```html
{{- /* Article Schema for blog posts */ -}}
{{- if and (eq .Type "posts") (not .IsHome) -}}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{ .Title }}",
  "description": "{{ partial "seo/description.html" . }}",
  "url": "{{ .Permalink }}",

  {{- /* 时间戳 */ -}}
  "datePublished": "{{ .Date.Format "2006-01-02T15:04:05Z07:00" }}",
  "dateModified": "{{ .Lastmod.Format "2006-01-02T15:04:05Z07:00" }}",
  "dateCreated": "{{ .Date.Format "2006-01-02T15:04:05Z07:00" }}",

  {{- /* 语言 */ -}}
  "inLanguage": "{{ site.Language.Lang | default "zh-CN" }}",

  {{- /* 关键词 */ -}}
  {{- if .Params.tags -}}
  "keywords": "{{ delimit .Params.tags ", " }}",
  {{- end -}}

  {{- /* 字数和阅读时间 */ -}}
  "wordCount": {{ .WordCount }},
  "timeRequired": "PT{{ math.Ceil (div .WordCount 200.0) }}M",

  {{- /* 作者信息 */ -}}
  "author": {{ partial "schema/person.html" . }},

  {{- /* 图片 */ -}}
  {{- if .Params.image -}}
  "image": {
    "@type": "ImageObject",
    "url": "{{ if hasPrefix .Params.image "http" }}{{ .Params.image }}{{ else }}{{ with resources.Get .Params.image }}{{ .Permalink }}{{ end }}{{ end }}",
    "caption": "{{ .Title }}",
    "width": {{ with resources.Get .Params.image }}{{ .Width }}{{ else }}1200{{ end }},
    "height": {{ with resources.Get .Params.image }}{{ .Height }}{{ else }}630{{ end }}
  },
  "thumbnailUrl": "{{ if hasPrefix .Params.image "http" }}{{ .Params.image }}{{ else }}{{ with resources.Get .Params.image }}{{ .Permalink }}{{ end }}{{ end }}",
  {{- end -}}

  {{- /* 文章分类 */ -}}
  {{- if .Params.categories -}}
  "articleSection": "{{ index .Params.categories 0 }}",
  {{- end -}}

  {{- /* 评论数（如果启用 Waline） */ -}}
  {{- if site.Params.waline.serverURL -}}
  "commentCount": 0,
  "comment": {
    "@type": "Comment",
    "url": "{{ .Permalink }}#waline"
  },
  {{- end -}}

  {{- /* 阅读量统计（如果启用） */ -}}
  "interactionStatistic": [
    {
      "@type": "InteractionCounter",
      "interactionType": "http://schema.org/ReadAction",
      "userInteractionCount": 0
    }
  ],

  {{- /* 发布者信息 */ -}}
  "publisher": {{ partial "schema/organization.html" . }},

  {{- /* 主实体 */ -}}
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{ .Permalink }}"
  }
}
</script>
{{- end -}}
```

**步骤 2**: 创建 Person Schema

新建文件：`layouts/partials/schema/person.html`

```html
{{- /* Person Schema - 返回 JSON 对象，不包含 <script> 标签 */ -}}
{
  "@type": "Person",
  "name": "{{ site.Params.author.name }}",
  {{- with site.Params.author.avatar -}}
  "image": "{{ . | absURL }}",
  {{- end -}}
  {{- with site.Params.author.bio -}}
  "description": "{{ . }}",
  {{- end -}}
  "url": "{{ site.BaseURL }}"
  {{- if or site.Params.author.social.twitter site.Params.author.social.linkedin site.Params.author.social.github -}}
  ,
  "sameAs": [
    {{- $social := slice -}}
    {{- with site.Params.author.social.twitter -}}
      {{- $social = $social | append . -}}
    {{- end -}}
    {{- with site.Params.author.social.linkedin -}}
      {{- $social = $social | append . -}}
    {{- end -}}
    {{- with site.Params.author.social.github -}}
      {{- $social = $social | append . -}}
    {{- end -}}
    {{ delimit $social "\",\n    \"" | safeHTML }}
  ]
  {{- end -}}
}
```

**步骤 3**: 创建 Organization Schema

新建文件：`layouts/partials/schema/organization.html`

```html
{{- /* Organization Schema - 返回 JSON 对象 */ -}}
{
  "@type": "Organization",
  "name": "{{ site.Params.organization.name | default site.Title }}",
  "url": "{{ site.BaseURL }}",
  "logo": {
    "@type": "ImageObject",
    "url": "{{ site.Params.organization.logo | default "/images/logo.png" | absURL }}",
    "width": {{ site.Params.logo.width | default 60 }},
    "height": {{ site.Params.logo.height | default 60 }}
  }
  {{- if or site.Params.organization.social.twitter site.Params.organization.social.facebook site.Params.organization.social.youtube -}}
  ,
  "sameAs": [
    {{- $social := slice -}}
    {{- with site.Params.organization.social.twitter -}}
      {{- $social = $social | append . -}}
    {{- end -}}
    {{- with site.Params.organization.social.facebook -}}
      {{- $social = $social | append . -}}
    {{- end -}}
    {{- with site.Params.organization.social.youtube -}}
      {{- $social = $social | append . -}}
    {{- end -}}
    "{{ delimit $social "\",\n    \"" }}"
  ]
  {{- end -}}
  {{- with site.Params.organization.contact.email -}}
  ,
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "{{ . }}",
    "contactType": "Customer Service"
  }
  {{- end -}}
}
```

**步骤 4**: 修改 `head.html`

移除原有的 JSON-LD 代码（第 128-174 行），替换为：

```html
<!-- Structured Data (JSON-LD) -->
{{- if .IsHome -}}
  {{- partial "schema/website.html" . -}}
{{- else if eq .Type "posts" -}}
  {{- partial "schema/article.html" . -}}
{{- else -}}
  {{- partial "schema/webpage.html" . -}}
{{- end -}}
```

**步骤 5**: 创建 WebSite 和 WebPage Schema

新建 `layouts/partials/schema/website.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{ site.Title }}",
  "url": "{{ site.BaseURL }}",
  "description": "{{ site.Params.description }}",
  "inLanguage": "{{ site.Language.Lang | default "zh-CN" }}",
  "publisher": {{ partial "schema/organization.html" . }},
  "potentialAction": {
    "@type": "SearchAction",
    "target": "{{ site.BaseURL }}search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

新建 `layouts/partials/schema/webpage.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "{{ .Title }}",
  "description": "{{ partial "seo/description.html" . }}",
  "url": "{{ .Permalink }}",
  "inLanguage": "{{ site.Language.Lang | default "zh-CN" }}",
  "publisher": {{ partial "schema/organization.html" . }},
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{ .Permalink }}"
  }
}
</script>
```

**测试验证**:
- [ ] Google Rich Results Test 通过
- [ ] Schema.org Validator 无错误
- [ ] 所有必填字段都存在

---

## 三、优先级 2：重要改进

### 改进 2.1：添加 FAQ Schema

#### 适用场景

文章包含常见问题解答（FAQ）部分。

#### 实现方案

**步骤 1**: Front matter 定义

在文章中定义 FAQ：

```yaml
---
title: "文章标题"
faq:
  - question: "问题1"
    answer: "回答1"
  - question: "问题2"
    answer: "回答2"
---
```

**步骤 2**: 创建 FAQ Schema

新建 `layouts/partials/schema/faq.html`:

```html
{{- with .Params.faq -}}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{- range $index, $item := . -}}
    {{- if $index -}},{{- end -}}
    {
      "@type": "Question",
      "name": "{{ $item.question }}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ $item.answer | plainify }}"
      }
    }
    {{- end -}}
  ]
}
</script>
{{- end -}}
```

**步骤 3**: 在 `head.html` 中调用

```html
{{- if eq .Type "posts" -}}
  {{- partial "schema/article.html" . -}}
  {{- partial "schema/faq.html" . -}}
{{- end -}}
```

**测试验证**:
- [ ] Google Rich Results Test 识别为 FAQ
- [ ] FAQ 在搜索结果中以折叠形式显示

---

### 改进 2.2：添加 Video Schema

#### 适用场景

文章包含视频内容（YouTube, Vimeo, 自托管）。

#### 实现方案

**步骤 1**: Front matter 定义

```yaml
---
title: "视频教程"
video:
  name: "视频标题"
  description: "视频描述"
  thumbnailUrl: "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
  uploadDate: "2025-10-21"
  duration: "PT10M30S"  # ISO 8601 格式：10分30秒
  contentUrl: "https://www.youtube.com/watch?v=VIDEO_ID"
  embedUrl: "https://www.youtube.com/embed/VIDEO_ID"
---
```

**步骤 2**: 创建 Video Schema

新建 `layouts/partials/schema/video.html`:

```html
{{- with .Params.video -}}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "{{ .name }}",
  "description": "{{ .description }}",
  "thumbnailUrl": "{{ .thumbnailUrl }}",
  "uploadDate": "{{ .uploadDate }}T00:00:00Z",
  "duration": "{{ .duration }}",
  "contentUrl": "{{ .contentUrl }}",
  "embedUrl": "{{ .embedUrl }}",
  "publisher": {{ partial "schema/organization.html" $ }}
}
</script>
{{- end -}}
```

**测试验证**:
- [ ] Google Rich Results Test 识别为 Video
- [ ] 视频在搜索结果中显示缩略图

---

### 改进 2.3：添加 HowTo Schema

#### 适用场景

教程、指南类文章。

#### 实现方案

**步骤 1**: Front matter 定义

```yaml
---
title: "如何做XX"
howto:
  totalTime: "PT30M"  # 30分钟
  steps:
    - name: "步骤1"
      text: "步骤1的详细说明"
      image: "/images/step1.jpg"
    - name: "步骤2"
      text: "步骤2的详细说明"
      image: "/images/step2.jpg"
---
```

**步骤 2**: 创建 HowTo Schema

新建 `layouts/partials/schema/howto.html`:

```html
{{- with .Params.howto -}}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "{{ $.Title }}",
  "description": "{{ partial "seo/description.html" $ }}",
  {{- with .totalTime -}}
  "totalTime": "{{ . }}",
  {{- end -}}
  "step": [
    {{- range $index, $step := .steps -}}
    {{- if $index -}},{{- end -}}
    {
      "@type": "HowToStep",
      "position": {{ add $index 1 }},
      "name": "{{ $step.name }}",
      "text": "{{ $step.text }}"
      {{- with $step.image -}}
      ,
      "image": "{{ . | absURL }}"
      {{- end -}}
    }
    {{- end -}}
  ]
}
</script>
{{- end -}}
```

**测试验证**:
- [ ] Google Rich Results Test 识别为 HowTo
- [ ] 搜索结果显示步骤列表

---

### 改进 2.4：添加 Image Sitemap

#### 问题描述

当前只有页面 sitemap，图片无法被高效索引。

#### 解决方案

**步骤 1**: 创建 Image Sitemap

新建 `layouts/sitemap-images.xml`:

```xml
{{ printf "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" | safeHTML }}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  {{- range where .Site.RegularPages "Type" "posts" -}}
    {{- if .Params.image -}}
    <url>
      <loc>{{ .Permalink }}</loc>
      <image:image>
        <image:loc>{{ if hasPrefix .Params.image "http" }}{{ .Params.image }}{{ else }}{{ .Params.image | absURL }}{{ end }}</image:loc>
        <image:title>{{ .Title }}</image:title>
        {{- with .Params.imageCaption -}}
        <image:caption>{{ . }}</image:caption>
        {{- end -}}
      </image:image>
    </url>
    {{- end -}}
  {{- end -}}

</urlset>
```

**步骤 2**: 配置输出格式

在 `hugo.toml` 中：

```toml
[outputs]
  home = ["HTML", "RSS"]
  section = ["HTML"]

[outputFormats.ImageSitemap]
  mediaType = "application/xml"
  baseName = "sitemap-images"
  isPlainText = true
  notAlternative = true
```

**步骤 3**: 更新 robots.txt

```
Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-images.xml
```

**测试验证**:
- [ ] 访问 `/sitemap-images.xml` 正常
- [ ] Google Search Console 能识别图片

---

### 改进 2.5：添加 News Sitemap

#### 适用场景

资讯类站点，希望被 Google News 收录。

#### 解决方案

**步骤 1**: 配置

```toml
[params.seo]
  enableNewsSitemap = true
  newsPublicationName = "ToTVan"
  newsPublicationLanguage = "zh"
```

**步骤 2**: 创建 News Sitemap

新建 `layouts/sitemap-news.xml`:

```xml
{{ printf "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" | safeHTML }}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">

  {{- $recentDays := 2 -}}
  {{- $cutoff := now.AddDate 0 0 (mul -1 $recentDays) -}}

  {{- range where .Site.RegularPages "Type" "posts" -}}
    {{- if ge .Date.Unix $cutoff.Unix -}}
    <url>
      <loc>{{ .Permalink }}</loc>
      <news:news>
        <news:publication>
          <news:name>{{ site.Params.seo.newsPublicationName | default site.Title }}</news:name>
          <news:language>{{ site.Params.seo.newsPublicationLanguage | default "zh" }}</news:language>
        </news:publication>
        <news:publication_date>{{ .Date.Format "2006-01-02T15:04:05Z07:00" }}</news:publication_date>
        <news:title>{{ .Title }}</news:title>
        {{- with .Params.keywords -}}
        <news:keywords>{{ delimit . ", " }}</news:keywords>
        {{- end -}}
      </news:news>
    </url>
    {{- end -}}
  {{- end -}}

</urlset>
```

**步骤 3**: 更新 robots.txt

```
Sitemap: https://example.com/sitemap-news.xml
```

**测试验证**:
- [ ] 只包含最近 2 天的文章
- [ ] Google News Publisher Center 能识别

---

### 改进 2.6：智能 Description 生成

#### 问题描述

当前直接截断 160 字符，可能在句子中间断开。

#### 解决方案

新建 `layouts/partials/seo/description.html`:

```html
{{- $description := "" -}}

{{- if .IsHome -}}
  {{- $description = site.Params.description -}}
{{- else if .Params.description -}}
  {{- $description = .Params.description -}}
{{- else if .Summary -}}
  {{- /* 智能截断：优先在句号、问号、感叹号处截断 */ -}}
  {{- $summary := .Summary | plainify -}}
  {{- $maxLength := 160 -}}

  {{- if gt (len $summary) $maxLength -}}
    {{- $truncated := substr $summary 0 $maxLength -}}

    {{- /* 寻找最后一个中文句子结束符 */ -}}
    {{- $lastPeriodCN := strings.LastIndex $truncated "。" -}}
    {{- $lastQuestionCN := strings.LastIndex $truncated "？" -}}
    {{- $lastExclaimCN := strings.LastIndex $truncated "！" -}}

    {{- /* 寻找最后一个英文句子结束符 */ -}}
    {{- $lastPeriodEN := strings.LastIndex $truncated ". " -}}
    {{- $lastQuestionEN := strings.LastIndex $truncated "? " -}}
    {{- $lastExclaimEN := strings.LastIndex $truncated "! " -}}

    {{- $breakPoint := 0 -}}
    {{- range $pos := slice $lastPeriodCN $lastQuestionCN $lastExclaimCN $lastPeriodEN $lastQuestionEN $lastExclaimEN -}}
      {{- if gt $pos $breakPoint -}}
        {{- $breakPoint = $pos -}}
      {{- end -}}
    {{- end -}}

    {{- /* 如果找到合适的断点（距离起点至少80字符），在那里截断 */ -}}
    {{- if gt $breakPoint 80 -}}
      {{- $description = substr $summary 0 (add $breakPoint 1) -}}
    {{- else -}}
      {{- /* 否则在最后一个空格处截断并加省略号 */ -}}
      {{- $lastSpace := strings.LastIndex $truncated " " -}}
      {{- if gt $lastSpace 0 -}}
        {{- $description = printf "%s..." (substr $summary 0 $lastSpace) -}}
      {{- else -}}
        {{- $description = printf "%s..." $truncated -}}
      {{- end -}}
    {{- end -}}
  {{- else -}}
    {{- $description = $summary -}}
  {{- end -}}
{{- else -}}
  {{- $description = site.Params.description -}}
{{- end -}}

{{- return $description -}}
```

**在 `head.html` 中使用**:

```html
<meta name="description" content="{{ partial "seo/description.html" . }}">
```

---

## 四、优先级 3：优化改进

### 改进 3.1：添加分页 Meta Tags

在列表页模板中添加：

```html
<!-- layouts/_default/list.html -->
{{ define "head-additions" }}
  {{- if .Paginator.HasPrev -}}
  <link rel="prev" href="{{ .Paginator.Prev.URL | absURL }}">
  {{- end -}}
  {{- if .Paginator.HasNext -}}
  <link rel="next" href="{{ .Paginator.Next.URL | absURL }}">
  {{- end -}}
{{ end }}
```

在 `baseof.html` 中：

```html
<head>
  {{- partial "head.html" . -}}
  {{- block "head-additions" . }}{{ end -}}
</head>
```

---

### 改进 3.2：优化 robots.txt

```
User-agent: *
# 允许所有内容
Allow: /

# 禁止索引特定页面
Disallow: /search
Disallow: /login
Disallow: /register
Disallow: /*.json$
Disallow: /*?  # 排除查询参数页面

# 针对图片爬虫的特殊规则
User-agent: Googlebot-Image
Allow: /images/
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.png$
Allow: /*.webp$
Allow: /*.svg$

# 针对广告爬虫
User-agent: AdsBot-Google
Disallow: /

# Sitemap 指向
Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-images.xml
Sitemap: https://example.com/sitemap-news.xml

# 爬取延迟（可选，降低服务器负载）
# Crawl-delay: 10
```

---

### 改进 3.3：添加移动优化标记

在 `head.html` 中添加：

```html
<!-- 移动 Web App 支持 -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="{{ site.Title }}">

<!-- 主题颜色（浏览器地址栏颜色） -->
<meta name="theme-color" content="#06b6d4">
<meta name="msapplication-TileColor" content="#06b6d4">
<meta name="msapplication-navbutton-color" content="#06b6d4">

<!-- 格式检测（禁止自动识别电话号码等） -->
<meta name="format-detection" content="telephone=no,email=no,address=no">
```

---

## 五、配置文件重构

### 新的 hugo.toml SEO 配置结构

```toml
[params.seo]
  # Open Graph 默认图片
  defaultImage = "/images/default-og-image.jpg"
  defaultImageWidth = 1200
  defaultImageHeight = 630

  # Sitemap 配置
  enableImageSitemap = true
  enableNewsSitemap = true
  newsPublicationName = "ToTVan"
  newsPublicationLanguage = "zh"

  # 结构化数据启用开关
  enableFAQSchema = true
  enableVideoSchema = true
  enableHowToSchema = true

[params.analytics]
  # Google Analytics 4
  google = "G-XXXXXXXXXX"

  # 可选：其他分析工具
  plausible = ""
  umami = ""
  matomo = ""

[params.organization]
  name = "ToTVan"
  logo = "/images/logo.png"
  description = "温哥华生活资讯平台"

  [params.organization.social]
    twitter = "https://twitter.com/totvan"
    facebook = "https://facebook.com/totvan"
    youtube = "https://youtube.com/@totvan"
    linkedin = "https://linkedin.com/company/totvan"

  [params.organization.contact]
    email = "contact@example.com"
    phone = "+1-604-XXX-XXXX"

  [params.organization.address]
    streetAddress = "123 Main St"
    addressLocality = "Vancouver"
    addressRegion = "BC"
    postalCode = "V6B 1A1"
    addressCountry = "CA"

[params.author]
  name = "ToTVan Team"
  avatar = "/images/author.jpg"
  bio = "温哥华生活资讯专家，为华人提供本地生活指南"

  [params.author.social]
    twitter = "https://twitter.com/totvan"
    linkedin = "https://linkedin.com/in/totvan"
    github = "https://github.com/totvan"
```

---

## 六、实施路线图

### 阶段 1：紧急修复（预计 1-2 天）

**目标**: 修复影响主题复用性的严重问题

- [ ] 参数化 Google Analytics ID
  - 修改 `head.html`
  - 更新文档
  - 测试验证
- [ ] 修复默认 og:image 为 PNG/JPG
  - 创建默认 OG 图片
  - 修改配置
  - 修改 `head.html`
  - Facebook/Twitter 测试
- [ ] 增强 Article Schema
  - 创建 `schema/article.html`
  - 创建 `schema/person.html`
  - 创建 `schema/organization.html`
  - 修改 `head.html`
  - Rich Results 测试

**验收标准**:
- 所有新站点可以使用自己的 GA ID
- 社交分享图片正常显示
- Google Rich Results Test 通过

---

### 阶段 2：核心改进（预计 3-5 天）

**目标**: 添加高级结构化数据

- [ ] 创建 Schema 模块系统
  - `schema/website.html`
  - `schema/webpage.html`
  - `schema/faq.html`
  - `schema/video.html`
  - `schema/howto.html`
- [ ] 智能 Description 生成
  - 创建 `seo/description.html`
  - 集成到 `head.html`
- [ ] Organization Schema 完善
  - 添加社交链接
  - 添加联系方式
  - 添加地址信息

**验收标准**:
- FAQ/Video/HowTo 文章能正确显示富媒体结果
- Description 不会在句子中间断开
- Organization 信息完整

---

### 阶段 3：扩展功能（预计 5-7 天）

**目标**: 添加专业 Sitemap

- [ ] 创建 Image Sitemap
  - `sitemap-images.xml`
  - 配置输出格式
  - 更新 robots.txt
- [ ] 创建 News Sitemap
  - `sitemap-news.xml`
  - 配置参数
  - 测试时间过滤
- [ ] 文档和示例
  - 使用指南
  - 配置示例
  - FAQ 示例文章
  - Video 示例文章
  - HowTo 示例文章

**验收标准**:
- 所有 Sitemap 可访问
- Google Search Console 能识别

---

### 阶段 4：精细优化（预计 3-5 天）

**目标**: 用户体验和细节完善

- [ ] 优化 robots.txt
- [ ] 添加分页 Meta Tags
- [ ] 添加移动优化标记
- [ ] 性能测试和优化
- [ ] 文档完善
- [ ] 示例站点更新

**验收标准**:
- Google PageSpeed Insights 90+ 分
- 所有测试工具通过
- 文档完整

---

## 七、测试清单

### 7.1 基础 SEO 测试

- [ ] **Title 标签**
  - 首页显示站点标题
  - 内页显示"页面标题 | 站点标题"
  - 长度合理（50-60 字符）

- [ ] **Description 标签**
  - 每页有唯一的 description
  - 长度 150-160 字符
  - 包含关键词
  - 不在句子中间截断

- [ ] **Canonical URL**
  - 每页有 canonical 标签
  - URL 正确

---

### 7.2 Open Graph 测试

工具: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

- [ ] og:title 正确
- [ ] og:description 正确
- [ ] og:image 显示（1200x630）
- [ ] og:type 正确（website/article）
- [ ] og:url 正确
- [ ] article:published_time 存在（文章页）
- [ ] article:author 存在（文章页）

---

### 7.3 Twitter Cards 测试

工具: [Twitter Card Validator](https://cards-dev.twitter.com/validator)

- [ ] 卡片类型为 summary_large_image
- [ ] 标题、描述、图片都显示
- [ ] 图片尺寸合适

---

### 7.4 结构化数据测试

工具: [Google Rich Results Test](https://search.google.com/test/rich-results)

- [ ] **WebSite Schema**
  - 首页通过测试
  - SearchAction 存在

- [ ] **Article Schema**
  - 文章页通过测试
  - 必填字段完整
  - 无错误和警告

- [ ] **FAQ Schema**（如适用）
  - 问题和答案正确提取
  - 显示为 FAQ 富媒体结果

- [ ] **Video Schema**（如适用）
  - 视频信息完整
  - 缩略图显示

- [ ] **HowTo Schema**（如适用）
  - 步骤列表正确
  - 显示为 HowTo 富媒体结果

- [ ] **BreadcrumbList Schema**
  - 面包屑路径正确
  - 位置编号准确

---

### 7.5 Sitemap 测试

- [ ] **主 Sitemap (sitemap.xml)**
  - 可访问
  - 包含所有重要页面
  - 优先级合理
  - lastmod 正确

- [ ] **Image Sitemap**
  - 包含所有文章图片
  - 图片 URL 正确

- [ ] **News Sitemap**
  - 只包含最近 2 天文章
  - 格式正确

---

### 7.6 性能测试

工具: [Google PageSpeed Insights](https://pagespeed.web.dev/)

- [ ] **移动端**
  - Performance > 90
  - FCP < 1.8s
  - LCP < 2.5s
  - CLS < 0.1

- [ ] **桌面端**
  - Performance > 95
  - FCP < 1.0s
  - LCP < 1.5s

---

### 7.7 移动友好测试

工具: [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

- [ ] 通过移动友好测试
- [ ] 文字可读（无需缩放）
- [ ] 点击目标足够大
- [ ] 内容宽度适合屏幕

---

### 7.8 Schema Validator

工具: [Schema.org Validator](https://validator.schema.org/)

- [ ] 所有页面的 JSON-LD 无语法错误
- [ ] 必填字段都存在
- [ ] 类型定义正确

---

### 7.9 Google Search Console

- [ ] 提交所有 Sitemap
- [ ] 无爬取错误
- [ ] 无索引错误
- [ ] 富媒体结果正常

---

## 八、常见问题和解决方案

### Q1: 修改后如何验证 SEO 效果？

**A**: 分阶段验证

1. **开发阶段** - 本地测试
   - 使用 Chrome DevTools 查看 HTML
   - 使用在线验证工具测试

2. **部署后** - 线上测试
   - Google Search Console 监控
   - 定期运行 Rich Results Test
   - 监控搜索排名变化（需要几周时间）

---

### Q2: 如何测试 JSON-LD 是否正确？

**A**: 使用多个工具交叉验证

1. Google Rich Results Test
2. Schema.org Validator
3. Chrome DevTools → Elements → 查看 `<script type="application/ld+json">`

---

### Q3: og:image 图片不显示怎么办？

**A**: 检查清单

- [ ] 图片格式为 JPG/PNG（不是 SVG）
- [ ] 图片尺寸至少 1200x630
- [ ] 图片 URL 可公开访问（不需要登录）
- [ ] 图片大小 < 5MB
- [ ] 使用 Facebook Debugger 刷新缓存

---

### Q4: 多久能看到 SEO 改进效果？

**A**: 分层级

- **立即** - Rich Results、社交分享改善
- **1-2 周** - Google 重新索引页面
- **1-3 月** - 搜索排名提升
- **3-6 月** - 流量明显增长

---

### Q5: 是否需要全部实施？

**A**: 根据站点类型选择

**最小实施**（所有站点必须）:
- 优先级 1 的所有改进

**标准实施**（资讯站点推荐）:
- 优先级 1 + 优先级 2

**完整实施**（专业站点）:
- 所有优先级

---

## 九、参考资源

### 官方文档

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

### Hugo 文档

- [Hugo SEO](https://gohugo.io/templates/embedded/#open-graph)
- [Hugo Sitemap](https://gohugo.io/templates/sitemap-template/)
- [Hugo Outputs](https://gohugo.io/templates/output-formats/)

### 测试工具

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### 学习资源

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Web.dev Learn SEO](https://web.dev/learn/seo/)
- [Moz Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo)

---

**下一步**: 查看 [implementation-checklist.md](implementation-checklist.md) 开始实施。
