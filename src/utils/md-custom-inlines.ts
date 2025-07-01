import MarkdownIt from 'markdown-it';
import { escapeHtml } from 'markdown-it/lib/common/utils';

type Inline = {
  name: string;
  marker: string;
  renderer: (content: string, meta?: Record<string, any>) => string;
};

function registerInline(md: MarkdownIt, inline: Inline) {
  const inlineRule = (state: any, silent: boolean) => {
    const start = state.pos;
    const max = state.posMax;

    if (
      start + inline.marker.length > max ||
      state.src.slice(start, start + inline.marker.length) !== inline.marker
    ) {
      return false;
    }

    if (silent) return true;

    let end = start + inline.marker.length;
    while (end < max) {
      if (state.src.slice(end, end + inline.marker.length) === inline.marker) {
        break;
      }
      end++;
    }

    if (end >= max) {
      return false;
    }

    const content = state.src.slice(start + inline.marker.length, end);

    const token = state.push(inline.name, '', 0);
    token.content = content;
    token.markup = inline.marker;

    state.pos = end + inline.marker.length;
    return true;
  };

  md.inline.ruler.before('emphasis', inline.name, inlineRule);

  md.renderer.rules[inline.name] = (tokens, idx) => {
    return inline.renderer(tokens[idx].content, tokens[idx].meta);
  };
}

export function mdCustomInlines(md: MarkdownIt) {
  // ==highlight==
  registerInline(md, {
    name: 'highlight',
    marker: '==',
    renderer: (content) => {
      const colorMatch = content.match(/^([a-zA-Z]+):(.+)$/);
      const color = colorMatch ? colorMatch[1] : 'default';
      const text = colorMatch ? colorMatch[2] : content;
      const className =
        color === 'default' ? 'highlight' : `highlight highlight-${color}`;
      return `<span class="${className}">${escapeHtml(text)}</span>`;
    },
  });
}
