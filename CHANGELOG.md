# Changelog

All notable changes to ToTVan Hugo Theme will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-21

### Added

**Phase 1: SEO/Analytics Modularization (v0.2.0)**
- Modular SEO implementation (`layouts/partials/totvan/seo.html`)
  - Complete Open Graph tags (website/article variants)
  - Twitter Cards with smart image handling
  - JSON-LD structured data (WebSite/Article schemas)
  - Meta tags (description, author, robots, canonical)
- Analytics module (`layouts/partials/totvan/analytics.html`)
  - Google Analytics 4 integration
  - Production-only loading
- Performance optimizations (`layouts/partials/totvan/head-basic.html`)
  - DNS preconnect for external resources
  - Resource preload for critical assets
- Refactored baseof.html for modular structure
- Configuration modernization: `params.marketing.*` structure

**Phase 2: Homepage Template System (v0.3.0)**
- Homepage router system with automatic layout selection
- 4 Homepage Layouts:
  1. `category-grid` (default) - Multi-category grid layout
  2. `magazine` - Magazine-style with hero and featured sections
  3. `minimal` - Minimalist text-focused layout
  4. `hero-featured` - Full-width hero with featured articles
- Reusable Functions:
  - `get-top-categories` - Get top categories by post count
  - `get-latest-posts-excluding` - Get latest posts with exclusions
- Complete configuration system for each layout
- Comprehensive documentation (`docs/homepage-layouts.md`)

**Phase 3: Partials Refactoring (v0.4.0)**
- Utility Functions Library:
  - `get-image-url` - Intelligent image URL resolution
  - `format-date` - Flexible date formatting
  - `get-primary-category` - Extract primary category
- Unified Component System:
  - `components/article-card` - Single component with 3 variants
    - `horizontal` - Image on left, compact layout
    - `vertical` - Image on top, grid-friendly
    - `minimal` - Text-only, no images
  - Rich customization options
- Backward compatibility wrappers for existing partials
- Complete component documentation (`docs/components-and-functions.md`)

**Phase 4: Documentation and Release (v1.0.0)**
- Comprehensive README with all features
- Complete CHANGELOG
- Example configuration file
- Full documentation suite

### Changed

**v0.2.0**
- Configuration structure: `params.analytics.google` → `params.marketing.analytics.google_analytics`
- Separated SEO and performance optimizations into distinct modules

**v0.3.0**
- Homepage implementation: original code moved to `category-grid` layout
- All homepage logic now uses reusable functions

**v0.4.0**
- Card components: refactored to use unified `article-card` component
- Date formatting: standardized through `format-date` function
- Category extraction: unified through `get-primary-category` function

### Performance

- Build time improved from ~12s to ~9.6s (20% faster) in v0.4.0
- Reduced template complexity
- More efficient Hugo compilation

### Deprecated

None. All changes are backward compatible.

### Removed

None. All original functionality preserved.

### Fixed

- Resolved Hugo module partial resolution issues (v0.2.0)
- Improved error handling in homepage router (v0.3.0)
- Fixed date format inconsistencies across templates (v0.4.0)

### Security

- All external resources use HTTPS
- No known security vulnerabilities

## [0.4.0] - 2025-10-21

Phase 3: Partials Refactoring and Component System

### Added
- Unified article card component with 3 variants
- 5 utility functions for common operations
- Complete component documentation

### Changed
- Card components now use unified implementation
- Improved code reusability (DRY principle)

### Performance
- Build time: 12s → 9.6s (20% improvement)

## [0.3.0] - 2025-10-21

Phase 2: Homepage Template System

### Added
- 4 homepage layout options
- Homepage router with validation
- Layout-specific configuration options
- Complete homepage documentation

### Changed
- Homepage now uses modular layout system
- Original homepage code moved to category-grid layout

## [0.2.0] - 2025-10-21

Phase 1: SEO/Analytics Modularization

### Added
- Modular SEO system
- Separated analytics module
- Performance optimization module
- Improved documentation

### Changed
- Configuration structure modernized
- Baseof.html refactored for modularity

## [0.1.0] - 2025-10-21

Initial tagged release

### Added
- Basic theme structure
- Tailwind CSS integration
- Waline comment system support
- AdSense integration
- Mobile responsive design
- Image optimization
- Basic SEO support

---

## Migration Guides

### Migrating to v1.0.0

**From v0.4.0**: No changes required, fully compatible

**From v0.3.0**: No changes required, fully compatible

**From v0.2.0**: No changes required, fully compatible

**From v0.1.0**:

Update your configuration:

```toml
# Old
[params.analytics]
  google = "G-XXXXXXXXXX"

# New
[params.marketing.analytics]
  google_analytics = "G-XXXXXXXXXX"
```

That's it! All other changes are backward compatible.

### Recommended Updates

While not required, we recommend:

1. **Use new component system** for better customization:
   ```go-html-template
   {{/* Old (still works) */}}
   {{ partial "content/card" . }}

   {{/* New (more features) */}}
   {{ partial "components/article-card" (dict "page" . "variant" "horizontal") }}
   ```

2. **Consider homepage layouts** for better presentation:
   ```toml
   [params.homepage]
     layout = "magazine"  # or minimal, hero-featured
   ```

3. **Use utility functions** for cleaner templates:
   ```go-html-template
   {{/* Old */}}
   {{ .Date.Format "January 2, 2006" }}

   {{/* New */}}
   {{ partial "functions/format-date" (dict "date" .Date "format" "long") }}
   ```

## Support

- **Documentation**: https://github.com/harrison-ming/totvan-hugo-theme/tree/main/docs
- **Issues**: https://github.com/harrison-ming/totvan-hugo-theme/issues
- **Discussions**: https://github.com/harrison-ming/totvan-hugo-theme/discussions

## Contributors

- Harrison Ming (@harrison-ming) - Creator and maintainer
- Claude Code - Development assistance

---

[1.0.0]: https://github.com/harrison-ming/totvan-hugo-theme/releases/tag/v1.0.0
[0.4.0]: https://github.com/harrison-ming/totvan-hugo-theme/releases/tag/v0.4.0
[0.3.0]: https://github.com/harrison-ming/totvan-hugo-theme/releases/tag/v0.3.0
[0.2.0]: https://github.com/harrison-ming/totvan-hugo-theme/releases/tag/v0.2.0
[0.1.0]: https://github.com/harrison-ming/totvan-hugo-theme/releases/tag/v0.1.0
