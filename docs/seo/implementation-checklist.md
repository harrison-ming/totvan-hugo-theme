# ToTVan Theme SEO 实施清单

本文档提供分阶段的 SEO 改进任务清单，用于跟踪实施进度。

---

## 使用说明

- ✅ 表示已完成
- 🔄 表示进行中
- ⏸️ 表示暂停
- ❌ 表示未开始
- 🔍 表示需要测试

---

## 阶段 1：紧急修复（1-2 天）

### 任务 1.1：参数化 Google Analytics ID

- [ ] 在 `hugo.toml` 添加 `[params.analytics]` 配置
- [ ] 修改 `layouts/partials/head.html`（第 176-184 行）
- [ ] 移除硬编码的 GA ID `G-XXXXXXXXXX`
- [ ] 使用 `{{- with site.Params.analytics.google -}}` 条件判断
- [ ] 支持其他分析工具（Plausible, Umami）
- [ ] 更新 ToTVan 站点的 `hugo.toml`，添加正确的 GA ID
- [ ] 更新主题 README.md，说明如何配置 GA
- [ ] 🔍 测试：配置 GA ID 后能正常追踪
- [ ] 🔍 测试：不配置时不加载分析脚本

**文件变更**:
- `layouts/partials/head.html`
- `README.md`
- `/Users/ming/Documents/HUGO/ToTVan/hugo.toml`

---

### 任务 1.2：修复默认 og:image

- [ ] 创建 1200x630 的默认 OG 图片（JPG 格式）
  - 放置位置：`static/images/default-og-image.jpg`
  - 文件大小：< 300KB
- [ ] 在 `hugo.toml` 添加 `[params.seo]` 配置
  - defaultImage
  - defaultImageWidth
  - defaultImageHeight
- [ ] 修改 `layouts/partials/head.html`（第 70-110 行）
  - 创建 `$ogImage` 变量逻辑
  - 优先级：文章图片 → 配置默认图片 → logo
  - 添加 `og:image:type` 和 `og:image:alt`
- [ ] 更新 Twitter Card 部分使用相同图片
- [ ] 🔍 测试：Facebook Sharing Debugger 正常显示
- [ ] 🔍 测试：Twitter Card Validator 正常显示
- [ ] 🔍 测试：图片尺寸正确（1200x630）

**文件变更**:
- `static/images/default-og-image.jpg`（新建）
- `layouts/partials/head.html`
- `hugo.toml`（添加配置示例）

---

### 任务 1.3：增强 JSON-LD Article Schema

#### 子任务 1.3.1：创建 Schema 目录结构

- [ ] 创建 `layouts/partials/schema/` 目录
- [ ] 创建 `layouts/partials/seo/` 目录

#### 子任务 1.3.2：创建 Person Schema

- [ ] 新建 `layouts/partials/schema/person.html`
- [ ] 实现 Person 对象（返回 JSON，不含 script 标签）
- [ ] 包含字段：@type, name, image, description, url, sameAs
- [ ] 从 `site.Params.author` 读取配置

#### 子任务 1.3.3：创建 Organization Schema

- [ ] 新建 `layouts/partials/schema/organization.html`
- [ ] 实现 Organization 对象（返回 JSON）
- [ ] 包含字段：@type, name, url, logo, sameAs, contactPoint
- [ ] 从 `site.Params.organization` 读取配置

#### 子任务 1.3.4：创建 Article Schema

- [ ] 新建 `layouts/partials/schema/article.html`
- [ ] 实现完整的 Article Schema
- [ ] 必填字段：@type, headline, description, url
- [ ] 时间字段：datePublished, dateModified, dateCreated
- [ ] 新增字段：
  - inLanguage
  - keywords（从 tags 生成）
  - wordCount
  - timeRequired（阅读时间）
  - thumbnailUrl
  - articleSection（从 categories 获取）
  - commentCount（如果启用 Waline）
  - interactionStatistic（阅读量）
- [ ] 引用 person.html 和 organization.html

#### 子任务 1.3.5：创建 WebSite Schema

