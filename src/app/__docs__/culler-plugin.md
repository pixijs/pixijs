---
title: Culler Plugin
description: Use the CullerPlugin in PixiJS to skip rendering for offscreen objects.
category: app
---

# Culler Plugin

The {@link CullerPlugin} improves performance by skipping offscreen objects during rendering. It checks whether each container (and its children) intersects the visible screen area. Objects outside the view are marked as hidden ("culled"), so the renderer skips them entirely. This reduces draw calls and update overhead.

PixiJS does not enable this plugin by default. You must register it manually with the `extensions` system.

## When to use it

Culling works well for:

- Large scenes with many offscreen elements
- Scrollable or camera-driven environments (e.g. tilemaps, world views)
- Reducing render cost without restructuring your scene graph

## Usage

```ts
import { Application, Container, Sprite, extensions, CullerPlugin } from 'pixi.js';

extensions.add(CullerPlugin);

const app = new Application();

await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x222222,
});

const world = new Container();
world.cullable = true;

const sprite = Sprite.from('path/to/image.png');
sprite.cullable = true;
world.addChild(sprite);

app.stage.addChild(world);
```

### Enabling the plugin

```ts
import { extensions, CullerPlugin } from 'pixi.js';

extensions.add(CullerPlugin);
```

This overrides the `render()` method on your `Application` instance to call `Culler.shared.cull()` before rendering:

```ts
// Internally replaces:
app.renderer.render({ container: app.stage });
// With:
Culler.shared.cull(app.stage, app.renderer.screen);
app.renderer.render({ container: app.stage });
```

### Configuring containers for culling

By default, containers are **not culled** (`cullable` is `false`). `cullableChildren` defaults to `true`, so you only need to set `cullable` on the containers you want culled:

```ts
container.cullable = true; // This container will be culled when offscreen
```

To disable recursive child culling:

```ts
container.cullableChildren = false; // Children won't be individually culled
```

### Custom cull area

You can define a `cullArea` to override the default bounds check (which uses global bounds):

```ts
import { Rectangle } from 'pixi.js';

container.cullArea = new Rectangle(0, 0, 100, 100);
```

This helps when bounding box calculations for a container's children are expensive or inaccurate.

---

## Manual culling

If you're not using the plugin but want to cull before rendering manually:

```ts
import { Culler } from 'pixi.js';

const stage = new Container();
// Configure stage and children...

Culler.shared.cull(stage, { x: 0, y: 0, width: 800, height: 600 });
renderer.render({ container: stage });
```

---

## API reference

- {@link CullerPlugin}
- {@link Culler}
