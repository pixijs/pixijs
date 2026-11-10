# scene-core-concepts

The v8 scene graph as a whole: containers vs leaves, render order, and which reference owns each concept and display object.

## The scene graph

A tree rooted at `app.stage`. Every display object is a `Container` subclass; v7's `DisplayObject` is gone, so type parameters and base classes use `Container`. Earlier siblings draw behind later ones. Nothing is culled unless you run a culler ([performance](performance.md#culling)).

## Container vs leaf

Only a `Container` (or a `RenderLayer`, through `attach`) groups other nodes. `Sprite` and its variants, `Graphics`, `Text` and its variants, `Mesh` and its variants, `ParticleContainer`, `DOMContainer` and `GifSprite` are leaves with `allowChildren = false`: `sprite.addChild(...)` logs a deprecation warning and is scheduled to become an error, and `ParticleContainer.addChild` throws (it holds `Particle` data objects via `addParticle`, see [scene-particle-container](scene-particle-container.md)). To group a leaf with other nodes or with its mask, make them children of a plain `Container`.

## Where each concept lives

- Transforms, `pivot`/`origin`, `toGlobal`/`toLocal`, bounds, `zIndex`, hiding (`visible`/`renderable`/`alpha`), container events, `destroy`: [scene-container](scene-container.md). `worldTransform` is stale until the next render; read positions with `toGlobal`/`getGlobalPosition`.
- The three matrices, screen vs global coordinates, cumulative alpha, scale 0: [transforms](scene-core-concepts/transforms.md).
- One draw order across different parents, or a draw order decoupled from the hierarchy: `RenderLayer`, see [layers](scene-core-concepts/layers.md).
- A large subtree that pans or fades as a whole: `isRenderGroup: true`, see [render-groups](scene-core-concepts/render-groups.md).
- Clipping: set `container.mask`; a `Graphics`/`Container` mask uses the stencil buffer, a `Sprite` mask an alpha filter (red channel by default), a number a `ColorMask`. Clear with `container.mask = null`. Inverse masks, channels and teardown: [masking](scene-core-concepts/masking.md).
- `blendMode`: [blend-modes](blend-modes.md). Culling and `cacheAsTexture`: [performance](performance.md).
- Constructor options every node shares, and the ones that misbehave as options: [constructor-options](scene-core-concepts/constructor-options.md).

## Which reference covers which leaf

| Leaf | Primary use | Reference |
| --- | --- | --- |
| `Sprite`, `NineSliceSprite`, `TilingSprite`, `AnimatedSprite` | A texture at a position; resizable panels; repeating backgrounds; frame animation | [scene-sprite](scene-sprite.md) |
| `Text` / `BitmapText` / `HTMLText` / `SplitText` / `SplitBitmapText` | Text | [scene-text](scene-text.md) |
| `Graphics` | Vector shapes, paths, fills, strokes (backed by a `GraphicsContext`) | [scene-graphics](scene-graphics.md) |
| `Mesh` / `MeshSimple` / `MeshPlane` / `MeshRope` / `PerspectiveMesh` | Custom geometry, deformed or path-following textures, 2D perspective | [scene-mesh](scene-mesh.md) |
| `ParticleContainer` + `Particle` | Thousands of lightweight sprites | [scene-particle-container](scene-particle-container.md) |
| `DOMContainer` | An HTML element positioned by the scene graph | [scene-dom-container](scene-dom-container.md) |
| `GifSprite` | Animated GIF playback (`pixi.js/gif`) | [scene-gif](scene-gif.md) |
