---
title: 无极博客全功能写作指南：Markdown、数学公式、代码块与 B 站视频
subtitle: 一篇带你掌握本站全部排版能力与自动化发布流程的完整示例
summary: 本文完整演示「无极 · WuJi」个人博客的全部核心能力：纯 Markdown 直接生成静态网页、KaTeX 行内与块级数学公式、Shiki 双主题专业代码块、哔哩哔哩/YouTube/直链视频一键嵌入、提示框、表格以及自动生成的浮动交互目录。
pubDate: 2026-11-20
category: 指南文档
tags:
  - Markdown
  - KaTeX
  - Bilibili
  - Astro
  - 写作规范
featured: true
pinned: true
coverTheme: celestial-gold
---

欢迎来到 **无极 · WuJi** 的数字花园。这座网站采用全静态构建架构，你只需要把普通的 `.md` 或 `.mdx` 文件放入 `src/content/blog/` 目录并推送到 GitHub，系统便会自动完成编译、目录解析、搜索索引生成以及云服务器上线。

> [!TIP] 极速发布工作流
> 写完文章后，执行 `git add . && git commit -m "post: 新文章" && git push`，GitHub Actions 会在约 40 秒内自动构建并同步至云服务器 Nginx。

## 一、Frontmatter 元数据规范

每篇 Markdown 博客顶部使用 YAML Frontmatter 声明文章元数据，系统会自动将其注入到 **摘要卡片、分类页、标签云、归档时间轴与 RSS 订阅源**：

```yaml
---
title: 文章主标题
subtitle: 可选副标题
summary: 精炼的文章摘要，会展示在卡片、文章顶部抽象框与 SEO 描述中
pubDate: 2026-11-20
category: 工程实践
tags: [Astro, TypeScript, 架构]
featured: true
pinned: false
coverTheme: celestial-gold # 可选：celestial-gold | jade-nebula | obsidian-aurora | crimson-ink | azure-void
---
```

## 二、LaTeX 数学公式（KaTeX）

本站内置了 `remark-math` 与 `rehype-katex`，并将 KaTeX 样式与字体随站点本地打包，无论国内外网络环境都能毫秒级高清渲染。

### 2.1 行内公式

在正文中可以直接使用单个美元符号包裹公式，例如欧拉恒等式 $e^{i\pi} + 1 = 0$、质能方程 $E = mc^2$，或者信息熵定义 $H(X) = -\sum_{i} p(x_i)\log_2 p(x_i)$。

### 2.2 块级复杂公式

使用双美元符号 `$$ ... $$` 可以优雅地排版大型公式、积分与矩阵，在移动端还会自动支持平滑横向滚动：

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V
$$

以及麦克斯韦方程组的微分形式与高斯积分：

$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0}, &
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \cdot \mathbf{B} &= 0, &
\nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0 \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{aligned}
$$

## 三、专业代码块与一键复制

代码块由 **Shiki** 在编译期完成语义着色，同时支持**暗色（Vitesse Dark）与亮色（GitHub Light）双主题自适应**，并自动配备窗口角标、语言标识、不可选中的行号列以及右上角一键复制按钮。

### TypeScript 示例

```ts
export interface OrbitNode {
  id: string;
  radius: number;
  velocity: number;
}

export function stepOrbit(node: OrbitNode, dt: number): { x: number; y: number } {
  const theta = node.velocity * dt;
  return {
    x: Number((Math.cos(theta) * node.radius).toFixed(4)),
    y: Number((Math.sin(theta) * node.radius).toFixed(4)),
  };
}
```

### Python 算法示例

```python
import math
from typing import Iterable

def softmax(logits: Iterable[float]) -> list[float]:
    values = list(logits)
    peak = max(values)
    exps = [math.exp(v - peak) for v in values]
    total = sum(exps)
    return [e / total for e in exps]

print(softmax([2.4, 1.2, 0.3]))
```

## 四、多平台视频播放（哔哩哔哩 / YouTube / 直链视频）

本站内置了自定义的 Markdown 视频解析插件 `remark-video-embed`。你甚至**不需要写任何 HTML 或 iframe 代码**，在纯 `.md` 文件里用一行极简指令，即可渲染出带平台徽章、标题栏和 16:9 影院自适应容器的播放器。

### 4.1 哔哩哔哩（Bilibili）视频嵌入

只需在 Markdown 中写下一行：

```markdown
::bilibili[BV13z421U7cs]{title="3Blue1Brown：GPT 是什么？直观理解 Transformer" p=1}
```

实际渲染效果如下（支持直接播放、全屏与跳转 B 站原页）：

::bilibili[BV13z421U7cs]{title="3Blue1Brown：GPT 是什么？直观理解 Transformer" p=1}

> [!NOTE] 更省事的写法
> 除了 `::bilibili[BV号]`，你也可以直接在文章里**独占一行粘贴一个 B 站或 YouTube 链接**，插件同样会自动把它升级为精致的嵌入式播放器。

### 4.2 其他视频平台语法一览

| 平台 | Markdown 语法 | 说明 |
| --- | --- | --- |
| 哔哩哔哩 | `::bilibili[BV号]{title="标题" p=1}` | 支持分 P 参数 `p`，默认高清无弹幕 |
| YouTube | `::youtube[视频ID]{title="标题"}` | 采用隐私增强域名 `youtube-nocookie.com` |
| 直链 MP4/WebM | `::video[https://.../demo.mp4]{title="标题"}` | 原生 HTML5 播放器，支持 `poster` 封面 |

## 五、提示框与结构化排版

你可以使用 GitHub 风格的 Callout 语法来强调重要结论、架构权衡或避坑经验：

> [!IMPORTANT] 架构设计准则
> 好的个人网站应当让读者专注于内容本身：动效服务于空间层次感，配色服务于阅读舒适度，工具链服务于零摩擦写作。

> [!WARNING] 写作小贴士
> 请确保每篇文章都包含至少两个二级标题（`##`），右侧浮动目录（TOC）会自动提取 `H2` / `H3` 结构并开启滚动高亮追踪。

至此，你已经掌握了「无极 · WuJi」博客系统的全部写作利器。按下 `⌘K`（Windows 为 `Ctrl+K`）还可以随时体验全站毫秒级检索！
