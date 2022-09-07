# @pixi/unsafe-eval

Adds support for environments that disallow support of `new Function`, such as WeChat.

## Installation

```bash
npm install @pixi/unsafe-eval
```

## Usage

If you are using a bundler, you need to pass the core bundle into the `install` method.

```js
import { ShaderSystem, Renderer } from '@pixi/core';
import { install } from '@pixi/unsafe-eval';

// Apply the patch to PIXI
install({ ShaderSystem });

// Create the renderer with patch applied
const renderer = new Renderer();
```

