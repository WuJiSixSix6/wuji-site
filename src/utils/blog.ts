import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export interface PostMeta {
  wordCount: number;
  readingMinutes: number;
}

/**
 * Accurate word count & reading time for mixed Chinese + English + Code Markdown.
 */
export function computePostMeta(body: string = ''): PostMeta {
  const cleaned = body
    .replace(/```[\s\S]*?```/g, (m) => ' ' + m.slice(0, 120) + ' ')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ');

  const cnChars = (cleaned.match(/[\u4e00-\u9fa5]/g) || []).length;
  const enWords = (cleaned.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9]+/g) || []).length;
  const wordCount = cnChars + enWords;
  // Average ~320 Chinese chars/min or ~220 English words/min
  const readingMinutes = Math.max(1, Math.ceil(cnChars / 320 + enWords / 220));
  return { wordCount, readingMinutes };
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateCN(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
  });
}

export async function getChronologicalPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getCategoriesMap(posts: BlogPost[]) {
  const map = new Map<string, BlogPost[]>();
  for (const post of posts) {
    const cat = post.data.category;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(post);
  }
  return Array.from(map.entries())
    .map(([name, items]) => ({ name, count: items.length, posts: items }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function getTagsMap(posts: BlogPost[]) {
  const map = new Map<string, BlogPost[]>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(post);
    }
  }
  return Array.from(map.entries())
    .map(([name, items]) => ({ name, count: items.length, posts: items }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function groupPostsByYearMonth(posts: BlogPost[]) {
  const yearMap = new Map<number, Map<number, BlogPost[]>>();
  for (const post of posts) {
    const y = post.data.pubDate.getFullYear();
    const m = post.data.pubDate.getMonth() + 1;
    if (!yearMap.has(y)) yearMap.set(y, new Map());
    const monthMap = yearMap.get(y)!;
    if (!monthMap.has(m)) monthMap.set(m, []);
    monthMap.get(m)!.push(post);
  }

  return Array.from(yearMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, monthMap]) => {
      const months = Array.from(monthMap.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([month, items]) => ({ month, posts: items }));
      const total = months.reduce((acc, cur) => acc + cur.posts.length, 0);
      return { year, total, months };
    });
}

export function getRelatedPosts(current: BlogPost, allPosts: BlogPost[], limit = 3): BlogPost[] {
  return allPosts
    .filter((p) => p.id !== current.id)
    .map((post) => {
      let score = 0;
      if (post.data.category === current.data.category) score += 3;
      const sharedTags = post.data.tags.filter((t) => current.data.tags.includes(t));
      score += sharedTags.length * 2;
      return { post, score };
    })
    .sort((a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf())
    .slice(0, limit)
    .map((item) => item.post);
}

export function getTotalStats(posts: BlogPost[]) {
  let totalWords = 0;
  for (const post of posts) {
    totalWords += computePostMeta(post.body).wordCount;
  }
  const categories = getCategoriesMap(posts);
  const tags = getTagsMap(posts);
  return {
    postCount: posts.length,
    totalWords,
    categoryCount: categories.length,
    tagCount: tags.length,
  };
}
