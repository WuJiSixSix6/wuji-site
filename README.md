# 无极 · WuJi — 个人网站与技术博客

> 「无极而太极，极简而深邃。」

采用 **Astro + Tailwind CSS v4 + TypeScript + KaTeX + Shiki** 打造的玄墨金玉美学个人博客，托管于 GitHub 并通过 GitHub Actions 自动构建部署至云服务器 Nginx。

## 核心特性

- **Markdown / MDX 直转静态网页**：在 `src/content/blog/` 新建 `.md` 文件即自动生成文章页、SEO Meta、RSS 与 Sitemap
- **数学公式（KaTeX）**：原生支持行内 `$...$` 与块级 `$$...$$` LaTeX 公式，样式与字体本地打包，极速高清渲染
- **专业代码块（Shiki）**：暗/亮双主题高亮、行号、语言角标与一键复制按钮
- **多平台视频嵌入**：纯 Markdown 一行语法即可嵌入哔哩哔哩（BV号）、YouTube 或 HTML5 直链视频
- **完整博客模块**：首页精选 Bento、文章目录（TOC 滚动高亮）、文章摘要框、时间轴归档、专题分类、标签云、`⌘K` 全站即时搜索、暗/亮双主题切换、RSS 订阅
- **无人值守 CI/CD**：推送 `main` 分支即自动构建并同步至云服务器 `/var/www/wuji-site/`

## 快速写作与发布

1. 在 `src/content/blog/` 目录下新建一个 `.md` 文件，例如 `my-new-post.md`：

```markdown
---
title: 我的新文章
summary: 一句话概括文章核心内容
pubDate: 2026-11-21
category: 工程实践
tags: [Astro, 前端]
featured: false
pinned: false
coverTheme: celestial-gold
---

## 正文开始

支持行内公式 $E = mc^2$，以及 B 站视频嵌入：

::bilibili[BV13z421U7cs]{title="视频标题" p=1}
```

2. 提交并推送至 GitHub：

```bash
git add .
git commit -m "post: 发布新文章"
git push origin main
```

GitHub Actions 将在约 40 秒内自动编译并上线。

## 本地开发命令

```bash
npm install      # 安装依赖
npm run dev      # 启动本地开发服务器 (http://localhost:4321)
npm run build    # 构建生产静态产物至 dist/
npm run preview  # 预览构建结果
```
