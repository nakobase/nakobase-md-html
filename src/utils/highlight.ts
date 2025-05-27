import Prism, { Grammar } from 'prismjs';
import { escapeHtml } from 'markdown-it/lib/common/utils';

export function highlightCode(text: string, lang: string): string {
  const grammar: Grammar | undefined = Prism.languages[lang];
  if (!grammar) return escapeHtml(text);
  return Prism.highlight(text, grammar, lang);
}
