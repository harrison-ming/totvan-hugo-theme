# 兼容性说明

**文档版本**: v1.0.0
**最后更新**: 2025-10-22

---

## 📖 概述

本文档说明 ToTVan Theme 各版本之间的兼容性、破坏性变更（Breaking Changes）和过渡策略。

---

## 🎯 兼容性原则

### 语义化版本控制

ToTVan Theme 遵循[语义化版本](https://semver.org/)规范：

```
版本格式: MAJOR.MINOR.PATCH

- MAJOR: 不兼容的 API 变更
- MINOR: 向后兼容的功能新增
- PATCH: 向后兼容的问题修正
```

**示例**:
- `v0.1.0` → `v0.2.0`: MINOR 更新，向后兼容（有过渡期）
- `v0.9.0` → `v1.0.0`: MAJOR 更新，移除过渡期兼容代码
- `v1.0.0` → `v1.0.1`: PATCH 更新，完全兼容

### 过渡期策略

**v0.x 系列**（开发版本）:
- 提供配置兼容层
- 旧配置仍可工作，但会在构建时显示警告
- 过渡期至少 1 个 MINOR 版本

**v1.0.0+**（稳定版本）:
- 移除兼容层
- 必须使用新配置
- Breaking changes 仅在 MAJOR 版本更新时引入

---

## 📊 版本兼容性矩阵

### Hugo 版本要求

| ToTVan 版本 | 最低 Hugo 版本 | 推荐 Hugo 版本 | Extended 版本 |
|------------|--------------|---------------|-------------|
| v0.1.0     | 0.116.0      | 0.140.0+      | 否（可选）   |
| v0.2.0     | 0.116.0      | 0.140.0+      | 否（可选）   |
| v0.3.0     | 0.116.0      | 0.140.0+      | 否（可选）   |
| v0.4.0     | 0.116.0      | 0.140.0+      | 否（可选）   |
| v1.0.0     | 0.120.0      | 0.145.0+      | 否（可选）   |

**注意**:
- Extended 版本不是必需的（主题不使用 SCSS）
- 推荐使用最新稳定版 Hugo

---

### 配置兼容性

#### Analytics 配置

| 版本 | 旧配置 | 新配置 | 兼容性 |
|------|--------|--------|--------|
| v0.1.0 | `params.analytics.google` | - | ✅ |
| v0.2.0 - v0.9.0 | `params.analytics.google` ⚠️ | `params.marketing.analytics.google_analytics` ✅ | 🔄 兼容 |
| v1.0.0+ | ❌ 不支持 | `params.marketing.analytics.google_analytics` ✅ | ❌ 不兼容 |

**图例**:
- ✅ 推荐使用
- ⚠️ 过时但仍可用
- ❌ 不支持
- 🔄 兼容层

---

#### SEO 配置

| 版本 | 配置方式 | 兼容性 |
|------|---------|--------|
| v0.1.0 | 内置在 head.html | ✅ |
| v0.2.0+ | `params.marketing.seo.*` | ✅ |

**新增配置项**（v0.2.0+）:
```toml
[params.marketing.seo]
  site_type = "Organization"
  org_name = "Your Site Name"
  twitter = "username"  # 可选
```

---

#### 首页布局

| 版本 | 配置方式 | 可选布局 |
|------|---------|----------|
| v0.1.0 - v0.2.0 | 无配置（固定） | category-grid |
| v0.3.0+ | `params.homepage.layout` | category-grid, magazine, minimal, hero-featured |

**默认行为**:
- 如果不配置，默认使用 `category-grid`（与 v0.1.0 行为一致）
- 完全向后兼容

---

## 🚨 破坏性变更清单

### v0.1.0 → v0.2.0

**Breaking Changes**: 无（完全兼容）

**Deprecated（过时但仍可用）**:
- `params.analytics.google` → 建议迁移到 `params.marketing.analytics.google_analytics`

**新功能**:
- ✨ 引入 blox-seo 模块
- ✨ 引入 blox-analytics 模块
- ✨ 支持多种分析工具（Plausible, Fathom 等）

---

### v0.2.0 → v0.3.0

**Breaking Changes**: 无

**新功能**:
- ✨ 首页模板系统
- ✨ 4 种预设布局
- ✨ 可复用的 functions

**默认行为**:
- 保持与 v0.2.0 完全一致（category-grid 布局）

---

### v0.3.0 → v0.4.0

**Breaking Changes**: 无

**内部改进**:
- ♻️ Partials 重构
- ♻️ 图片处理函数统一
- ♻️ 代码质量提升

**用户影响**: 无（内部重构）

---

### v0.4.0 → v1.0.0

**Breaking Changes**: ⚠️ 有

#### 移除的配置兼容层

**不再支持**:
```toml
# ❌ 这些配置在 v1.0.0 中不再工作
[params.analytics]
  google = "G-XXXXXXXXXX"
```

**必须使用**:
```toml
# ✅ 必须使用新配置
[params.marketing.analytics]
  google_analytics = "G-XXXXXXXXXX"
```

#### 其他变更

- Hugo 最低版本要求提升到 0.120.0
- 移除实验性功能

---

## 🔄 配置迁移示例

### 完整配置对比

#### v0.1.0 配置示例

```toml
[params]
  description = 'Site description'
  mainSections = 'posts'

  [params.logo]
    url = "https://example.com/logo.png"
    width = 60
    height = 60

  [params.analytics]
    google = "G-XXXXXXXXXX"  # ⚠️ 过时

  [params.author]
    name = 'Author Name'
    bio = 'Bio text'

  [params.waline]
    serverURL = "https://comments.example.com"
```

---

#### v1.0.0 配置示例

```toml
[params]
  description = 'Site description'
  mainSections = 'posts'

  [params.logo]
    url = "https://example.com/logo.png"
    width = 60
    height = 60

  # ✅ 新的 Analytics 配置
  [params.marketing.analytics]
    google_analytics = "G-XXXXXXXXXX"
    # plausible = "example.com"  # 可选
    # fathom = "SITE_ID"         # 可选

  # ✅ 新的 SEO 配置
  [params.marketing.seo]
    site_type = "Organization"
    org_name = "Site Name"
    # twitter = "username"  # 可选

  [params.author]
    name = 'Author Name'
    bio = 'Bio text'

  # ✅ 新的首页配置
  [params.homepage]
    layout = "category-grid"  # 默认，可省略
    latestPostsCount = 3
    categoriesCount = 7
    postsPerCategory = 3
    showNewsletter = true

  [params.waline]
    serverURL = "https://comments.example.com"
```

---

## 🧪 兼容性测试

### 测试 v0.2.0 配置兼容性

**在 v0.2.0 - v0.9.0 版本中**:

```bash
# 使用旧配置构建
hugo

# 应该看到警告但仍能构建成功
# WARNING: params.analytics.google is deprecated, use params.marketing.analytics.google_analytics
```

**在 v1.0.0 版本中**:

```bash
# 使用旧配置构建
hugo

# 会报错或 Google Analytics 不工作
# ERROR: params.marketing.analytics.google_analytics is required
```

---

### 自动化测试脚本

**检查配置兼容性**:

```bash
#!/bin/bash

# check-config.sh

CONFIG_FILE="hugo.toml"

echo "Checking ToTVan Theme configuration compatibility..."

# 检查旧的 Analytics 配置
if grep -q "params.analytics.google" "$CONFIG_FILE"; then
  echo "⚠️  WARNING: Old analytics configuration detected"
  echo "   Please migrate to: params.marketing.analytics.google_analytics"
fi

# 检查是否有新配置
if grep -q "params.marketing.analytics.google_analytics" "$CONFIG_FILE"; then
  echo "✅ Analytics configuration is up to date"
else
  echo "❌ ERROR: Missing params.marketing.analytics.google_analytics"
fi

# 检查 SEO 配置
if grep -q "params.marketing.seo" "$CONFIG_FILE"; then
  echo "✅ SEO configuration found"
else
  echo "⚠️  INFO: Consider adding params.marketing.seo for better SEO"
fi

echo ""
echo "Check complete!"
```

---

## 📋 升级路径建议

### 从 v0.1.0 升级

**推荐路径**: v0.1.0 → v0.2.0 → v0.3.0 → v0.4.0 → v1.0.0

**原因**:
- 渐进式验证每个改进
- 降低升级风险
- 逐步熟悉新功能

**时间投入**:
- 每个版本升级: 10-20 分钟
- 总计: 1-2 小时

---

### 直接升级到 v1.0.0

**适合场景**:
- 新站点
- 测试环境
- 愿意一次性修改配置

**风险**:
- 配置变更较多
- 需要仔细测试

**时间投入**: 30-60 分钟

---

## 🛡️ 兼容性保证

### 我们承诺

**v0.x 系列**:
- 提供配置兼容层
- 至少 1 个版本的过渡期
- 明确的升级文档

**v1.x 系列**:
- 配置稳定性保证
- Breaking changes 仅在 v2.0.0 引入
- 长期支持

### 我们不保证

- 与第三方主题的兼容性
- Hugo 核心 API 变更导致的问题
- 实验性功能的稳定性

---

## 🔍 检测兼容性问题

### Hugo 构建检查

```bash
# 详细构建日志
hugo --verbose

# 检查是否有 deprecated 警告
hugo 2>&1 | grep -i "deprecated\|warning"
```

### 配置验证

```bash
# 验证配置语法
hugo config

# 打印所有参数
hugo config -e production | grep -A 20 "params:"
```

---

## 🆘 兼容性问题排查

### 常见问题

#### 问题 1: "模块未找到"

**症状**:
```
Error: module "github.com/HugoBlox/hugo-blox-builder/modules/blox-seo" not found
```

**原因**: 模块缓存问题

**解决**:
```bash
hugo mod clean
hugo mod get -u
hugo mod tidy
```

---

#### 问题 2: "配置参数无效"

**症状**: Google Analytics 不工作

**原因**: 使用了旧配置

**解决**: 查看[迁移指南](./migration-guide.md)

---

#### 问题 3: "首页显示空白"

**症状**: 首页内容不显示

**可能原因**:
1. `layout` 配置拼写错误
2. `mainSections` 配置错误

**解决**:
```toml
# 检查拼写
[params.homepage]
  layout = "category-grid"  # 不是 "catgory-grid"

# 检查 mainSections
mainSections = "posts"  # 确保与 content/ 目录匹配
```

---

## 📚 相关资源

- [迁移指南](./migration-guide.md)
- [Phase 1: SEO 模块化](./phase1-seo-modules.md)
- [Phase 2: 首页模板](./phase2-homepage-system.md)
- [Phase 3: Partials 重构](./phase3-partials-refactor.md)

---

## 📞 报告兼容性问题

如果发现兼容性问题，请：

1. **检查文档**: 先查看迁移指南和兼容性说明
2. **搜索 Issues**: https://github.com/harrison-ming/totvan-hugo-theme/issues
3. **提交 Issue**: 包含以下信息
   - ToTVan Theme 版本
   - Hugo 版本
   - 操作系统
   - 配置文件（去除敏感信息）
   - 错误信息
   - 重现步骤

---

**最后更新**: 2025-10-22
