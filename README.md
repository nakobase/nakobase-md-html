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
    rich: true,           // Enable rich features like containers and custom blocks (optional, default is false)
    anchor: true,         // Enable anchor links (optional, default is false)
  }
);

console.log(html);
```

Add `.nbcontent` to the container of the markdown.

```html
<div class="nbcontent">
  <!-- HTML parsed from markdown -->
</div>
```

### Styles

We have some default styles that are applied to the HTML. All CSS variables use the `--nb-` prefix so they do not conflict with your app's design tokens (e.g. `--background`, `--primary`).

#### Import

**Basic** (markdown only):

```ts
import '@nakobase/nakobase-md-html/styles/base.css';
```

**Rich** (custom blocks, containers, etc.):

```ts
import '@nakobase/nakobase-md-html/styles/base.css';
import '@nakobase/nakobase-md-html/styles/rich.css';
```

#### Changing colors

You can customize colors in two ways:

1. **Content area (the `.nbcontent` block itself)**
   The library does not set `background-color` or `color` on `.nbcontent`, so it inherits from its parent (e.g. your page background and text color). To give it its own look, set them directly:

   ```css
   .nbcontent {
     background-color: #f8f8f8;
     color: #333;
   }
   ```

2. **Inner elements (code blocks, containers, links, etc.)**
   Override CSS variables on `.nbcontent`. Variables are prefixed with `--nb-` (e.g. `--nb-primary`, `--nb-link`, `--nb-background` for inner boxes). See [base styles](src/styles/base.scss) for the full list.

   ```css
   .nbcontent {
     --nb-primary: #2563eb;
     --nb-link: #0ea5e9;
   }
   ```

   If your overrides (e.g. in `globals.css`) don't take effect because the library CSS loads later, either **load your override CSS after the library** (e.g. import it after `base.css` / `rich.css` in the page that renders the content), or use **`!important`** (e.g. `--nb-link: #000 !important;`).

You can use both: e.g. set `.nbcontent { background-color; color; }` for the content area and `--nb-*` for code blocks and containers.

### Code Highlighting
If you want code highlighting, also import a Prism theme:

```ts
import 'prismjs/themes/prism-okaidia.css'; // or any other prism theme
```
