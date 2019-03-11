# @pixi/unsafe-eval

Adds support for environments that disallow support of `new Function`, such as WeChat.

## Installation

```bash
npm install @pixi/unsafe-eval
```

## Usage

If you are using a bundler, you need to pass the core bundle into the `install` method. This function takes one arguments, either the global `PIXI` object, or the core.

```js
import * as PIXI from '@pixi/core';
import { install } from '@pixi/unsafe-eval';

// Apply the patch to PIXI
install(PIXI);

// Create the renderer with patch applied
const renderer = new PIXI.Renderer();
```

If you are including **unsafe-eval.js** direct, you do not need to do anything else:

```html
<script src="pixi.min.js"></script>
<script src="unsafe-eval.min.js"></script>
```