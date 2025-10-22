# 迁移指南

**目标读者**: 已使用 ToTVan Theme v0.1.0 的用户
**迁移路径**: v0.1.0 → v0.2.0 → v0.3.0 → v0.4.0 → v1.0.0

---

## 📋 概述

本指南帮助您从 v0.1.0 平滑迁移到最新版本。每个版本都是向后兼容的（有过渡期），但建议按顺序逐步升级。

---

## 🚀 快速迁移（一步到位）

如果您想直接升级到最新版本：

### 步骤 1: 备份

```bash
cd /path/to/your/site

# 备份配置
cp hugo.toml hugo.toml.backup.$(date +%Y%m%d)

# 备份 go.mod
cp go.mod go.mod.backup

# 提交当前状态
git add .
git commit -m "Backup before upgrading totvan-theme"
```

### 步骤 2: 更新主题

```bash
# 更新到最新版本
hugo mod get github.com/harrison-ming/totvan-hugo-theme@latest
hugo mod tidy
```

### 步骤 3: 更新配置

**编辑 `hugo.toml`**，进行以下配置迁移：

#### 3.1 Analytics 配置迁移

**旧配置（删除）**:
```toml
[params.analytics]
  google = "G-XXXXXXXXXX"
```

**新配置**:
```toml
[params.marketing.analytics]
  google_analytics = "G-XXXXXXXXXX"  # 注意: 改名了
```

#### 3.2 SEO 配置（新增）

```toml
[params.marketing.seo]
  site_type = "Organization"  # 或 "Person"
  org_name = "Your Site Name"
  # twitter = "YourTwitterHandle"  # 可选
```

#### 3.3 首页配置（可选）

```toml
# 如果想保持当前首页样式，不需要添加任何配置
# 默认就是 category-grid

# 如果想尝试新布局:
[params.homepage]
  layout = "category-grid"  # 或 "magazine", "minimal", "hero-featured"
  latestPostsCount = 3
  categoriesCount = 7
  postsPerCategory = 3
  showNewsletter = true
```

### 步骤 4: 测试

```bash
# 清理缓存
rm -rf public resources/_gen .hugo_build.lock

# 构建测试
hugo

# 本地预览
hugo server
```

访问 http://localhost:1313，检查：
- ✅ 首页正常显示
- ✅ 文章页正常显示
- ✅ Google Analytics 加载（检查 Network 面板）
- ✅ 图片正常显示
- ✅ 无 JavaScript 错误

### 步骤 5: 部署

```bash
git add hugo.toml go.mod go.sum
git commit -m "Upgrade to totvan-theme v1.0.0"
git push
```

---

## 📈 渐进式迁移（推荐）

如果您想稳妥地逐步升级：

### v0.1.0 → v0.2.0 (SEO/Analytics 模块化)

**影响**: 配置变更
**时间**: 15 分钟

#### 更新主题

```bash
hugo mod get github.com/harrison-ming/totvan-hugo-theme@v0.2.0
hugo mod tidy
```

#### 配置迁移

**必须做**:
```toml
# 删除或注释旧配置
# [params.analytics]
#   google = "G-XXXXXXXXXX"

# 添加新配置
[params.marketing.analytics]
  google_analytics = "G-XXXXXXXXXX"

[params.marketing.seo]
  site_type = "Organization"
  org_name = "Your Site Name"
```

#### 验证

```bash
rm -rf public resources/_gen
hugo

# 检查 SEO 输出
cat public/index.html | grep -E '<meta property="og:|<script type="application/ld\+json"'
```

**应该看到**:
- Open Graph tags
- JSON-LD 结构化数据
- Twitter Cards

---

### v0.2.0 → v0.3.0 (首页模板系统)

**影响**: 新增首页布局选择
**时间**: 5 分钟

#### 更新主题

```bash
hugo mod get github.com/harrison-ming/totvan-hugo-theme@v0.3.0
hugo mod tidy
```

#### 配置（可选）

**默认行为不变**（保持 category-grid），如果想尝试新布局：

```toml
[params.homepage]
  layout = "magazine"  # 或 "minimal", "hero-featured"

  # Magazine 布局专用配置
  [params.homepage.magazine]
    latestCount = 6
    popularCount = 5
```

#### 验证

```bash
rm -rf public
hugo server
```

尝试不同的 `layout` 值，查看效果。

---

### v0.3.0 → v0.4.0 (Partials 重构)

**影响**: 内部重构，用户无需改动
**时间**: 2 分钟

#### 更新主题

```bash
hugo mod get github.com/harrison-ming/totvan-hugo-theme@v0.4.0
hugo mod tidy
```

#### 验证

```bash
rm -rf public resources/_gen
hugo

# 检查图片优化
ls -lh resources/_gen/images/ | head -10
```

**无需配置变更**，此版本主要是内部代码重构。

---

### v0.4.0 → v1.0.0 (正式版)

**影响**: 文档完善，稳定性提升
**时间**: 2 分钟

#### 更新主题

```bash
hugo mod get github.com/harrison-ming/totvan-hugo-theme@v1.0.0
hugo mod tidy
```

#### 移除兼容性代码（可选）

v1.0.0 移除了配置兼容层，确保使用新配置格式：

