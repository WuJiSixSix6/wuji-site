export const SITE = {
  name: '无极',
  enName: 'WuJi',
  title: '无极 · WuJi — 数字花园与技术手记',
  shortTitle: '无极 · WuJi',
  tagline: '无极而太极，极简而深邃。',
  heroSubtitle:
    '在这里记录软件架构、数学之美、AI 算法与前端美学的深度思考。以代码筑器，以文字载道。',
  author: '无极 (WuJi)',
  githubUrl: 'https://github.com/WuJiSixSix6',
  repoUrl: 'https://github.com/WuJiSixSix6/wuji-site',
  email: 'wujisixsix6@gmail.com',
  location: 'Earth · Orbit',
  startYear: 2026,
} as const;

export const NAV_LINKS = [
  { label: '首页', en: 'Home', href: '/' },
  { label: '文章', en: 'Blog', href: '/blog/' },
  { label: '归档', en: 'Archive', href: '/archive/' },
  { label: '分类', en: 'Categories', href: '/categories/' },
  { label: '标签', en: 'Tags', href: '/tags/' },
  { label: '关于', en: 'About', href: '/about/' },
] as const;

export const CATEGORY_META: Record<
  string,
  { en: string; desc: string; accent: string; glyph: string }
> = {
  工程实践: {
    en: 'Engineering',
    desc: '现代前端渲染、架构设计、性能优化与高可靠性系统落地。',
    accent: 'jade',
    glyph: '⌘',
  },
  数学与AI: {
    en: 'Math & AI',
    desc: '从直觉到公式，拆解深度学习、信号处理与算法背后的数学原理。',
    accent: 'gold',
    glyph: '∑',
  },
  体系构建: {
    en: 'DevOps & Craft',
    desc: 'CI/CD 自动化、云原生运维、效率工具与数字花园工作流。',
    accent: 'azure',
    glyph: '◈',
  },
  思考随笔: {
    en: 'Essays',
    desc: '关于技术哲学、极简美学、系统复杂性与个体成长的沉淀。',
    accent: 'crimson',
    glyph: '◯',
  },
  指南文档: {
    en: 'Guides',
    desc: '排版规范、Markdown 扩展语法与博客写作功能全览。',
    accent: 'gold',
    glyph: '✦',
  },
};

export function getCategoryMeta(category: string) {
  return (
    CATEGORY_META[category] || {
      en: 'Collection',
      desc: `收录「${category}」主题下的全部技术文章与思考笔记。`,
      accent: 'gold',
      glyph: '◇',
    }
  );
}
