import { visit } from 'unist-util-visit';

const LANG_LABELS = {
  ts: 'TypeScript',
  tsx: 'TSX',
  js: 'JavaScript',
  jsx: 'JSX',
  py: 'Python',
  python: 'Python',
  rs: 'Rust',
  rust: 'Rust',
  go: 'Go',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  yml: 'YAML',
  yaml: 'YAML',
  json: 'JSON',
  css: 'CSS',
  html: 'HTML',
  md: 'Markdown',
  mdx: 'MDX',
  astro: 'Astro',
  nginx: 'Nginx',
  sql: 'SQL',
  cpp: 'C++',
  c: 'C',
  tex: 'LaTeX',
  latex: 'LaTeX',
  plaintext: 'Text',
  text: 'Text',
};

/**
 * Rehype plugin that wraps Shiki <pre class="astro-code"> blocks in a luxury
 * chrome container with traffic dots, language label, and a copy button.
 */
export default function rehypeCodeChrome() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (node.tagName !== 'pre') return;

      const props = node.properties || {};
      const langRaw = String(props['dataLanguage'] || props['data-language'] || 'text').toLowerCase();
      const langLabel = LANG_LABELS[langRaw] || langRaw.toUpperCase();

      // Ensure astro-code has our class
      const existingClass = Array.isArray(props.className)
        ? props.className
        : typeof props.className === 'string'
          ? [props.className]
          : [];
      node.properties = {
        ...props,
        className: [...existingClass, 'wuji-code-pre'],
      };

      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['wuji-code-block'],
          'data-lang': langRaw,
        },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['wuji-code-header'] },
            children: [
              {
                type: 'element',
                tagName: 'div',
                properties: { className: ['wuji-code-dots'] },
                children: [
                  { type: 'element', tagName: 'span', properties: { className: ['dot'] }, children: [] },
                  { type: 'element', tagName: 'span', properties: { className: ['dot'] }, children: [] },
                  { type: 'element', tagName: 'span', properties: { className: ['dot'] }, children: [] },
                  {
                    type: 'element',
                    tagName: 'span',
                    properties: { className: ['wuji-code-lang'] },
                    children: [{ type: 'text', value: langLabel }],
                  },
                ],
              },
              {
                type: 'element',
                tagName: 'button',
                properties: {
                  type: 'button',
                  className: ['wuji-copy-btn'],
                  'aria-label': '复制代码',
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'span',
                    properties: { className: ['wuji-copy-label'] },
                    children: [{ type: 'text', value: '复制' }],
                  },
                ],
              },
            ],
          },
          node,
        ],
      };

      parent.children[index] = wrapper;
    });
  };
}
