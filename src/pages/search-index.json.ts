import type { APIRoute } from 'astro';
import { getPublishedPosts, computePostMeta, formatDate } from '../utils/blog';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const index = posts.map((post) => {
    const { readingMinutes } = computePostMeta(post.body);
    const plainContent = (post.body || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\$\$[\s\S]*?\$\$/g, ' ')
      .replace(/::(bilibili|youtube|video)\[[^\]]*\](?:\{[^}]*\})?/gi, ' ')
      .replace(/[#>*_`~\[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1200);

    return {
      slug: post.id,
      title: post.data.title,
      summary: post.data.summary,
      category: post.data.category,
      tags: post.data.tags,
      date: formatDate(post.data.pubDate),
      readingMinutes,
      content: plainContent,
    };
  });

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