- [ ] 新建 `layouts/partials/schema/website.html`
- [ ] 实现 WebSite Schema（带 SearchAction）
- [ ] 包含字段：name, url, description, inLanguage, publisher

#### 子任务 1.3.6：创建 WebPage Schema

- [ ] 新建 `layouts/partials/schema/webpage.html`
- [ ] 实现通用 WebPage Schema

#### 子任务 1.3.7：修改 head.html

- [ ] 移除原有 JSON-LD 代码（第 128-174 行）
- [ ] 替换为条件 partial 调用：
  - 首页：`schema/website.html`
  - 文章页：`schema/article.html`
  - 其他页：`schema/webpage.html`

#### 子任务 1.3.8：更新配置文件

- [ ] 在 `hugo.toml` 添加 `[params.organization]` 配置
- [ ] 在 `hugo.toml` 添加 `[params.author]` 完整配置
- [ ] 包含社交链接、联系方式等

#### 子任务 1.3.9：测试验证

- [ ] 🔍 Google Rich Results Test：首页（WebSite）
- [ ] 🔍 Google Rich Results Test：文章页（Article）
- [ ] 🔍 Google Rich Results Test：其他页（WebPage）
- [ ] 🔍 Schema.org Validator：验证所有 Schema
- [ ] 🔍 检查所有必填字段都存在
- [ ] 🔍 确认无错误和警告

**文件变更**:
- `layouts/partials/schema/person.html`（新建）
- `layouts/partials/schema/organization.html`（新建）
- `layouts/partials/schema/article.html`（新建）
- `layouts/partials/schema/website.html`（新建）
- `layouts/partials/schema/webpage.html`（新建）
- `layouts/partials/head.html`（修改）
- `hugo.toml`（添加配置）

---

### 阶段 1 验收标准

- [ ] 所有新站点可以使用自己的 GA ID
- [ ] 社交分享图片正常显示（Facebook, Twitter）
- [ ] Google Rich Results Test 全部通过
- [ ] 无 Schema 错误或警告
- [ ] 更新后的文档清晰说明配置方法

**完成时间**: ______ 年 ______ 月 ______ 日

---

## 阶段 2：核心改进（3-5 天）

### 任务 2.1：添加 FAQ Schema

- [ ] 新建 `layouts/partials/schema/faq.html`
- [ ] 实现 FAQPage Schema
- [ ] 支持从 Front Matter 读取 FAQ 数据
- [ ] 在 `head.html` 中条件调用
- [ ] 创建示例文章：`content/posts/faq-example.md`
- [ ] 更新文档说明如何使用
- [ ] 🔍 测试：Google Rich Results Test 识别为 FAQ
- [ ] 🔍 测试：搜索结果显示折叠问答

**文件变更**:
- `layouts/partials/schema/faq.html`（新建）
- `layouts/partials/head.html`（修改）
- `content/posts/faq-example.md`（示例）
- `docs/seo/usage-examples.md`（新建）

---

### 任务 2.2：添加 Video Schema

- [ ] 新建 `layouts/partials/schema/video.html`
- [ ] 实现 VideoObject Schema
- [ ] 支持 YouTube, Vimeo, 自托管视频
- [ ] 必填字段：name, description, thumbnailUrl, uploadDate, duration
- [ ] 可选字段：contentUrl, embedUrl
- [ ] 在 `head.html` 中条件调用
- [ ] 创建示例文章：`content/posts/video-example.md`
- [ ] 🔍 测试：Google Rich Results Test 识别为 Video
- [ ] 🔍 测试：搜索结果显示视频缩略图

**文件变更**:
- `layouts/partials/schema/video.html`（新建）
- `layouts/partials/head.html`（修改）
- `content/posts/video-example.md`（示例）

---

### 任务 2.3：添加 HowTo Schema

