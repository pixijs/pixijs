---
name: pixijs-scene-core-concepts
description: "Use this skill when reasoning about the PixiJS v8 scene graph as a whole: how containers, leaves, transforms, and render order fit together. Covers leaf vs container distinction, local/world coordinates, culling, render groups, sortable children, masking, RenderLayer, constructor options shared by every scene node, and which leaf skill covers which display object. Triggers on: scene graph, display list, Container, Sprite, Graphics, Text, Mesh, ParticleContainer, DOMContainer, GifSprite, masking, render group, RenderLayer, world transform, constructor options, ContainerOptions."
license: MIT
---

This skill is the shared mental model referenced by all `pixijs-scene-*` leaves. It explains what the scene graph is in PixiJS v8, how a `Container` differs from a leaf, and where each concept lives. It does not go deep on any single API; it frames the pieces and points to the skill or reference file that does.

## Quick Start

```ts
const world = new Container({ isRenderGroup: true });
app.stage.addChild(world);

const hero = new Container({ label: "hero" });
hero.addChild(new Sprite(bodyTexture));
hero.addChild(new Sprite(faceTexture));
world.addChild(hero);

const mask = new Graphics().rect(0, 0, 800, 600).fill(0xffffff);
world.mask = mask;
world.addChild(mask);

hero.position.set(world.width / 2, world.height / 2);
```

**Related skills:** `pixijs-scene-container` (Container API in detail), the leaf skills (`pixijs-scene-sprite`, `pixijs-scene-graphics`, `pixijs-scene-text`, `pixijs-scene-mesh`, `pixijs-scene-particle-container`, `pixijs-scene-dom-container`, `pixijs-scene-gif`), `pixijs-events` (hit testing traverses the scene graph), `pixijs-performance` (cache, culling, render groups), `pixijs-math` (Matrix, toGlobal/toLocal detail).

## Core Concepts

### What the scene graph is

The PixiJS scene graph is a tree of display objects rooted at `app.stage`. Each node has a parent, a transform (position, scale, rotation, pivot, skew) relative to its parent, and optional visual state (alpha, tint, blendMode, visibility). Each frame the renderer walks the tree, composes transforms and visual state down to world-space, culls what's offscreen, and emits draw calls. The scene graph is both the layout model and the render order: earlier siblings draw behind later siblings.

Every display object in v8 is a `Container` subclass. `DisplayObject` from earlier versions was removed.

### Container vs leaf (CRITICAL)

There are two roles in the tree:

- **Containers**: nodes that hold children. Use a `Container` (or `RenderLayer`) for any node that groups, positions, or transforms other nodes.
- **Leaves**: nodes that draw something and have no children. Use `Sprite`, `Graphics`, `Text`, `Mesh`, `ParticleContainer`'s `Particle`, `DOMContainer`, or `GifSprite` as leaves.

In PixiJS v8, leaves must not have children. Adding children to a `Sprite` / `Graphics` / `Text` / `Mesh` logs a deprecation warning and is scheduled to become a hard error. The rule is: **use `Container` for any node that needs children; do not nest children inside leaf scene objects.** If you need to group a leaf with other leaves, wrap them in a `Container`.

This distinction is why the `pixijs-scene-*` skills are split the way they are: `pixijs-scene-container` covers the grouping node, and each leaf gets its own skill focused on its draw behavior.

### Transforms and coordinate spaces

Every container composes a `localTransform` (a `Matrix`) from its `position`, `scale`, `rotation`, `pivot`, and `skew`. The renderer multiplies parents' local transforms together to produce the `worldTransform` (and `groupTransform` if a render group is in the chain), which maps local points to scene-root space. Use `toGlobal(point)` and `toLocal(point, from?)` to convert between spaces, and `getGlobalPosition()` for this object's world position. Full Matrix detail lives in `pixijs-math`; transform setters and `toLocal`/`toGlobal` live in `pixijs-scene-container`.

### Render order and explicit z-ordering

