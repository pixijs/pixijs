# Render Groups

A render group is a `Container` whose transform (position, scale, rotation, alpha, tint) is applied on the GPU as a single operation rather than being recalculated per-child on the CPU every frame. Use render groups for large stable sub-trees such as a game world, a HUD, or a parallax strip. Each render group owns its own instruction set and cannot batch with other groups.

## Quick Start

```ts
const world = new Container({ isRenderGroup: true });
const hud = new Container({ isRenderGroup: true });

app.stage.addChild(world, hud);

for (let i = 0; i < 5000; i++) {
  const bunny = new Sprite(bunnyTexture);
  bunny.x = Math.random() * 2000;
  bunny.y = Math.random() * 2000;
  world.addChild(bunny);
}

world.x = 100; // applied once on the GPU, not 5000 times on the CPU
```

Flag a container with `isRenderGroup: true` at construction, or call `enableRenderGroup()` at runtime.

## Core Patterns

### Construction options

```ts
const world = new Container({ isRenderGroup: true });

const hud = new Container();
hud.enableRenderGroup();
```

Both forms work. Pre-declare via the options object for static setups; call `enableRenderGroup()` when you want to flip the flag at runtime.

### The three transform levels

When a render group is in the chain, PixiJS composes three matrices:

1. `localTransform`; from the container's own position, scale, rotation, pivot, skew.
2. `groupTransform`; the child's position relative to the render group it belongs to.
3. `worldTransform`; the scene-root-space matrix.

For children inside a render group, the CPU only maintains `localTransform` and `groupTransform`. The GPU applies the group's own `worldTransform` once, then draws all the children. This is the performance win: the per-child CPU matrix math is cut from "one full walk per frame" to "one walk when children move."

### When to use render groups

Good fits:

- Game world with thousands of static entities.
- UI layer that mostly stays put.
- Parallax background strips.
- A menu or HUD overlay that scales or translates as a whole.

Bad fits:

- Small sub-trees (a dozen children). Overhead outweighs the save.
- Constantly-changing structure (children being added / removed per frame).
- Sub-trees that need to batch with other objects outside the group.

### Profile before adding

```ts
// Start without explicit render groups
const world = new Container();

// Measure frames, identify bottleneck

// Add if CPU transform updates dominate
world.enableRenderGroup();
```

Most scenes don't need explicit render groups beyond the auto-created root. The scene root container passed to `renderer.render()` is automatically a render group. Add explicit groups only when profiling shows CPU transform costs dominating.

### Render groups vs cacheAsTexture

```ts
const hud = new Container();
hud.cacheAsTexture({ antialias: true });

const world = new Container({ isRenderGroup: true });
```

- `cacheAsTexture()` rasterizes the sub-tree once to a texture and draws that texture each frame. Best for things that don't change visually.
- `isRenderGroup` keeps normal drawing but moves the group transform work to the GPU. Best for sub-trees whose children animate freely but whose structure is stable.

Render groups are lighter than cacheAsTexture and preserve dynamic children. Use cacheAsTexture only when the sub-tree is genuinely static.

## Common Mistakes

### [MEDIUM] Overusing render groups

Wrong:

```ts
for (const enemy of enemies) {
  enemy.enableRenderGroup();
}
```

Each render group has its own instruction set and can't batch with other groups. A scene with many small render groups generates many separate draw buckets, which is slower than a single batched draw. Apply render groups at a coarse level (world, HUD), not per-entity.


### [HIGH] Nesting many render groups

Wrong:

```ts
const world = new Container({ isRenderGroup: true });
const section = new Container({ isRenderGroup: true });
const tile = new Container({ isRenderGroup: true });
world.addChild(section);
section.addChild(tile);
```

Correct:

```ts
const world = new Container({ isRenderGroup: true });
const section = new Container();
const tile = new Container();
world.addChild(section);
section.addChild(tile);
```

Deep nesting of render groups multiplies the instruction set overhead. Pick a single level (usually one per "subsystem") and let the children be normal containers.


### [MEDIUM] Constantly adding/removing from a render group

If the sub-tree structure changes every frame (not just child transforms), the render group's instruction set is rebuilt each time, negating the performance benefit. Render groups help stable structures with animated children; not dynamic structures.


## API Reference

- [RenderGroup](https://pixijs.download/release/docs/rendering.RenderGroup.html.md)
- [Container](https://pixijs.download/release/docs/scene.Container.html.md)
- [ContainerOptions](https://pixijs.download/release/docs/scene.ContainerOptions.html.md)
