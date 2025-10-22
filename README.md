# ToTVan Hugo Theme

一个现代化、模块化的 Hugo 主题,专为内容站点和资讯门户设计。

[![GitHub release](https://img.shields.io/github/v/release/harrison-ming/totvan-hugo-theme)](https://github.com/harrison-ming/totvan-hugo-theme/releases)
[![Hugo Version](https://img.shields.io/badge/Hugo-%3E%3D0.145.0-blue)](https://gohugo.io/)
[![License](https://img.shields.io/github/license/harrison-ming/totvan-hugo-theme)](LICENSE)

## ✨ 特性

### 核心功能

- 📱 **完全响应式** - 完美适配桌面、平板和移动设备
- 🎨 **Tailwind CSS** - 现代化的样式框架,易于自定义
- 🖼️ **智能图片处理** - 懒加载、自动优化、CDN 支持
- 🚀 **性能优化** - DNS 预连接、资源预加载、极速构建
- ♿ **无障碍访问** - 遵循 WCAG 标准

### SEO 和营销

- 📊 **完整 SEO 支持** - Open Graph、Twitter Cards、JSON-LD
- 🔍 **搜索引擎优化** - 结构化数据、规范化 URL、sitemap
- 📈 **Google Analytics 4** - 内置分析集成
- 💰 **AdSense 集成** - 开箱即用的广告支持

### 灵活性和可扩展性

- 🏠 **4 种首页布局** - Category Grid、Magazine、Minimal、Hero-Featured
- 🧩 **组件化架构** - 可复用的模板组件和函数
- 🎯 **高度可配置** - 丰富的配置选项,零代码定制
- 💬 **Waline 评论系统** - 完整的评论功能支持

## 🚀 快速开始

### 方式 1: Hugo 模块 (推荐)

在你的 Hugo 站点配置中:

```toml
# hugo.toml
[module]
  [[module.imports]]
    path = "github.com/harrison-ming/totvan-hugo-theme"
```

然后运行:

```bash
hugo mod get -u
hugo mod tidy
```

### 方式 2: Git Submodule

```bash
cd your-hugo-site
git submodule add https://github.com/harrison-ming/totvan-hugo-theme.git themes/totvan
```

在 `hugo.toml` 中:

```toml
theme = 'totvan'
```

### 方式 3: 直接克隆

```bash
cd your-hugo-site
git clone https://github.com/harrison-ming/totvan-hugo-theme.git themes/totvan
```

## 📖 文档

### 入门指南

- [安装指南](docs/getting-started.md) - 详细的安装和配置步骤
- [配置参考](docs/configuration.md) - 所有配置选项说明
- [示例配置](hugo.toml.example) - 完整的配置示例文件

### 功能文档

- [首页布局](docs/homepage-layouts.md) - 4 种首页布局使用指南
- [组件和函数](docs/components-and-functions.md) - 可复用组件和函数 API
- [Waline 集成](docs/waline/integration-guide.md) - 评论系统集成指南

### 改进计划

- [改进计划总览](docs/improvement-plan/README.md) - ToTVan 演进路线图
- [Phase 1: SEO 模块化](docs/improvement-plan/phase1-seo-modules.md)
- [Phase 2: 首页系统](docs/improvement-plan/phase2-homepage-system.md)
- [Phase 3: Partials 重构](docs/improvement-plan/phase3-partials-refactor.md)

## 🏠 首页布局选择

ToTVan 提供 4 种内置首页布局,无需编写代码即可切换:

### 1. Category Grid (默认)

适合多分类内容站点。

```toml
[params.homepage]
  layout = "category-grid"
```

**特点**: 最新文章 + 多个分类网格

### 2. Magazine

适合新闻媒体、杂志网站。

```toml
[params.homepage]
  layout = "magazine"
```

**特点**: 大型 Hero 区域 + 编辑推荐 + 热门分类

### 3. Minimal

适合个人博客、技术博客。

```toml
[params.homepage]
  layout = "minimal"
```

**特点**: 极简文字列表,专注内容

### 4. Hero-Featured

适合品牌网站、媒体平台。

```toml
[params.homepage]
  layout = "hero-featured"
```

**特点**: 全宽 Hero + 特色文章网格

详见: [首页布局文档](docs/homepage-layouts.md)

## ⚙️ 基础配置

### 最小配置

```toml
# hugo.toml
baseURL = 'https://example.com/'
languageCode = 'zh-CN'
title = '我的网站'
theme = 'totvan'

[params]
  description = '网站描述'

[params.author]
  name = '作者名'
  email = 'author@example.com'
```

### 完整配置示例

```toml
# hugo.toml
baseURL = 'https://totvan.com/'
languageCode = 'zh-CN'
title = 'ToTVan'
theme = 'totvan'

[params]
  description = 'ToTVan: 温哥华生活资讯'
  mainSections = ['posts']

  # 首页布局
  [params.homepage]
    layout = "category-grid"  # 或 magazine, minimal, hero-featured

    [params.homepage.categoryGrid]
      topCategoriesCount = 7
      postsPerCategory = 3
      latestPostsCount = 3

  # SEO 和营销
  [params.marketing]
    [params.marketing.seo]
      site_type = "Organization"
      org_name = "ToTVan"

    [params.marketing.analytics]
      google_analytics = "G-XXXXXXXXXX"

  # Logo 配置
  [params.logo]
    url = "https://cdn.example.com/logo.png"
    width = 60
    height = 60
    alt = "ToTVan Logo"

  # 作者信息
  [params.author]
    name = 'Harrison Ming'
    email = 'author@totvan.com'
    bio = '温哥华生活资讯分享'

  # AdSense (可选)
  [params.adsense]
    enable = true
    client = "ca-pub-xxxxxx"
    header_slot = "xxxxxx"
    sidebar_slot = "xxxxxx"

  # Waline 评论 (可选)
  [params.waline]
    serverURL = "https://your-waline.vercel.app"
    lang = "zh-CN"
    pageview = true
```

完整配置选项见: [配置参考](docs/configuration.md)

## 🧩 使用组件

### 文章卡片组件

```go-html-template
{{/* 纵向卡片 */}}
{{ partial "components/article-card" (dict "page" . "variant" "vertical") }}

{{/* 横向卡片带摘要 */}}
{{ partial "components/article-card" (dict
  "page" .
  "variant" "horizontal"
  "showExcerpt" true) }}

{{/* 极简卡片 */}}
{{ partial "components/article-card" (dict
  "page" .
  "variant" "minimal") }}
```

### 实用函数

```go-html-template
{{/* 获取图片 URL */}}
{{ $imgUrl := partial "functions/get-image-url" (dict "page" .) }}

{{/* 格式化日期 */}}
{{ $date := partial "functions/format-date" (dict "date" .Date "format" "long") }}

{{/* 获取主分类 */}}
{{ $category := partial "functions/get-primary-category" (dict "page" .) }}

{{/* 获取顶级分类 */}}
{{ $topCategories := partial "functions/get-top-categories" (dict "context" . "limit" 5) }}
```

详见: [组件和函数文档](docs/components-and-functions.md)

## 💬 Waline 评论系统

ToTVan 集成了 Waline 评论系统。

### 快速设置

1. **部署 Waline 后端**

   参考: [totvan-waline](https://github.com/harrison-ming/totvan-waline)

2. **配置主题**

```toml
[params.waline]
  serverURL = "https://your-waline.vercel.app"
  lang = "zh-CN"
  pageview = true
  comment = true
```

详见: [Waline 集成指南](docs/waline/integration-guide.md)

## 📁 项目结构

```
totvan-hugo-theme/
├── layouts/
│   ├── _default/           # 默认布局
│   │   ├── baseof.html     # 基础模板
│   │   ├── home.html       # 首页路由
│   │   ├── single.html     # 文章页
│   │   └── list.html       # 列表页
│   ├── partials/
│   │   ├── totvan/         # ToTVan 核心组件
│   │   │   ├── seo.html
│   │   │   ├── analytics.html
│   │   │   └── head-basic.html
│   │   ├── home-layouts/   # 首页布局
│   │   │   ├── category-grid.html
│   │   │   ├── magazine.html
│   │   │   ├── minimal.html
│   │   │   └── hero-featured.html
│   │   ├── components/     # 可复用组件
│   │   │   └── article-card.html
│   │   └── functions/      # 实用函数
│   │       ├── get-image-url.html
│   │       ├── format-date.html
│   │       ├── get-primary-category.html
│   │       ├── get-top-categories.html
│   │       └── get-latest-posts-excluding.html
├── assets/
│   ├── css/
│   └── js/
├── static/
├── docs/                   # 文档
└── hugo.toml.example      # 示例配置
```

## 🎨 自定义样式

### 方法 1: 站点配置

在你的站点的 `assets/css/custom.css`:

```css
/* 自定义主题颜色 */
:root {
  --primary-color: #3b82f6;
}

/* 自定义样式 */
.custom-class {
  /* your styles */
}
```

### 方法 2: Tailwind 配置

修改站点的 `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
    },
  },
}
```

## 📊 性能

- ⚡ 构建速度: ~10s (3981 页面)
- 🎯 Lighthouse 分数: 95+ (性能)
- 📦 CSS 包大小: ~50KB (压缩后)
- 🖼️ 图片优化: 懒加载 + CDN

## 🌐 浏览器支持

- Chrome (最新 2 个版本)
- Firefox (最新 2 个版本)
- Safari (最新 2 个版本)
- Edge (最新 2 个版本)

## 🔄 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细更新历史。

### 最新版本: v1.0.0

- ✅ 模块化 SEO 和 Analytics 系统
- ✅ 4 种灵活的首页布局
- ✅ 统一的组件和函数库
- ✅ 完整的文档和示例

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 鸣谢

- 基于 [pehtheme-hugo](https://github.com/fauzanmy/pehtheme-hugo) 重构开发
- 受 [Hugo Blox Builder](https://github.com/HugoBlox/hugo-blox-builder) 启发

## 📧 联系方式

- **作者**: Harrison Ming
- **网站**: [ToTVan.com](https://totvan.com)
- **GitHub**: [harrison-ming](https://github.com/harrison-ming)
- **Issues**: [GitHub Issues](https://github.com/harrison-ming/totvan-hugo-theme/issues)

---

⭐ 如果这个主题对你有帮助,请给个 Star!

Made with ❤️ for the Hugo community
