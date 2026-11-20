import { visit } from 'unist-util-visit';

/**
 * Remark plugin that lets authors embed videos directly in plain Markdown (.md):
 *
 * 1. Directive-like shorthand on its own paragraph:
 *    ::bilibili[BV13z421U7cs]{title="3Blue1Brown：直观理解 Transformer" p=1}
 *    ::youtube[wjZofJX0v4M]{title="But what is a GPT?"}
 *    ::video[https://example.com/demo.mp4]{title="演示视频" poster="https://..."}
 *
 * 2. Standalone Bilibili or YouTube URL on its own line:
 *    https://www.bilibili.com/video/BV13z421U7cs/
 *    https://www.youtube.com/watch?v=wjZofJX0v4M
 */

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseAttrs(attrString = '') {
  const attrs = {};
  const regex = /(\w+)=(?:"([^"]*)"|'([^']*)'|([^\s}]+))/g;
  let match;
  while ((match = regex.exec(attrString)) !== null) {
    attrs[match[1]] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attrs;
}

function renderBilibiliHtml(bvid, title = '哔哩哔哩视频', page = '1') {
  const safeBv = escapeHtml(bvid);
  const safePage = escapeHtml(String(page || '1'));
  const safeTitle = escapeHtml(title || `Bilibili · ${bvid}`);
  const src = `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&page=${encodeURIComponent(safePage)}&high_quality=1&danmaku=0&autoplay=0`;
  const originUrl = `https://www.bilibili.com/video/${encodeURIComponent(bvid)}/?p=${encodeURIComponent(safePage)}`;

  return `
<figure class="wuji-video-card" data-platform="bilibili">
  <div class="wuji-video-bar">
    <div class="wuji-video-meta">
      <span class="wuji-video-badge wuji-video-badge-bili">BILIBILI</span>
      <span class="wuji-video-title">${safeTitle}</span>
    </div>
    <a class="wuji-video-link" href="${originUrl}" target="_blank" rel="noopener noreferrer">
      在 B 站打开 ↗
    </a>
  </div>
  <div class="wuji-video-frame">
    <iframe
      src="${src}"
      title="${safeTitle}"
      scrolling="no"
      frameborder="0"
      allowfullscreen="true"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts allow-popups allow-presentation"
    ></iframe>
  </div>
</figure>`.trim();
}

function renderYoutubeHtml(videoId, title = 'YouTube 视频') {
  const safeTitle = escapeHtml(title || `YouTube · ${videoId}`);
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
  const originUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

  return `
<figure class="wuji-video-card" data-platform="youtube">
  <div class="wuji-video-bar">
    <div class="wuji-video-meta">
      <span class="wuji-video-badge wuji-video-badge-yt">YOUTUBE</span>
      <span class="wuji-video-title">${safeTitle}</span>
    </div>
    <a class="wuji-video-link" href="${originUrl}" target="_blank" rel="noopener noreferrer">
      在 YouTube 打开 ↗
    </a>
  </div>
  <div class="wuji-video-frame">
    <iframe
      src="${src}"
      title="${safeTitle}"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      loading="lazy"
    ></iframe>
  </div>
</figure>`.trim();
}

function renderDirectVideoHtml(url, title = '视频演示', poster = '') {
  const safeUrl = escapeHtml(url);
  const safeTitle = escapeHtml(title || '视频播放');
  const posterAttr = poster ? ` poster="${escapeHtml(poster)}"` : '';

  return `
<figure class="wuji-video-card" data-platform="html5">
  <div class="wuji-video-bar">
    <div class="wuji-video-meta">
      <span class="wuji-video-badge wuji-video-badge-native">VIDEO</span>
      <span class="wuji-video-title">${safeTitle}</span>
    </div>
    <a class="wuji-video-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">
      新窗口打开 ↗
    </a>
  </div>
  <div class="wuji-video-frame wuji-video-frame-native">
    <video controls preload="metadata" playsinline${posterAttr}>
      <source src="${safeUrl}" />
      您的浏览器暂不支持 HTML5 视频播放。
    </video>
  </div>
</figure>`.trim();
}

function extractParagraphText(node) {
  if (!node.children || node.children.length === 0) return '';
  return node.children
    .map((child) => {
      if (child.type === 'text') return child.value;
      if (child.type === 'link') return child.url;
      return '';
    })
    .join('')
    .trim();
}

export default function remarkVideoEmbed() {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;

      // Case 1: Single link node pointing to Bilibili or YouTube
      if (node.children?.length === 1 && node.children[0].type === 'link') {
        const link = node.children[0];
        const url = link.url || '';
        const linkText =
          link.children?.map((c) => c.value || '').join('').trim() || '';
        const customTitle = linkText && linkText !== url ? linkText : '';

        const biliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/i);
        if (biliMatch) {
          const pMatch = url.match(/[?&]p=(\d+)/);
          parent.children[index] = {
            type: 'html',
            value: renderBilibiliHtml(
              biliMatch[1],
              customTitle || `哔哩哔哩视频 · ${biliMatch[1]}`,
              pMatch ? pMatch[1] : '1'
            ),
          };
          return;
        }

        const ytMatch = url.match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
        );
        if (ytMatch) {
          parent.children[index] = {
            type: 'html',
            value: renderYoutubeHtml(
              ytMatch[1],
              customTitle || `YouTube · ${ytMatch[1]}`
            ),
          };
          return;
        }
      }

      // Case 2: Custom shorthand ::bilibili[BV...]{...}, ::youtube[...]{...}, ::video[...]{...}
      const raw = extractParagraphText(node);
      if (!raw.startsWith('::')) return;

      const directiveMatch = raw.match(
        /^::(bilibili|youtube|video)\[([^\]]+)\](?:\{([^}]*)\})?$/i
      );
      if (!directiveMatch) return;

      const platform = directiveMatch[1].toLowerCase();
      const target = directiveMatch[2].trim();
      const attrs = parseAttrs(directiveMatch[3] || '');

      let html = '';
      if (platform === 'bilibili') {
        const bvMatch = target.match(/(BV[a-zA-Z0-9]+)/i);
        const bvid = bvMatch ? bvMatch[1] : target;
        html = renderBilibiliHtml(bvid, attrs.title, attrs.p || attrs.page || '1');
      } else if (platform === 'youtube') {
        const ytMatch = target.match(/([a-zA-Z0-9_-]{11})/);
        const videoId = ytMatch ? ytMatch[1] : target;
        html = renderYoutubeHtml(videoId, attrs.title);
      } else if (platform === 'video') {
        html = renderDirectVideoHtml(target, attrs.title, attrs.poster);
      }

      if (html) {
        parent.children[index] = {
          type: 'html',
          value: html,
        };
      }
    });
  };
}
