import MarkdownIt from 'markdown-it';
import { escapeHtml } from 'markdown-it/lib/common/utils';

type Block = {
  name: string;
  marker: string;
  requiredKeys: string[];
  renderer: (attrs: Record<string, string>) => string;
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function registerKVBlock(md: MarkdownIt, block: Block) {
  const escapedMarker = escapeRegExp(block.marker);
  const blockRe = new RegExp(`^@\\[${escapedMarker}\\]\\(([^)]*)\\)$`);
  const attrRe = /([a-zA-Z0-9-_]+)="([^"]*)"/g;

  md.block.ruler.before(
    'paragraph',
    block.name,
    (state, start, _end, silent) => {
      const line = state.src
        .slice(state.bMarks[start] + state.tShift[start], state.eMarks[start])
        .trim();
      const m = line.match(blockRe);
      if (!m) return false;
      if (silent) return true;

      const attrs: Record<string, string> = {};
      let mat: RegExpExecArray | null;
      while ((mat = attrRe.exec(m[1]))) {
        attrs[mat[1]] = mat[2];
      }

      for (const key of block.requiredKeys) {
        if (!attrs[key]) {
          return false;
        }
      }

      const token = state.push(block.name, '', 0);
      token.meta = attrs;
      state.line = start + 1;
      return true;
    }
  );

  md.renderer.rules[block.name] = (tokens, idx) => {
    return block.renderer(tokens[idx].meta as Record<string, string>);
  };
}

export function mdCustomBlocks(md: MarkdownIt) {
  // @[img](src="", alt="", webp="", width="", height="")
  registerKVBlock(md, {
    name: 'image_with_webp',
    marker: 'img',
    requiredKeys: ['src'],
    renderer: ({ src, alt, webp, width, height, caption }) => {
      const webpSource = webp
        ? `<source srcset="${escapeHtml(webp)}" type="image/webp">`
        : '';
      const altText = alt ? `alt="${escapeHtml(alt)}"` : '';
      const widthAttr = width ? ` width="${escapeHtml(width)}"` : '';
      const heightAttr = height ? ` height="${escapeHtml(height)}"` : '';
      const captionText = caption ? `<em>${escapeHtml(caption)}</em>` : '';
      return `<picture>
        ${webpSource}
        <img src="${escapeHtml(src)}" ${altText}${widthAttr}${heightAttr}>
        ${captionText}
      </picture>`;
    },
  });

  // @[link-external](url="", text="")
  registerKVBlock(md, {
    name: 'link_external',
    marker: 'link-external',
    requiredKeys: ['url'],
    renderer: ({ url, text }) => {
      const label = text || url;
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="external-link">
        ${escapeHtml(label)}
      </a>`;
    },
  });
}