- [ ] 新建 `layouts/partials/schema/howto.html`
- [ ] 实现 HowTo Schema
- [ ] 支持步骤列表（steps）
- [ ] 每个步骤包含：position, name, text, image（可选）
- [ ] 支持 totalTime 字段
- [ ] 在 `head.html` 中条件调用
- [ ] 创建示例文章：`content/posts/howto-example.md`
- [ ] 🔍 测试：Google Rich Results Test 识别为 HowTo
- [ ] 🔍 测试：搜索结果显示步骤列表

**文件变更**:
- `layouts/partials/schema/howto.html`（新建）
- `layouts/partials/head.html`（修改）
- `content/posts/howto-example.md`（示例）

---

### 任务 2.4：智能 Description 生成

- [ ] 新建 `layouts/partials/seo/description.html`
- [ ] 实现智能截断逻辑：
  - 寻找中文句子结束符（。？！）
  - 寻找英文句子结束符（. ? !）
  - 选择最接近 160 字符的断点
  - 如果断点太靠前，在空格处截断并加省略号
- [ ] 在 `head.html` 中使用：
  - `<meta name="description">`
  - Open Graph description
  - Twitter Card description
  - JSON-LD description
- [ ] 🔍 测试：Description 不在句子中间截断
- [ ] 🔍 测试：长度控制在 150-160 字符

**文件变更**:
- `layouts/partials/seo/description.html`（新建）
- `layouts/partials/head.html`（修改）

---

### 任务 2.5：完善 Organization Schema

- [ ] 在 `hugo.toml` 添加组织信息：
  - `[params.organization.social]`（社交链接）
  - `[params.organization.contact]`（联系方式）
  - `[params.organization.address]`（地址，可选）
- [ ] 更新 `schema/organization.html`：
  - 添加 sameAs（社交链接数组）
  - 添加 contactPoint
  - 添加 address（如果是本地商家）
- [ ] 🔍 测试：Schema Validator 验证通过
- [ ] 🔍 测试：所有社交链接显示正确

**文件变更**:
- `layouts/partials/schema/organization.html`（修改）
- `hugo.toml`（添加配置）

---

### 阶段 2 验收标准

- [ ] FAQ/Video/HowTo 文章能正确显示富媒体结果
- [ ] Description 智能截断，语义完整
- [ ] Organization 信息完整，包含社交链接
- [ ] 有完整的示例文章供参考
- [ ] 文档说明清晰

**完成时间**: ______ 年 ______ 月 ______ 日

---

## 阶段 3：扩展功能（5-7 天）

### 任务 3.1：创建 Image Sitemap

- [ ] 新建 `layouts/sitemap-images.xml`
- [ ] 实现 Image Sitemap 格式
- [ ] 包含所有文章的特色图片
- [ ] 图片字段：loc, title, caption（可选）
- [ ] 在 `hugo.toml` 配置输出格式
- [ ] 更新 `robots.txt`，添加 Image Sitemap 链接
- [ ] 🔍 测试：访问 `/sitemap-images.xml` 正常
- [ ] 🔍 测试：所有图片 URL 可访问
- [ ] 🔍 测试：Google Search Console 识别

**文件变更**:
- `layouts/sitemap-images.xml`（新建）
- `hugo.toml`（添加输出格式配置）
- `static/robots.txt`（修改）

---

### 任务 3.2：创建 News Sitemap

- [ ] 在 `hugo.toml` 添加 News Sitemap 配置：
  - `enableNewsSitemap`
  - `newsPublicationName`
  - `newsPublicationLanguage`
- [ ] 新建 `layouts/sitemap-news.xml`
- [ ] 实现 Google News Sitemap 格式
- [ ] 只包含最近 2 天的文章
- [ ] 包含字段：publication, publication_date, title, keywords
- [ ] 更新 `robots.txt`，添加 News Sitemap 链接
- [ ] 🔍 测试：访问 `/sitemap-news.xml` 正常
- [ ] 🔍 测试：只有最近 2 天的文章
- [ ] 🔍 测试：格式符合 Google News 标准

**文件变更**:
- `layouts/sitemap-news.xml`（新建）
- `hugo.toml`（添加配置）
- `static/robots.txt`（修改）

---

### 任务 3.3：文档和示例

