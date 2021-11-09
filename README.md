# PixiJS Animated GIF

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
const loader = new Loader();
loader.add('image', 'image.gif');
loader.load((loader, resources) => {
    const image = resources.image.data;
    image.play();
    this.addChild(image);
});
```