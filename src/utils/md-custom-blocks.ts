import MarkdownIt from 'markdown-it';
import { escapeHtml } from 'markdown-it/lib/common/utils';

type Block = {
  name: string;
  marker: string;
  requiredKeys: string[];
  renderer: (attrs: Record<string, string>) => string;
};

const attrRe = /([a-zA-Z0-9-_]+)="([^"]*)"/g;

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseAttrs(rawAttrs: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  let mat: RegExpExecArray | null;
  attrRe.lastIndex = 0;
  while ((mat = attrRe.exec(rawAttrs))) {
    attrs[mat[1]] = mat[2];
  }
  return attrs;
}

function hasRequiredAttrs(
  attrs: Record<string, string>,
  requiredKeys: string[]
): boolean {
  return requiredKeys.every((key) => attrs[key]);
}

function renderLinkExternal({
  url,
  text,
  target = '_blank',
  rel,
  icon = 'true',
}: Record<string, string>): string {
  const label = text || url;
  const relValues = new Set((rel || '').split(/\s+/).filter(Boolean));
  if (target === '_blank') {
    relValues.add('noopener');
    relValues.add('noreferrer');
  }
  const linkRel = [...relValues].join(' ');
  const className =
    icon === 'false' ? 'external-link external-link-no-icon' : 'external-link';
  const relAttr = linkRel ? ` rel="${escapeHtml(linkRel)}"` : '';

  return `<a href="${escapeHtml(url)}" target="${escapeHtml(target)}"${relAttr} class="${className}">${escapeHtml(label)}</a>`;
}

function registerKVBlock(md: MarkdownIt, block: Block) {
  const escapedMarker = escapeRegExp(block.marker);
  const blockRe = new RegExp(`^@\\[${escapedMarker}\\]\\(([^)]*)\\)$`);

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

      const attrs = parseAttrs(m[1]);

      if (!hasRequiredAttrs(attrs, block.requiredKeys)) return false;

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

function registerKVInline(md: MarkdownIt, block: Block) {
  const marker = `@[${block.marker}](`;

  md.inline.ruler.before('link', block.name, (state, silent) => {
    const start = state.pos;

    if (state.src.slice(start, start + marker.length) !== marker) {
      return false;
    }

    const end = state.src.indexOf(')', start + marker.length);
    if (end < 0) return false;

    const attrs = parseAttrs(state.src.slice(start + marker.length, end));
    if (!hasRequiredAttrs(attrs, block.requiredKeys)) return false;

    if (!silent) {
      const token = state.push(block.name, '', 0);
      token.meta = attrs;
    }

    state.pos = end + 1;
    return true;
  });

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
      const captionText = caption
        ? `<em class="custom-image-caption">${escapeHtml(caption)}</em>`
        : '';
      return `<picture class="custom-image">
        ${webpSource}
        <img src="${escapeHtml(src)}" ${altText}${widthAttr}${heightAttr}>
        ${captionText}
      </picture>`;
    },
  });

  // @[link-external](url="", text="")
  const linkExternal = {
    name: 'link_external',
    marker: 'link-external',
    requiredKeys: ['url'],
    renderer: renderLinkExternal,
  };
  registerKVBlock(md, linkExternal);
  registerKVInline(md, linkExternal);
}
