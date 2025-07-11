# @nakobase/nakobase-md-html

Convert Markdown to **sanitized HTML** and apply consistent styles – simple, secure, and styled.

## Installation

```bash
# npm
npm install @nakobase/nakobase-md-html

# yarn
yarn add @nakobase/nakobase-md-html

# pnpm
pnpm add @nakobase/nakobase-md-html
```

## Usage

### Basic Usage

```ts
import { mdToHtml } from '@nakobase/nakobase-md-html';

const html = mdToHtml(
  `
# Hello World

This is a test of the markdown to html converter.
`,
  {
    codeHighlight: true,  // Enable code highlighting (optional, default is false)
    rich: true           // Enable rich features like containers and custom blocks (optional, default is false)
  }
);

console.log(html);
```

### Styles

We have some default styles that are applied to the HTML.

```ts
import '@nakobase/nakobase-md-html/styles/style.css';

import 'prismjs/themes/prism-okaidia.css'; // or any other prism theme if you want
```

Add `.nbcontents` to the container of the markdown.

```html
<div class="nbcontent">
  <!-- HTML parsed from markdown -->
</div>
```
