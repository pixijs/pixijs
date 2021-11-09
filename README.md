# PixiJS Animated GIF

[![Node.js CI](https://github.com/pixijs/gif/actions/workflows/nodejs.yml/badge.svg?branch=main)](https://github.com/pixijs/gif/actions/workflows/nodejs.yml)

Plugin to support playback of animated GIF images in PixiJS.

## Usage

Install the loader for handle GIF images.

```ts
import { AnimatedGIFLoader } from '@pixi/gif';
import { Loader } from '@pixi/loaders';

Loader.registerPlugin(AnimatedGIFLoader);
```

Load an animated GIF image.

```ts
import { Application } from 'pixi.js';

const app = new Application();
app.loader.add('image', 'image.gif');
app.loader.load((loader, resources) => {
    const image = resources.image.animation;
    app.stage.addChild(image);
});
```