- [ ] 创建 `docs/seo/usage-examples.md`
- [ ] 包含内容：
  - 如何配置 SEO 参数
  - 如何创建 FAQ 文章
  - 如何创建 Video 文章
  - 如何创建 HowTo 文章
  - Front Matter 示例
- [ ] 更新主题 README.md，添加 SEO 章节
- [ ] 创建示例站点配置文件
- [ ] 添加截图展示富媒体搜索结果

**文件变更**:
- `docs/seo/usage-examples.md`（新建）
- `README.md`（修改）
- `exampleSite/hugo.toml`（示例配置）

---

### 阶段 3 验收标准

- [ ] 所有 Sitemap 可访问且格式正确
- [ ] Google Search Console 能识别所有 Sitemap
- [ ] 文档完整，包含使用示例
- [ ] 示例文章展示所有 Schema 类型

**完成时间**: ______ 年 ______ 月 ______ 日

---

## 阶段 4：精细优化（3-5 天）

### 任务 4.1：优化 robots.txt

- [ ] 更新 `static/robots.txt`
- [ ] 添加禁止索引的页面：
  - /search
  - /login
  - /register
  - /*.json$
  - /*?（查询参数）
- [ ] 针对 Googlebot-Image 添加特殊规则
- [ ] 针对 AdsBot-Google 禁止访问
- [ ] 添加所有 Sitemap 链接
- [ ] 🔍 测试：robots.txt 格式正确
- [ ] 🔍 测试：Google Search Console 无警告

**文件变更**:
- `static/robots.txt`（修改）

---

### 任务 4.2：添加分页 Meta Tags

- [ ] 在 `layouts/_default/baseof.html` 添加：
  - `{{ block "head-additions" . }}{{ end }}`
- [ ] 在 `layouts/_default/list.html` 定义 block：
  - rel="prev"
  - rel="next"
- [ ] 支持所有列表页：
  - 文章列表
  - 分类列表
  - 标签列表
- [ ] 🔍 测试：分页页面包含 prev/next 链接
- [ ] 🔍 测试：首页和尾页正确（无多余链接）

**文件变更**:
- `layouts/_default/baseof.html`（修改）
- `layouts/_default/list.html`（修改）

---

### 任务 4.3：添加移动优化标记

- [ ] 在 `head.html` 添加：
  - mobile-web-app-capable
  - apple-mobile-web-app-capable
  - apple-mobile-web-app-status-bar-style
  - apple-mobile-web-app-title
  - theme-color
  - msapplication-TileColor
  - format-detection
- [ ] 选择合适的主题颜色（品牌色）
- [ ] 🔍 测试：Mobile-Friendly Test 通过
- [ ] 🔍 测试：移动设备地址栏显示主题颜色

**文件变更**:
- `layouts/partials/head.html`（修改）

---

### 任务 4.4：性能测试和优化

- [ ] 🔍 Google PageSpeed Insights（移动端）
  - Performance > 90
  - FCP < 1.8s
  - LCP < 2.5s
  - CLS < 0.1
- [ ] 🔍 Google PageSpeed Insights（桌面端）
  - Performance > 95
  - FCP < 1.0s
  - LCP < 1.5s
- [ ] 识别性能瓶颈
- [ ] 优化关键资源加载
- [ ] 优化图片（格式、尺寸、懒加载）
- [ ] 优化 CSS/JS（压缩、合并）

---

### 任务 4.5：全面测试

- [ ] 🔍 所有页面通过 W3C HTML Validator
- [ ] 🔍 所有 Schema 通过 Schema.org Validator
- [ ] 🔍 Facebook Sharing Debugger 测试所有页面类型
- [ ] 🔍 Twitter Card Validator 测试
- [ ] 🔍 Google Search Console 无错误
- [ ] 🔍 Screaming Frog SEO Spider 扫描
  - 无死链
  - 无重复 title/description
  - 所有图片有 alt 属性

---

### 阶段 4 验收标准

- [ ] 所有测试工具通过
- [ ] PageSpeed Insights 达到目标分数
- [ ] 无 SEO 警告或错误
- [ ] 文档完整更新

**完成时间**: ______ 年 ______ 月 ______ 日

---

## 额外任务（可选）

### 可选 1：LocalBusiness Schema

适用于有实体店铺的本地商家。

- [ ] 新建 `layouts/partials/schema/localbusiness.html`
- [ ] 实现 LocalBusiness Schema
- [ ] 包含：address, geo, openingHours, priceRange
- [ ] 配置开关：`params.seo.enableLocalBusiness`

---

### 可选 2：Product Schema

适用于电商站点。

- [ ] 新建 `layouts/partials/schema/product.html`
- [ ] 实现 Product Schema
- [ ] 包含：offers, aggregateRating, brand

---

### 可选 3：Breadcrumb 优化

- [ ] 将 breadcrumb.html 的 microdata 改为 JSON-LD
- [ ] 在 `head.html` 中输出 BreadcrumbList Schema
- [ ] 保持 HTML 面包屑导航不变

---

### 可选 4：AMP 支持

- [ ] 创建 AMP 模板
- [ ] 配置 AMP 输出
- [ ] 添加 canonical 关联

---

## 文档更新清单

- [ ] 更新 `README.md`
  - 添加 SEO 特性说明
  - 添加配置示例
- [ ] 完善 `docs/seo/README.md`
- [ ] 完善 `docs/seo/current-assessment.md`
- [ ] 完善 `docs/seo/improvement-plan.md`
- [ ] 完善 `docs/seo/implementation-checklist.md`（本文档）
- [ ] 创建 `docs/seo/usage-examples.md`
- [ ] 创建 `CHANGELOG.md`，记录所有 SEO 改进

---

## 发布前检查清单

### 代码质量

- [ ] 所有新文件包含注释
- [ ] 代码格式一致
- [ ] 无硬编码值（都从配置读取）
- [ ] 无遗留的调试代码

### 文档质量

- [ ] 所有配置参数有文档说明
- [ ] 所有 Schema 类型有使用示例
- [ ] README 更新到最新
- [ ] CHANGELOG 记录所有改动

### 测试覆盖

- [ ] 所有 Schema 类型都测试过
- [ ] 所有页面类型都测试过
- [ ] 移动端和桌面端都测试过
- [ ] 不同浏览器都测试过

### 向后兼容

- [ ] 现有站点升级后无需修改配置即可工作
- [ ] 所有新配置都有合理的默认值
- [ ] 提供迁移指南（如有破坏性更改）

---

## 提交和发布

### Git 提交

- [ ] 创建分支：`feature/seo-improvements`
- [ ] 分阶段提交（不要一次性提交所有改动）
- [ ] Commit message 清晰描述改动
- [ ] 推送到 GitHub

### 版本发布

- [ ] 更新版本号（如：v2.0.0）
- [ ] 创建 Git tag
- [ ] 编写 Release Notes
- [ ] 发布到 GitHub Releases

### 通知

- [ ] 更新主题演示站点
- [ ] 通知现有用户升级
- [ ] 发布博客文章介绍 SEO 改进

---

## 后续维护

### 定期检查（每月）

- [ ] Google Search Console 检查
- [ ] 搜索排名监控
- [ ] 富媒体结果监控
- [ ] 错误日志检查

### 持续改进

- [ ] 关注 Google SEO 更新
- [ ] 关注 Schema.org 新标准
- [ ] 收集用户反馈
- [ ] 优化基于数据的改进

---

## 总结

**总预计时间**: 12-19 天

**优先级**:
1. 阶段 1（必须）- 影响主题复用性
2. 阶段 2（重要）- 显著提升 SEO 效果
3. 阶段 3（推荐）- 专业站点标配
4. 阶段 4（优化）- 追求卓越

**建议实施顺序**:
按阶段顺序实施，每个阶段完成后测试验证再进入下一阶段。

---

**开始日期**: ______ 年 ______ 月 ______ 日
**预计完成日期**: ______ 年 ______ 月 ______ 日
**实际完成日期**: ______ 年 ______ 月 ______ 日
