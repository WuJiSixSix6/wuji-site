import { visit } from 'unist-util-visit';

/**
 * Transforms GitHub-style alert blockquotes:
 * > [!NOTE]
 * > [!TIP]
 * > [!IMPORTANT]
 * > [!WARNING]
 * > [!CAUTION]
 */
const CALLOUT_MAP = {
  NOTE: { label: '注记 · NOTE', cls: 'callout-note', icon: '✦' },
  TIP: { label: '技巧 · TIP', cls: 'callout-tip', icon: '◈' },
  IMPORTANT: { label: '要义 · IMPORTANT', cls: 'callout-important', icon: '❖' },
  WARNING: { label: '警示 · WARNING', cls: 'callout-warning', icon: '▲' },
  CAUTION: { label: '注意 · CAUTION', cls: 'callout-caution', icon: '◆' },
};

export default function remarkCallouts() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      if (!node.children || node.children.length === 0) return;
      const firstChild = node.children[0];
      if (firstChild.type !== 'paragraph' || !firstChild.children?.length) return;

      const firstText = firstChild.children[0];
      if (firstText.type !== 'text') return;

      const match = firstText.value.match(
        /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:[ \t]+([^\n]*))?(?:\n|$)/i
      );
      if (!match) return;

      const kind = match[1].toUpperCase();
      const customTitle = match[2]?.trim();
      const meta = CALLOUT_MAP[kind];
      if (!meta) return;

      // Strip the marker from the first text node
      firstText.value = firstText.value.slice(match[0].length);
      if (!firstText.value) {
        firstChild.children.shift();
      }
      if (firstChild.children.length === 0) {
        node.children.shift();
      }

      node.data = node.data || {};
      node.data.hName = 'aside';
      node.data.hProperties = {
        className: ['wuji-callout', meta.cls],
        'data-callout': kind.toLowerCase(),
      };

      // Prepend a callout title header
      node.children.unshift({
        type: 'paragraph',
        data: {
          hName: 'div',
          hProperties: { className: ['wuji-callout-title'] },
        },
        children: [
          {
            type: 'text',
            value: `${meta.icon}  ${customTitle || meta.label}`,
          },
        ],
      });
    });
  };
}
