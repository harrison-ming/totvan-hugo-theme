# Waline 评论系统集成指南

本指南将帮助你在使用 totvan-theme 主题时完整集成 Waline 评论系统。

## 📋 目录

1. [概述](#概述)
2. [前置要求](#前置要求)
3. [后端部署](#后端部署)
4. [主题配置](#主题配置)
5. [可选功能](#可选功能)
6. [测试验证](#测试验证)
7. [故障排查](#故障排查)

## 概述

totvan-theme 主题已内置 Waline 评论系统的前端集成代码，但 **Waline 需要单独部署后端服务**。完整的 Waline 系统包括：

- **后端服务**（需要部署）- 处理评论存储、管理、通知等
- **前端组件**（已集成在主题中）- 评论展示和提交界面
- **数据库**（需要配置）- 存储评论数据
- **图片上传**（可选）- Cloudflare Worker + R2 存储

### 架构图

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Hugo 网站      │      │  Waline 后端      │      │  PostgreSQL     │
│  (totvan-theme) │─────→│  (Vercel)        │─────→│  数据库         │
│   前端集成       │      │  totvan-waline   │      │  (Neon/Supabase)│
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                  │
                                  ↓
                         ┌──────────────────┐
                         │ Cloudflare Worker│
                         │  图片上传 (可选)  │
                         │  R2 存储         │
                         └──────────────────┘
```

## 前置要求

在开始之前，你需要：

- ✅ 已安装并配置好 totvan-theme 主题
- ✅ 注册 [Vercel](https://vercel.com) 账号（免费）
- ✅ 准备 PostgreSQL 数据库（推荐 [Neon](https://neon.tech/) 或 [Supabase](https://supabase.com/)，有免费套餐）
- ✅ （可选）注册 [Cloudflare](https://cloudflare.com) 账号（用于图片上传，免费）

## 后端部署

### 步骤 1：克隆后端仓库

Waline 后端代码在独立仓库中：

```bash
# 克隆到任意位置（不需要在 Hugo 项目中）
git clone https://github.com/harrison-ming/totvan-waline.git
cd totvan-waline
```

### 步骤 2：准备数据库

#### 使用 Neon（推荐）

1. 访问 [Neon.tech](https://neon.tech) 并注册账号
2. 创建新项目，选择区域（建议选择离用户较近的区域）
3. 创建数据库后，获取连接信息：
   - `POSTGRES_URL` - 主连接字符串
   - `POSTGRES_PRISMA_URL` - Prisma 连接字符串
   - `POSTGRES_URL_NON_POOLING` - 非池化连接

4. 初始化数据库结构：

```bash
# 在 totvan-waline 目录中执行
psql "your-postgres-url" -f docs/database/waline.pgsql
```

### 步骤 3：部署到 Vercel

#### 方式 A：通过 GitHub（推荐）

1. **Fork 仓库**
   - 访问 https://github.com/harrison-ming/totvan-waline
   - 点击 "Fork" 创建你自己的副本

2. **在 Vercel 中导入**
   - 登录 [Vercel](https://vercel.com)
   - 点击 "New Project"
   - 选择你 fork 的 `totvan-waline` 仓库
   - 点击 "Import"

3. **配置环境变量**

   在 Vercel 项目设置中添加环境变量（参考 `docs/env-variables.md`）：

   ```env
   # 必填：数据库连接
   POSTGRES_DATABASE=your_database_name
   POSTGRES_HOST=your_database_host
   POSTGRES_PASSWORD=your_database_password
   POSTGRES_PRISMA_URL=your_prisma_connection_url
   POSTGRES_URL=your_connection_url
   POSTGRES_URL_NON_POOLING=your_non_pooling_url
   POSTGRES_USER=your_database_user

   # 可选：站点信息
   SITE_NAME=Your Site Name
   SITE_URL=https://your-site.com
   AUTHOR_EMAIL=your@email.com
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成（约 1-2 分钟）
   - 记录你的 Vercel URL：`https://your-project.vercel.app`

#### 方式 B：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在 totvan-waline 目录中登录
vercel login

# 部署
vercel

# 按提示配置项目
# 添加环境变量
vercel env add POSTGRES_URL
# ... 添加其他环境变量

# 部署到生产环境
vercel --prod
```

### 步骤 4：验证后端部署

访问你的 Vercel URL：

```
https://your-waline-domain.vercel.app
```

如果看到 Waline 管理后台登录页面，说明部署成功！

## 主题配置

totvan-theme 主题已内置 Waline 前端集成，你只需要在站点配置中添加 Waline 服务器地址。

### 基础配置

在你的 Hugo 站点的 `hugo.toml` 中添加：

```toml
[params.waline]
  serverURL = "https://your-waline-domain.vercel.app"  # 必填：替换为你的 Vercel URL
```

### 完整配置选项

```toml
[params.waline]
  # 必填配置
  serverURL = "https://your-waline-domain.vercel.app"

  # 界面配置
  lang = "zh-CN"                    # 语言：zh-CN, en-US, ja-JP 等
  dark = "auto"                     # 深色模式：auto, true, false
  meta = ["nick", "mail", "link"]   # 评论者信息字段
  requiredMeta = ["nick"]           # 必填字段
  placeholder = "欢迎评论..."       # 输入框占位符

  # 功能配置
  pageSize = 10                     # 每页评论数
  wordLimit = [0, 1000]             # 评论字数限制 [最小, 最大]
  pageview = true                   # 启用文章阅读量统计
  comment = true                    # 启用评论数统计

  # 表情包配置
  emoji = [
    "https://unpkg.com/@waline/emojis@1.2.0/weibo",
    "https://unpkg.com/@waline/emojis@1.2.0/bilibili"
  ]

  # 图片上传（如果配置了 Cloudflare Worker）
  imageUploader = true              # 启用图片上传
  imageUploadURL = "https://waline-image-upload.your-subdomain.workers.dev"

  # 搜索配置
  search = false                    # 启用搜索（需要后端配置 Algolia）

  # 登录配置
  login = "enable"                  # 登录模式：enable, disable, force

  # 头像配置
  avatar = "mp"                     # 头像类型：mp, identicon, monsterid, wavatar 等
  avatarCDN = "https://sdn.geekzu.org/avatar/"  # 头像 CDN
  avatarForce = false               # 强制使用 Gravatar
```

### 测试配置

1. **启动 Hugo 开发服务器**

```bash
cd your-hugo-site
hugo server -D
```

2. **访问任意文章页面**

   你应该能看到页面底部出现 Waline 评论框。

3. **发表测试评论**

   输入昵称、邮箱，发表一条评论，检查是否能正常提交和显示。

## 可选功能

### 1. 图片上传功能

如果你希望用户能在评论中上传图片，需要配置 Cloudflare Worker。

**部署步骤：**

1. 参考 [totvan-waline/docs/cloudflare-worker/image-upload/README.md](https://github.com/harrison-ming/totvan-waline/blob/main/docs/cloudflare-worker/image-upload/README.md)
2. 部署 Worker 并获取 URL
3. 在主题配置中添加：

```toml
[params.waline]
  serverURL = "https://your-waline-domain.vercel.app"
  imageUploader = true
  imageUploadURL = "https://waline-image-upload.your-subdomain.workers.dev"
```

### 2. OAuth 社交登录

支持 Twitter、Google 等社交账号登录。

**配置步骤：**

1. 参考 [totvan-waline/docs/oauth-setup.md](https://github.com/harrison-ming/totvan-waline/blob/main/docs/oauth-setup.md)
2. 在 Vercel 环境变量中添加 OAuth 配置
3. 主题会自动显示社交登录按钮

### 3. 自定义登录页面

totvan-theme 提供了自定义登录页面设计。

**查看详细文档：**
- [docs/waline/custom-login.md](custom-login.md)

### 4. 评论管理后台

访问 `https://your-waline-domain.vercel.app/ui` 进入管理后台：

- 首次访问需要注册管理员账号（第一个注册的用户自动成为管理员）
- 可以审核、删除、编辑评论
- 查看评论统计数据

## 测试验证

### 基础功能测试

- [ ] 评论框正常显示
- [ ] 可以发表评论
- [ ] 评论提交后正常显示
- [ ] 刷新页面后评论仍然存在
- [ ] 评论数统计正确
- [ ] 阅读量统计正常

### 可选功能测试（如已配置）

- [ ] 图片上传功能正常
- [ ] 上传的图片可以正常显示
- [ ] OAuth 登录按钮显示
- [ ] 社交账号可以正常登录
- [ ] Markdown 语法渲染正确
- [ ] Emoji 表情显示正常

### 管理后台测试

- [ ] 可以访问管理后台 `/ui`
- [ ] 可以登录管理员账号
- [ ] 可以审核评论
- [ ] 可以删除评论
- [ ] 统计数据显示正确

## 故障排查

### 评论框不显示

**可能原因：**
1. `serverURL` 配置错误
2. Hugo 配置未正确加载
3. 主题模板文件缺失

**解决方法：**
1. 检查 `hugo.toml` 中的 `[params.waline]` 配置
2. 确认 serverURL 可以正常访问
3. 查看浏览器控制台是否有错误信息
4. 检查主题文件 `layouts/partials/comments/waline.html` 是否存在

### 评论提交失败

**可能原因：**
1. 后端服务不可用
2. 数据库连接失败
3. CORS 配置问题

**解决方法：**
1. 访问 Vercel 后端 URL 检查服务状态
2. 在 Vercel 项目中查看运行日志
3. 检查数据库连接环境变量
4. 查看浏览器控制台的网络请求错误

### 图片上传失败

**可能原因：**
1. Cloudflare Worker 未正确配置
2. R2 CORS 配置错误
3. Worker URL 配置错误

**解决方法：**
1. 检查 `imageUploadURL` 配置
2. 验证 Worker 可以单独访问
3. 检查 R2 存储桶的 CORS 配置
4. 查看 Worker 日志

### OAuth 登录失败

**可能原因：**
1. OAuth 应用配置错误
2. 回调 URL 不正确
3. 环境变量未设置

**解决方法：**
1. 检查 Vercel 环境变量中的 OAuth 配置
2. 确认回调 URL 为：`https://your-waline-domain.vercel.app/ui/login`
3. 参考 [oauth-setup.md](https://github.com/harrison-ming/totvan-waline/blob/main/docs/oauth-setup.md)

### 评论通知不工作

**可能原因：**
1. 邮件服务未配置
2. SMTP 设置错误
3. WebPush 未配置

**解决方法：**
1. 在 Vercel 环境变量中添加 SMTP 配置
2. 测试 SMTP 连接
3. 查看后端日志了解错误详情

## 相关资源

### 官方文档
- [Waline 官方文档](https://waline.js.org/)
- [Waline GitHub](https://github.com/walinejs/waline)

### ToTVan 相关仓库
- [totvan-theme](https://github.com/harrison-ming/totvan-theme) - Hugo 主题（本仓库）
- [totvan-waline](https://github.com/harrison-ming/totvan-waline) - Waline 后端服务
- [site-totvan](https://github.com/harrison-ming/site-totvan) - ToTVan 站点示例

### 本主题文档
- [自定义登录页面](custom-login.md)
- [主题 README](../../README.md)

## 获取帮助

如果遇到问题：

1. 查看本文档的故障排查部分
2. 检查浏览器控制台和 Vercel 日志
3. 访问 [Waline 官方文档](https://waline.js.org/)
4. 在 [totvan-theme Issues](https://github.com/harrison-ming/totvan-theme/issues) 提交问题
5. 在 [totvan-waline Issues](https://github.com/harrison-ming/totvan-waline/issues) 提交后端相关问题

---

**祝你使用愉快！** 如果成功集成，欢迎分享你的站点。
