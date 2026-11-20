export const SITE = {
  name: '无极',
  enName: 'WuJi',
  title: '无极 · WuJi — 算法、大模型与系统架构手记',
  shortTitle: '无极 · WuJi',
  tagline: '无极而太极，极简而深邃。',
  heroSubtitle:
    '专注算法底层推导、Transformer 架构剖析与前沿大模型演进观察。以代码筑器，以文字载道。',
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
  算法精研: {
    en: 'Algorithms',
    desc: 'KMP 字符串匹配、前缀函数自动机与经典算法的可视化动画演示与严格证明。',
    accent: 'seal',
    glyph: '算',
  },
  大模型前沿: {
    en: 'LLM Frontier',
    desc: '2026 年 11 月以来全球与国产最新大模型的架构演进、实测横评与工程选型。',
    accent: 'jade',
    glyph: '智',
  },
  'Transformer 原理': {
    en: 'Transformer',
    desc: '从自注意力、RoPE 旋转编码、SwiGLU 到 KV Cache 与 FlashAttention 的图解与 PyTorch 实现。',
    accent: 'seal',
    glyph: '构',
  },
};

export function getCategoryMeta(category: string) {
  return (
    CATEGORY_META[category] || {
      en: 'Collection',
      desc: `收录「${category}」主题下的全部技术文章与思考笔记。`,
      accent: 'seal',
      glyph: '卷',
    }
  );
}
