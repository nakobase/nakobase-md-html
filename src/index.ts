#!/usr/bin/env node
import { MdToHtmlOptions } from './types';
import MarkdownIt from 'markdown-it';
import { sanitize } from './sanitizer';
import { boxOptions, detailsOptions } from './utils/md-container';
import { mdRendererFence } from './utils/md-renderer-fence';
import { mdCustomBlocks } from './utils/md-custom-blocks';
import { CONTAINER_TYPES } from './constants';

// plugins
const MdItImSize = require('@steelydylan/markdown-it-imsize').default;
const MdItInlineComments = require('markdown-it-inline-comments');
const MdItContainer = require('markdown-it-container');
const MdItTaskLists = require('markdown-it-task-lists');

export const mdToHtml = (
  markdown: string,
  options?: MdToHtmlOptions
): string => {
  const { codeHighlight } = options || {};
  if (!(markdown && markdown.length)) return '';

  const md = MarkdownIt({
    breaks: true,
    linkify: true,
  });

  md.linkify.set({
    fuzzyLink: false,
  });
  md.linkify.set({
    fuzzyEmail: false,
  });

  md.use(MdItInlineComments)
    .use(MdItImSize)
    .use(MdItTaskLists, { enabled: true })
    .use(MdItContainer, CONTAINER_TYPES.DETAILS, detailsOptions)
    .use(MdItContainer, CONTAINER_TYPES.BOX, boxOptions)
    .use(mdCustomBlocks);

  if (codeHighlight) {
    md.use(mdRendererFence);
  }

  return sanitize(md.render(markdown));
};
