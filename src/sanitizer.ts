// sanitizer.ts
import sanitizeHtml, { defaults } from 'sanitize-html';

const extendedTags = [
  'iframe',
  'code',
  'details',
  'summary',
  'circle',
  'img',
  'input',
  'pre',
  'span',
  'picture',
  'source',
];

const extendedAttributes = {
  a: [...(defaults.allowedAttributes.a || []), 'id', 'class', 'data-line'],
  iframe: ['src', 'width', 'height', 'allow', 'sandbox', 'frameborder'],
  input: ['type', 'checked', 'disabled', 'readonly', 'value', 'class'],
  source: ['srcset', 'type'],
  img: ['src', 'alt', 'width', 'height'],
  ul: ['class'],
  ol: ['class'],
  li: ['class'],
  div: ['class'],
  pre: ['class'],
  code: [...(defaults.allowedAttributes.code || []), 'class'],
  span: ['class'],
};

export const sanitize = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: [...defaults.allowedTags, ...extendedTags],
    allowedAttributes: {
      ...defaults.allowedAttributes,
      ...extendedAttributes,
    },

    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      iframe: ['https'],
      img: ['http', 'https', 'data'],
    },

    allowedStyles: {
      '*': {
        width: [/^\d+(?:px|%)$/],
        height: [/^\d+(?:px|%)$/],
        'text-align': [/^(?:left|right|center|justify)$/],
      },
    },

    disallowedTagsMode: 'discard',
  });