**检查 `hugo.toml`**:
```toml
# ❌ 旧配置（不再支持）
[params.analytics]
  google = "xxx"

# ✅ 新配置
[params.marketing.analytics]
  google_analytics = "xxx"
```

---

## ⚠️ 常见问题

### 问题 1: Google Analytics 不工作

**症状**: 网站上看不到 GA 脚本加载

**原因**: 配置路径错误

**解决**:
```toml
# ❌ 错误
[params.analytics]
  google = "G-XXXXXXXXXX"

# ✅ 正确
[params.marketing.analytics]
  google_analytics = "G-XXXXXXXXXX"  # 注意键名也变了
```

---

### 问题 2: 首页布局错误

**症状**: 首页显示空白或错误

**原因**: 布局名称拼写错误

**解决**:
```toml
# ❌ 错误
[params.homepage]
  layout = "magzine"  # 拼写错误

# ✅ 正确
[params.homepage]
  layout = "magazine"  # 正确拼写
```

**有效值**: `category-grid`, `magazine`, `minimal`, `hero-featured`

---

### 问题 3: 模块更新失败

**症状**: `hugo mod get` 报错

**错误信息**: `module not found`

**解决**:
```bash
# 清理模块缓存
hugo mod clean

# 重新获取
hugo mod get github.com/harrison-ming/totvan-hugo-theme@v1.0.0
hugo mod tidy

# 如果仍然失败，删除 go.sum 后重试
rm go.sum
hugo mod tidy
```

---

### 问题 4: 构建报错

**症状**: `hugo` 命令报错

**错误信息**: `execute of template failed`

**排查步骤**:

1. **检查 Hugo 版本**:
   ```bash
   hugo version
   # 应该 >= 0.116.0
   ```

2. **查看详细错误**:
   ```bash
   hugo --verbose
   ```

3. **清理缓存**:
   ```bash
   rm -rf public resources/_gen .hugo_build.lock
   hugo
   ```

4. **检查配置语法**:
   ```bash
   # TOML 语法检查
   hugo config
   ```

---

### 问题 5: 图片显示问题

**症状**: 图片不显示或显示错误

**可能原因**:

1. **图片路径错误**
   ```toml
   # ❌ 错误 - 相对路径
   image = "images/post.jpg"

   # ✅ 正确 - 从 static/ 或 assets/ 开始
   image = "/images/post.jpg"  # static/images/post.jpg
   # 或
   image = "media/post.jpg"    # assets/media/post.jpg
   ```

2. **图片文件不存在**
   ```bash
   # 检查文件是否存在
   ls static/images/post.jpg
   # 或
   ls assets/media/post.jpg
   ```

---

## 🔄 回滚方案

### 回滚到 v0.1.0

```bash
cd /path/to/your/site

# 回滚主题版本
hugo mod get github.com/harrison-ming/totvan-hugo-theme@v0.1.0
hugo mod tidy

# 恢复配置
cp hugo.toml.backup.YYYYMMDD hugo.toml

# 清理并重新构建
rm -rf public resources/_gen
hugo
```

---

## 📝 配置对照表

### v0.1.0 vs v1.0.0 配置对比

| 功能 | v0.1.0 配置 | v1.0.0 配置 |
|------|------------|------------|
| Google Analytics | `params.analytics.google` | `params.marketing.analytics.google_analytics` |
| SEO 站点类型 | 无 | `params.marketing.seo.site_type` |
| SEO 组织名 | 无 | `params.marketing.seo.org_name` |
| 首页布局 | 无（固定） | `params.homepage.layout` |
| Logo | `params.logo.*` | 保持不变 |
| 作者 | `params.author.*` | 保持不变 |
| Waline | `params.waline.*` | 保持不变 |
| AdSense | `params.adsense.*` | 保持不变 |

---

## ✅ 迁移检查清单

### 升级前

- [ ] 备份 `hugo.toml`
- [ ] 备份 `go.mod`
- [ ] 提交当前代码到 Git
- [ ] 记录当前主题版本

### 升级过程

- [ ] 更新主题版本
- [ ] 运行 `hugo mod tidy`
- [ ] 迁移 Analytics 配置
- [ ] 添加 SEO 配置
- [ ] （可选）配置首页布局
- [ ] 清理缓存和构建产物

### 升级后验证

- [ ] 首页正常显示
- [ ] 文章页正常显示
- [ ] 分类页正常显示
- [ ] Google Analytics 加载正常
- [ ] SEO meta tags 正确
- [ ] 图片正常显示和优化
- [ ] Waline 评论正常
- [ ] AdSense 广告正常
- [ ] 移动端显示正常
- [ ] 无 JavaScript 错误
- [ ] 构建时间合理

### 部署

- [ ] 本地测试通过
- [ ] 提交配置变更
- [ ] 推送到远程仓库
- [ ] 触发部署流程
- [ ] 线上验证

---

## 🆘 获取帮助

如果遇到迁移问题：

1. **查看文档**:
   - [README.md](../../README.md)
   - [兼容性说明](./compatibility.md)
   - 各 Phase 详细文档

2. **检查示例配置**:
   - ToTVan 官方站点: https://github.com/harrison-ming/site-totvan

3. **提交 Issue**:
   - https://github.com/harrison-ming/totvan-hugo-theme/issues

4. **查看 FAQ**:
   - [常见问题](../../README.md#常见问题)

---

**最后更新**: 2025-10-22
