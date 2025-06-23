import { escapeHtml } from 'markdown-it/lib/common/utils';
import type Token from 'markdown-it/lib/token';

// ::: details Detail
//   summary here
// :::
export const detailsOptions = {
  validate: function (params: string) {
    return /^details\s+(.*)$/.test(params.trim());
  },
  render: function (tokens: Token[], idx: number) {
    const isOpeningTag = tokens[idx].nesting === 1;
    const m = tokens[idx].info.trim().match(/^details\s+(.*)$/);
    const summary = m?.[1] || '';
    if (isOpeningTag) {
      return (
        '<details><summary>' +
        escapeHtml(summary) +
        '</summary><div class="details-content">'
      );
    } else {
      return '</div></details>\n';
    }
  },
};

// Bubble
// ::: bubble alt="alt" src="src" width="100" height="100" pos="left"
// markdown
// :::
export const bubbleOptions = {
  validate: function (params: string) {
    return /^bubble(?:\s+\w+="[^"]*")*\s*$/.test(params.trim());
  },
  render: function (tokens: Token[], idx: number) {
    const isOpeningTag = tokens[idx].nesting === 1;
    if (isOpeningTag) {
      const info = tokens[idx].info.trim().replace(/^bubble\s*/, '');
      const regex = /(\w+)="([^"]*)"/g;
      const attrs: Record<string, string> = {};
      let m: RegExpExecArray | null;
      while ((m = regex.exec(info)) !== null) {
        attrs[m[1]] = m[2];
      }
      const {
        src = '',
        alt = '',
        width = '100',
        height = '100',
        pos = 'left',
      } = attrs;

      return (
        `<div class="bubble ${pos}">` +
        `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" ` +
        `width="${escapeHtml(width)}" height="${escapeHtml(height)}">` +
        `<div class="bubble-content">`
      );
    } else {
      return `</div></div>\n`;
    }
  },
};

// BubbleImage
// ::: bubbleImage alt="alt" src="src" width="100" height="100" pos="left"
// markdown
// :::
export const bubbleImageOptions = {
  validate: function (params: string) {
    return /^bubbleImage(?:\s+\w+="[^"]*")*\s*$/.test(params.trim());
  },
  render: function (tokens: Token[], idx: number) {
    const isOpeningTag = tokens[idx].nesting === 1;
    if (isOpeningTag) {
      const info = tokens[idx].info.trim().replace(/^bubbleImage\s*/, '');
      const regex = /(\w+)="([^"]*)"/g;
      const attrs: Record<string, string> = {};
      let m: RegExpExecArray | null;
      while ((m = regex.exec(info)) !== null) {
        attrs[m[1]] = m[2];
      }
      const { src = '', alt = '', width = '640', height = '360' } = attrs;

      return (
        `<div class="bubble-image">` +
        `<div class="bubble-image-wrapper">` +
        `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" ` +
        `width="${escapeHtml(width)}" height="${escapeHtml(height)}">` +
        `</div>` +
        `<div class="bubble-image-content">`
      );
    } else {
      return `</div></div>\n`;
    }
  },
};

// Box
// ::: box1 title
// markdown
// :::
//
export const boxOptions = {
  validate: function (params: string) {
    return /^(box[1-6])(?:\s+(.*))?$/.test(params.trim());
  },
  render: function (tokens: Token[], idx: number) {
    const isOpeningTag = tokens[idx].nesting === 1;

    if (isOpeningTag) {
      const m = tokens[idx].info.trim().match(/^(box[1-6])(?:\s+(.*))?$/);
      if (!m) return '';

      const boxType = m[1]; // box1, box2, etc.
      const boxTitle = m[2] || ''; // title (optional)
      return boxHtml(boxType, boxTitle);
    } else {
      return '</div>\n';
    }
  },
};

const boxHtml = (boxType: string, boxTitle: string) => {
  switch (boxType) {
    case 'box1':
      return `<div class="box ${boxType}">${boxTitle ? `<span>${boxTitle}</span>` : ''}`;
    case 'box2':
      return `<div class="box ${boxType}">`;
    case 'box3':
      return `<div class="box ${boxType}"><div class="msg-container"><span class="icon"></span>${`<span>${boxTitle ? boxTitle : 'Note'}</span>`}</div>`;
    case 'box4':
      return `<div class="box ${boxType}"><div class="msg-container"><span class="icon"></span>${`<span>${boxTitle ? boxTitle : 'Alert'}</span>`}</div>`;
    case 'box5':
    case 'box6':
      return `<div class="box ${boxType}"><div class="msg-container"><span class="icon"></span>${
        boxTitle ? `<span>${boxTitle}</span>` : ''
      }</div>`;
    default:
      return `<div class="box ${boxType}">${boxTitle ? `<span>${boxTitle}</span>` : ''}`;
  }
};
