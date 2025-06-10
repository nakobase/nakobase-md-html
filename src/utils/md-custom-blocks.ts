import MarkdownIt from 'markdown-it';
import { escapeHtml } from 'markdown-it/lib/common/utils';

const SEPARATOR = '|';

export function mdCustomBlocks(md: MarkdownIt) {
  // External Link with Icon
  // @[link-external](url|text)
  md.block.ruler.before(
    'paragraph',
    'link-external',
    (state, startLine, endLine, silent) => {
      const start = state.bMarks[startLine] + state.tShift[startLine];
      const max = state.eMarks[startLine];
      const content = state.src.slice(start, max).trim();

      // Check if it's a link-external block
      const match = content.match(/^@\[link-external\]\((.*?)\)$/);
      if (!match) return false;

      if (silent) return true;

      const [url, text] = match[1].split(SEPARATOR);
      if (!url || !text) return false;

      const token = state.push('link_external', '', 0);
      token.content = `${url}${SEPARATOR}${text}`;
      token.markup = 'link-external';

      state.line = startLine + 1;
      return true;
    }
  );

  md.renderer.rules.link_external = (tokens, idx) => {
    const [url, text] = tokens[idx].content.split(SEPARATOR);
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="external-link">${escapeHtml(text)}</a>`;
  };
}
