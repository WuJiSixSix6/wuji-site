---
title: 构建零运维个人数字花园：Astro + GitHub Actions + Nginx 自动化体系
subtitle: 告别繁琐后台与数据库焦虑，用 Git 驱动全自动上线流水线
summary: 分享「无极 · WuJi」个人博客背后的全链路部署架构：为什么选择 Astro 静态预渲染、如何编写安全可靠的 GitHub Actions 自动同步流水线，以及云服务器 Nginx 极致缓存与压缩配置。
pubDate: 2026-05-12
category: 体系构建
tags:
  - Astro
  - GitHub Actions
  - Nginx
  - DevOps
  - 自动化部署
featured: false
pinned: false
coverTheme: azure-void
---

一个能坚持写上五年的个人博客，最大的敌人从来不是文笔，而是**发布摩擦与运维心智负担**。

当你每次想写点东西，都要先登录后台、升级漏洞插件、担心 MySQL 内存溢出、处理图床失效时，写作的热情很快就会被消耗殆尽。

## 一、为什么选择「静态预渲染 + 自建云主机」？

相比传统的动态 CMS，现代静态站点生成器（如 **Astro**）结合一台轻量云服务器带来了接近完美的工程平衡：

- **极致首屏速度**：HTML、KaTeX 公式、Shiki 代码高亮全部在构建期生成，Nginx 直接从内存页缓存吐出静态文件，TTFB 常年低于 `20ms`。
- **零数据库安全面**：没有 PHP 解释器、没有 SQL 注入面、没有后台爆破风险。
- **Git 即版本历史**：每一篇文章的每一次修改都有完整 `git log`，永不丢失。
- **完全自主掌控**：部署在自己的云服务器上，可自由配置域名、HTTP/2、Brotli/Gzip 与自定义安全响应头。

## 二、GitHub Actions 无人值守部署流水线

当你在本地完成一篇 Markdown 博客并 `git push origin main` 后，CI 流水线会自动接管一切：

```yaml
name: Build and Deploy WuJi Site

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install & Build
        run: |
          npm ci
          npm run build

      - name: Sync dist to Cloud Server via rsync
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_SSH_KEY }}
          SERVER_HOST: ${{ secrets.SERVER_HOST }}
          SERVER_USER: ${{ secrets.SERVER_USER }}
        run: |
          mkdir -p ~/.ssh
          printf '%s\n' "$DEPLOY_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H "$SERVER_HOST" >> ~/.ssh/known_hosts
          rsync -avz --delete dist/ "${SERVER_USER}@${SERVER_HOST}:/var/www/wuji-site/"
```

> [!TIP] 原子化与增量传输
> 使用 `rsync -avz --delete` 不仅比整包上传快一个数量级，还能自动清理已删除的历史哈希产物，保持服务器目录永远干净整洁。

## 三、Nginx 生产级性能与缓存调优

对于 Astro 生成的静态站点，最关键的缓存策略是**动静分离**：

- `/_astro/` 下的 JS / CSS / 字体文件名全部带有内容哈希，可以放心地设置 `Cache-Control: public, max-age=31536000, immutable`；
- HTML 页面与 `search-index.json` / `rss.xml` 则设置为 `no-cache`，确保每次发布新文章后读者刷新即刻可见。

```nginx
server {
    listen 80 default_server;
    server_name _;

    root /var/www/wuji-site;
    index index.html;

    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss image/svg+xml font/woff2;

    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
}
```

## 四、总结

当工具链被彻底自动化之后，发博客这件事就回归到了最纯粹的状态：**打开编辑器，专注于思考与文字，然后 `git push`。**
