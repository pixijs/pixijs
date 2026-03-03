---
title: Cache as Texture
description: Learn how to use cacheAsTexture in PixiJS to optimize rendering performance by caching containers as textures. Understand its benefits, usage, and guidelines.
category: scene
---

# Cache as texture

If a container has many children that rarely change (a decorated UI panel, a complex background), you can snapshot it into a single texture. Subsequent frames draw that one texture instead of processing every child, which can significantly reduce draw calls.

> [!NOTE]
> `cacheAsTexture` is PixiJS v8's equivalent of the previous `cacheAsBitmap` functionality. If you're migrating from v7 or earlier, replace `cacheAsBitmap` with `cacheAsTexture` in your code.

---

### Quick start

Call `container.cacheAsTexture()` to snapshot the container into a texture.

To update the texture after making changes to the container:

```javascript
container.updateCacheTexture();
```

To turn it off:

```javascript
container.cacheAsTexture(false);
```

---

### Basic usage

```javascript
import { Application, Assets, Container, Sprite } from 'pixi.js';

(async () => {
  const app = new Application();
  await app.init({ background: '#1099bb', resizeTo: window });
  document.body.appendChild(app.canvas);

  await Assets.load('https://pixijs.com/assets/spritesheet/monsters.json');

  const aliens = [];
  const alienFrames = ['eggHead.png', 'flowerTop.png', 'helmlok.png', 'skully.png'];

  const alienContainer = new Container();
  alienContainer.x = 400;
  alienContainer.y = 300;
  app.stage.addChild(alienContainer);

  for (let i = 0; i < 100; i++) {
    const frameName = alienFrames[i % 4];
    const alien = Sprite.from(frameName);

    alien.tint = Math.random() * 0xffffff;
    alien.x = Math.random() * 800 - 400;
    alien.y = Math.random() * 600 - 300;
    alien.anchor.x = 0.5;
    alien.anchor.y = 0.5;
    aliens.push(alien);
    alienContainer.addChild(alien);
  }

  // Cache as a single texture instead of drawing 100 sprites
  alienContainer.cacheAsTexture();
})();
```

In this example, the container and its children are rendered to a single texture, reducing the rendering overhead when the scene is drawn.

### Advanced usage

Pass a configuration object instead of `true`:

```typescript
container.cacheAsTexture({
  resolution: 2,
  antialias: true,
});
```

- `resolution`: Resolution of the texture. Defaults to the renderer or application resolution.
- `antialias`: Antialias mode for the texture. Defaults to the renderer or application antialias mode.

---

### Benefits

- **Performance boost**: Rendering a complex container as a single texture avoids processing each child element individually during each frame.
- **Optimized for static content**: Ideal for containers with static or rarely updated children.

---

### Advanced details

- **Memory tradeoff**: Each cached texture requires GPU memory. `cacheAsTexture` trades rendering speed for increased memory usage.
- **GPU limitations**: Most GPUs cap texture size at 4096x4096 (some support 8192 or 16384). If your container exceeds the device's max texture size, caching will fail silently. Check `renderer.texture.maxTextureSize` if unsure.

---

### How it works internally

Under the hood, `cacheAsTexture` converts the container into a render group and renders it to a texture. It uses the same texture cache mechanism as filters:

```javascript
container.enableRenderGroup();
container.renderGroup.cacheAsTexture = true;
```

Once cached, calling `updateCacheTexture()` is efficient and incurs minimal overhead. It's as fast as rendering the container normally.

---

### Do

- **Use for static content**: Apply `cacheAsTexture` to containers with elements that don't change frequently, such as a UI panel with static decorations.
- **Use for expensive effects**: Containers with filters benefit from caching since the filter result is reused.
- **Disable antialiasing when appropriate**: Setting antialiasing to false gives a small performance boost, though edges may appear more pixelated.
- **Adjust resolution**: If content is scaled down, use a lower resolution. If scaled up, consider a higher resolution. Higher resolution means a larger texture and more memory usage.

### Don't

- **Apply to large containers**: Avoid `cacheAsTexture` on containers larger than 4096x4096 pixels, as they may fail to cache due to GPU limitations. Split them into smaller containers instead.
- **Toggle frequently**: Don't flip `cacheAsTexture` on and off repeatedly on containers. This causes constant re-caching and negates the benefits. Cache once, then use `updateCacheTexture` to refresh.
- **Apply to sparse content**: Don't use `cacheAsTexture` for containers with few elements. The performance improvement will be negligible.
- **Ignore memory impact**: Each cached texture consumes GPU memory. Overusing `cacheAsTexture` can lead to resource constraints.

---

### Gotchas

- **Rendering depends on scene visibility**: The cache updates only when the containing scene is rendered. Modifying the layout after calling `cacheAsTexture` but before rendering will be reflected in the cache.

- **Containers are rendered with no transform**: Cached items are rendered at their actual size, ignoring transforms like scaling. An item scaled down by 50% will have its texture cached at 100% size, then scaled down by the scene.

- **Caching and filters**: Filters may not behave as expected with `cacheAsTexture`. To cache the filter effect, wrap the item in a parent container and apply `cacheAsTexture` to the parent.

- **Reusing the texture**: If you want to create a new texture based on the container, use `const texture = renderer.generateTexture(container)` and share it across your objects.
