import MarkdownIt from 'markdown-it';

type Inline = {
  name: string;
  marker: string;
  parseContent?: (content: string) => {
    className: string;
    textStartOffset: number;
  };
};

const HIGHLIGHT_COLORS = new Set(['red', 'green', 'blue']);

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
    const parsed = inline.parseContent
      ? inline.parseContent(content)
      : { className: inline.name, textStartOffset: 0 };

    if (silent) return true;

    const oldPosMax = state.posMax;

    const tokenOpen = state.push(`${inline.name}_open`, 'span', 1);
    tokenOpen.markup = inline.marker;
    tokenOpen.attrSet('class', parsed.className);

    state.pos = start + inline.marker.length + parsed.textStartOffset;
    state.posMax = end;
    state.md.inline.tokenize(state);

    const tokenClose = state.push(`${inline.name}_close`, 'span', -1);
    tokenClose.markup = inline.marker;

    state.pos = end + inline.marker.length;
    state.posMax = oldPosMax;
    return true;
  };

  md.inline.ruler.before('emphasis', inline.name, inlineRule);
}

export function mdCustomInlines(md: MarkdownIt) {
  // ==highlight==
  registerInline(md, {
    name: 'highlight',
    marker: '==',
    parseContent: (content) => {
      const colorMatch = content.match(/^([a-zA-Z]+):(.+)$/);
      const color =
        colorMatch && HIGHLIGHT_COLORS.has(colorMatch[1])
          ? colorMatch[1]
          : 'default';
      const hasValidColor = color !== 'default';

      return {
        className: hasValidColor
          ? `highlight highlight-${color}`
          : 'highlight',
        textStartOffset: hasValidColor ? colorMatch![1].length + 1 : 0,
      };
    },
  });
}
