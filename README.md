# ToTVan Theme

一个现代化的 Hugo 资讯门户主题，专为温哥华生活资讯网站设计。

## 特性

- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎨 **Tailwind CSS** - 现代化的样式框架
- 🖼️ **图片优化** - 懒加载和自动优化
- 📊 **SEO 优化** - 结构化数据和 meta 标签
- 💰 **AdSense 集成** - 内置广告位支持
- 💬 **Waline 评论系统** - 完整的评论功能（需单独部署后端）
- 🔄 **组件化设计** - 可复用的模板组件

## 快速开始

### 安装

1. 克隆主题到你的 Hugo 项目：

```bash
cd your-hugo-site
git clone https://github.com/harrison-ming/totvan-theme.git themes/totvan-theme
```

2. 在 `hugo.toml` 中配置主题：

```toml
theme = 'totvan-theme'
```

### 配置

在 `hugo.toml` 中添加以下配置：

```toml
[params]
  description = '你的网站描述'
  mainSections = 'posts'

  # Logo 配置
  [params.logo]
    url = "https://your-cdn.com/logo.png"
    width = 60
    height = 60
    alt = "网站 Logo"

  # Google AdSense 配置（可选）
  [params.adsense]
    enable = true
    client = "ca-pub-xxxxxx"
    header_slot = "xxxxxx"
    sidebar_slot = "xxxxxx"

  [params.author]
    name = '你的名字'
    bio = '个人简介'
    avatar = '/images/avatar.jpg'

  # Waline 评论系统配置（可选）
  [params.waline]
    serverURL = "https://your-waline.vercel.app"
    # 更多配置见下方 Waline 集成章节
```

## Waline 评论系统集成

本主题集成了 Waline 评论系统，提供完整的评论功能。**Waline 需要单独部署后端服务**。

### 部署 Waline 后端

1. **克隆后端仓库**
   ```bash
   git clone https://github.com/harrison-ming/totvan-waline.git
   ```

2. **部署到 Vercel**

   按照 [totvan-waline](https://github.com/harrison-ming/totvan-waline) 仓库中的文档：
   - 部署 Waline 服务到 Vercel
   - 配置 PostgreSQL 数据库
   - （可选）配置 Cloudflare Worker 图片上传
   - （可选）配置 OAuth 登录（Twitter/Google）

3. **获取 Waline 服务器 URL**

   部署完成后，你会得到一个 Vercel URL，例如：
   ```
   https://your-project.vercel.app
   ```

### 配置主题

在你的站点配置文件 `hugo.toml` 中添加 Waline 配置：

```toml
[params.waline]
  serverURL = "https://your-waline.vercel.app"  # 必填：你的 Waline 服务器地址
  lang = "zh-CN"                                 # 可选：语言
  locale = {}                                    # 可选：自定义文本
  emoji = ["https://unpkg.com/@waline/emojis@1.2.0/weibo"]  # 可选：表情包
  dark = "auto"                                  # 可选：深色模式
  meta = ["nick", "mail", "link"]                # 可选：评论者信息字段
  requiredMeta = ["nick"]                        # 可选：必填字段
  pageSize = 10                                  # 可选：每页评论数
  wordLimit = [0, 1000]                          # 可选：评论字数限制
  pageview = true                                # 可选：文章阅读量统计
  comment = true                                 # 可选：评论数统计
```

### 详细集成文档

- **完整集成指南**：[docs/waline/integration-guide.md](docs/waline/integration-guide.md)
- **自定义登录页面**：[docs/waline/custom-login.md](docs/waline/custom-login.md)
- **后端部署文档**：[totvan-waline 仓库](https://github.com/harrison-ming/totvan-waline)

## 目录结构

```
totvan-theme/
├── layouts/              # 模板文件
│   ├── _default/        # 默认模板
│   ├── partials/        # 可复用组件
│   └── taxonomy/        # 分类/标签模板
├── static/              # 静态资源
│   ├── css/
│   ├── js/
│   └── images/
├── assets/              # 需编译资源
│   ├── css/
│   └── js/
└── theme.toml          # 主题配置
```

## 模板组件

### 卡片组件

```html
<!-- 垂直卡片（首页） -->
{{- partial "content/card-vertical.html" . -}}

<!-- 横向卡片（列表页） -->
{{- partial "content/card.html" . -}}

<!-- 小卡片（侧边栏） -->
{{- partial "content/list-post.html" . -}}
```

### 图片组件

```html
<!-- 优化图片 -->
{{- partial "content/optimized-image.html" (dict
  "src" .Params.image
  "alt" .Title
  "class" "w-full h-full object-cover"
  "loading" "lazy"
  "priority" false) -}}

<!-- 占位符 -->
{{- partial "content/image-placeholder.html" (dict "size" "w-16 h-16") -}}
```

## 自定义样式

主题使用 Tailwind CSS，你可以通过以下方式自定义：

1. 编辑 `assets/css/custom.css` 添加自定义样式
2. 修改 `assets/input.css` 配置 Tailwind

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 鸣谢

基于 [pehtheme-hugo](https://github.com/fauzanmy/pehtheme-hugo) 主题重构开发。

---

Made with ❤️ by Harrison Ming
