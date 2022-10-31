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

