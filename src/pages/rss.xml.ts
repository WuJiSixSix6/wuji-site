import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../data/site';
import { getChronologicalPosts } from '../utils/blog';

export async function GET(context: APIContext) {
  const posts = await getChronologicalPosts();
  return rss({
    title: SITE.title,
    description: SITE.heroSubtitle,
    site: context.site || 'https://wujisixsix6.cn',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.summary,
      categories: [post.data.category, ...post.data.tags],
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>zh-cn</language>`,
  });
}
