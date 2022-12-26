# @pixi/unsafe-eval

Adds support for environments that disallow support of `new Function`, such as WeChat.

## Installation

```bash
npm install @pixi/unsafe-eval
```

## Usage

Import `@pixi/unsafe-eval` before you create `Application` or `Renderer`.

```js
import { Renderer } from '@pixi/core';

// Apply the patch to PIXI
import '@pixi/unsafe-eval';

// Create the renderer with patch applied
const renderer = new Renderer();
```

## CDN Install

Via jsDelivr:

```html
<!-- This script tag should be placed after pixi.min.js -->
<script src="https://cdn.jsdelivr.net/npm/@pixi/unsafe-eval@7.x/dist/unsafe-eval.min.js"></script>
```

Or via unpkg:

```html
<!-- This script tag should be placed after pixi.min.js -->
<script src="https://unpkg.com/@pixi/unsafe-eval@7.x/dist/unsafe-eval.min.js"></script>
```
