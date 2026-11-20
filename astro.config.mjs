import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkVideoEmbed from './src/plugins/remark-video-embed.mjs';
import remarkCallouts from './src/plugins/remark-callouts.mjs';
import rehypeCodeChrome from './src/plugins/rehype-code-chrome.mjs';

export default defineConfig({
  site: 'https://wujisixsix6.cn',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMath, remarkCallouts, remarkVideoEmbed],
    rehypePlugins: [
      [
        rehypeKatex,
        {
          strict: false,
          trust: true,
        },
      ],
      rehypeCodeChrome,
    ],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'vitesse-dark',
      },
      defaultColor: false,
      wrap: false,
    },
  },
});