Children render in array order: index 0 first, last index last. For explicit z-ordering on a single container, set `sortableChildren = true` and assign `zIndex` values to children. For render order that is decoupled from the logical hierarchy (e.g., a character's parent is a game world but its drawing happens on a UI layer), use `RenderLayer`. Deep detail, including when to prefer sortable children vs RenderLayer, is in `references/scene-management.md`.

### Render groups

Flagging a container with `isRenderGroup: true` (or calling `container.enableRenderGroup()`) tells PixiJS to apply its transform on the GPU as a single matrix instead of recomputing every descendant's world transform on the CPU each frame. Use render groups on large, stable sub-trees such as worlds, UI layers, or parallax strips. Deep detail in `references/scene-management.md`.

### Culling

`cullable = true` + a `cullArea: Rectangle` tells the `CullerPlugin` (or any culling pass) to skip rendering objects that fall outside the visible area. `cullableChildren = false` short-circuits recursive culling for a sub-tree whose children are always on screen. Culling is a performance topic; `pixijs-performance` and `references/scene-management.md` cover the trade-offs.

### Masking

Set `container.mask` to another display object to clip its rendering. PixiJS picks the mask type automatically: a `Graphics` or `Container` mask uses a stencil buffer, a `Sprite` mask uses an alpha filter, and a number selects a `ColorMask`. All four mask types (AlphaMask, StencilMask, ScissorMask, ColorMask) are covered in `references/masking.md`.

### Visibility, alpha, tint, and blend mode

`visible = false` skips rendering and transform updates; `renderable = false` skips rendering but still updates transforms (use when hit-testing or bounds queries need to stay live). `alpha` and `tint` multiply down through the sub-tree; `blendMode` controls how this container's draw instructions composite against what is already on the target. See `pixijs-blend-modes` for the full blend-mode list and `pixijs-scene-container` for per-node state.

### Destroy semantics

`container.destroy()` unlinks one node. `container.destroy({ children: true })` recursively destroys the whole sub-tree; always use this for killing a branch. `texture: true` and `textureSource: true` additionally tear down GPU resources owned by leaves. If `cacheAsTexture` is on, disable it before destroying. `pixijs-scene-container` documents the full signature.

### Lifecycle events

Containers emit events for hierarchy and visibility changes: `childAdded` / `childRemoved` on the parent, `added` / `removed` on the child, plus `visibleChanged` and `destroyed` on the container itself. Useful for wiring reactive UI updates or resource bookkeeping. Full details in `references/container-hierarchy.md`.

## Leaf comparison: which skill covers which object

| Leaf                                                                 | Primary use                                                                                                                                                                 | Skill                             |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `Sprite`                                                             | Draw a single texture at a position (with variants `NineSliceSprite` for resizable UI panels and `TilingSprite` for repeating backgrounds).                                 | `pixijs-scene-sprite`             |
| `Text` / `BitmapText` / `HTMLText` / `SplitText` / `SplitBitmapText` | Render text. Canvas-based `Text` for general use, `BitmapText` for high-volume cheap text, `HTMLText` for rich HTML/CSS layout, split variants for per-character animation. | `pixijs-scene-text`               |
| `Graphics`                                                           | Vector drawing: shapes, lines, paths, fills, strokes. Backed by a `GraphicsContext`.                                                                                        | `pixijs-scene-graphics`           |
| `Mesh` / `MeshSimple` / `MeshPlane` / `MeshRope` / `PerspectiveMesh` | Custom geometry with a shader or texture. Use `MeshRope` for textured path-following ribbons and `PerspectiveMesh` for 2D perspective.                                      | `pixijs-scene-mesh`               |
| `ParticleContainer` + `Particle`                                     | Thousands of lightweight sprites with a restricted transform set, for high-throughput particle effects.                                                                     | `pixijs-scene-particle-container` |
| `DOMContainer`                                                       | Render an HTML element positioned inside the scene graph (useful for inputs, iframes, accessibility overlays).                                                              | `pixijs-scene-dom-container`      |
| `GifSprite`                                                          | Animated GIF playback as a display object. Requires `pixi.js/gif`.                                                                                                          | `pixijs-scene-gif`                |

`Container` itself is covered in `pixijs-scene-container` and is the node every leaf lives inside.

## When to use what (quick decisions)

- "I want to group and transform some display objects" → `Container`, see `pixijs-scene-container`.
- "I want to draw a texture" → `Sprite`, see `pixijs-scene-sprite`.
- "I want to draw vector shapes or paths" → `Graphics`, see `pixijs-scene-graphics`.
- "I want to draw text" → `Text` / `BitmapText` / `HTMLText`, see `pixijs-scene-text`.
- "I want thousands of cheap sprites" → `ParticleContainer`, see `pixijs-scene-particle-container`.
- "I want a custom-geometry mesh or a deformed sprite" → `Mesh` or one of its variants, see `pixijs-scene-mesh`.
- "I want to clip a sub-tree" → set `.mask`, see `references/masking.md`.
- "I want a decoupled render order" → `RenderLayer`, see `references/scene-management.md`.
- "I want GPU-level transforms for a big stable sub-tree" → `isRenderGroup: true`, see `references/scene-management.md`.
- "I want to skip offscreen rendering" → `cullable = true` + `CullerPlugin`, see `pixijs-performance`.

## References

- [references/constructor-options.md](references/constructor-options.md): the ~30 fields inherited by every `Container`-derived node (transform, display, hierarchy, sorting, layout, effects, callbacks), with defaults, types, and when line-by-line assignment is appropriate. Shared reference for all leaf skills.
- [references/container-hierarchy.md](references/container-hierarchy.md): add/remove/swap children, reparenting with transform preservation, label navigation, destroy sub-trees.
- [references/transforms.md](references/transforms.md): position, scale, rotation, pivot, origin, skew, toGlobal/toLocal, the three matrices (local/group/world), bounds.
- [references/masking.md](references/masking.md): AlphaMask, StencilMask, ScissorMask, ColorMask, inverse masking, cost comparison.
- [references/layers.md](references/layers.md): `RenderLayer`, attach/detach, sorted layers, layer + logical parent split.
- [references/render-groups.md](references/render-groups.md): `isRenderGroup`, GPU-level transforms, when to use, render-groups vs `cacheAsTexture`.
- [references/scene-management.md](references/scene-management.md): combined view; render groups, `RenderLayer`, culling, zIndex sorting, `boundsArea`.

## Common Mistakes

### [CRITICAL] Adding children to a leaf display object

Wrong:

```ts
const sprite = new Sprite(texture);
sprite.addChild(new Graphics().rect(0, 0, 10, 10).fill(0xff0000));
```

Correct:

```ts
const group = new Container();
group.addChild(new Sprite(texture));
group.addChild(new Graphics().rect(0, 0, 10, 10).fill(0xff0000));
```

In v8 leaves (`Sprite`, `Graphics`, `Text`, `Mesh`, `ParticleContainer`, `DOMContainer`, `GifSprite`) technically extend `Container` but should not hold children. Adding children to a leaf produces undefined rendering behavior. Wrap the leaf in a `Container` when you need grouping.

### [CRITICAL] Referencing DisplayObject

Wrong:

```ts
import { DisplayObject } from "pixi.js"; // no such export in v8
function moveNode(node: DisplayObject) {
  node.x += 1;
}
```

Correct:

```ts
import { Container } from "pixi.js";
function moveNode(node: Container) {
  node.x += 1;
}
```

`DisplayObject` was removed in v8. Every display object — including `Sprite`, `Graphics`, `Text`, `Mesh` — is a `Container` subclass now. Use `Container` as the base type.

### [HIGH] Forgetting isRenderGroup on large static subtrees

Wrong:

```ts
const world = new Container();
for (let i = 0; i < 5000; i++) {
  world.addChild(new Sprite(texture));
}
app.stage.addChild(world);
```

Correct:

```ts
const world = new Container({ isRenderGroup: true });
for (let i = 0; i < 5000; i++) {
  world.addChild(new Sprite(texture));
}
app.stage.addChild(world);
```

Without `isRenderGroup: true`, the renderer recomposes every child's transform against its parents every frame. Marking the subtree as a render group caches transforms and draw state until a child changes, which is essential for large or mostly-static trees.

### [HIGH] Treating child.x as world space

Wrong:

```ts
const enemy = new Container();
enemy.x = 500;
world.addChild(enemy);
world.x = 200;
console.log(enemy.x); // 500 (local), not 700 (world)
```

Correct:

```ts
const worldPos = enemy.toGlobal({ x: 0, y: 0 });
console.log(worldPos.x); // 700
```

`Container.x/y/scale/rotation` are LOCAL to the parent. Use `toGlobal(point)` to compute world-space coordinates, or `getGlobalPosition()` for the container's origin in world space. The world transform is not exposed as a simple `x/y` pair.

### [MEDIUM] sortableChildren without zIndex

Wrong:

```ts
const layer = new Container();
layer.sortableChildren = true;
layer.addChild(bg); // no zIndex
layer.addChild(mid); // no zIndex
layer.addChild(fg); // no zIndex
// order is unchanged — all zIndex default to 0
```

Correct:

```ts
const layer = new Container();
layer.sortableChildren = true;
bg.zIndex = 0;
mid.zIndex = 10;
fg.zIndex = 20;
layer.addChild(bg, mid, fg);
```

`sortableChildren` re-sorts children by `zIndex` before rendering, but only takes effect when children actually have distinct `zIndex` values. Setting only the parent flag has no visible effect.

## Tooling

The [PixiJS Devtools Chrome extension](https://chromewebstore.google.com/detail/pixijs-devtools/aamddddknhcagpehecnhphigffljadon) lets you inspect and manipulate a running scene graph in real time. Install it for any non-trivial layout or render-order debugging.

## API Reference

- [Container](https://pixijs.download/release/docs/scene.Container.html.md)
- [ViewContainer](https://pixijs.download/release/docs/scene.ViewContainer.html.md)
- [RenderLayer](https://pixijs.download/release/docs/scene.RenderLayer.html.md)
- [RenderGroup](https://pixijs.download/release/docs/rendering.RenderGroup.html.md)
- [Bounds](https://pixijs.download/release/docs/rendering.Bounds.html.md)
- [Culler](https://pixijs.download/release/docs/scene.Culler.html.md)
- [CullerPlugin](https://pixijs.download/release/docs/app.CullerPlugin.html.md)
