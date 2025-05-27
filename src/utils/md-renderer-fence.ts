import MarkdownIt from 'markdown-it';
import { escapeHtml } from 'markdown-it/lib/common/utils';
import { highlightCode } from './highlight';

function getHtml({
  content,
  className,
  fileName,
  line,
}: {
  content: string;
  className: string;
  fileName?: string;
  line?: number;
}) {
  const escapedClass = escapeHtml(className);

  return `<div class="code-container">${
    fileName
      ? `<div class="code-filename-container"><span class="code-filename">${escapeHtml(
          fileName
        )}</span></div>`
      : ''
  }<pre class="${escapedClass}"><code class="${
    escapedClass !== '' ? `${escapedClass} code-line` : 'code-line'
  }" ${
    line !== undefined ? `data-line="${line}"` : ''
  }>${content}</code></pre></div>`;
}

function getClassName({ lang = '' }: { lang?: string }): string {
  const isSafe = /^[\w-]{0,30}$/.test(lang);
  if (!isSafe) return '';

  return lang ? `language-${lang}` : '';
}

const fallbackLanguages: {
  [key: string]: string;
} = {
  vue: 'html',
  react: 'jsx',
  fish: 'shell',
  sh: 'shell',
  cwl: 'yaml',
  tf: 'hcl', // ref: https://github.com/PrismJS/prism/issues/1252
};

function normalizeLangName(str?: string): string {
  if (!str?.length) return '';
  const langName = str.toLocaleLowerCase();
  return fallbackLanguages[langName] ?? langName;
}

export function parseInfo(str: string): {
  lang: string;
  fileName?: string;
} {
  if (str.trim() === '') {
    return {
      lang: '',
      fileName: undefined,
    };
  }

  // NOTE: javascript:index.js => ["javascript", "index.js"]
  const [langInfo, fileName] = str.split(':');

  const langNames = langInfo.split(' ');
  const langName: undefined | string = langNames[0];

  return {
    lang: normalizeLangName(langName),
    fileName,
  };
}

export function mdRendererFence(md: MarkdownIt) {
  // override fence
  md.renderer.rules.fence = function (...args) {
    const [tokens, idx] = args;
    const { info, content } = tokens[idx];
    const { lang, fileName } = parseInfo(info);

    const className = getClassName({
      lang,
    });
    const highlightedContent = highlightCode(content, lang);
    const fenceStart = tokens[idx].map?.[0];

    return getHtml({
      content: highlightedContent,
      className,
      fileName,
      line: fenceStart,
    });
  };
}
