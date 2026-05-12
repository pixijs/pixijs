---
name: pixijs-scene-particle-container
description: "Use this skill when rendering thousands of lightweight sprites in PixiJS v8. Covers ParticleContainer with Particle instances, addParticle/removeParticle, particleChildren array, dynamicProperties (vertex, position, rotation, uvs, color), boundsArea, roundPixels, update. Triggers on: ParticleContainer, Particle, IParticle, addParticle, particleChildren, dynamicProperties, boundsArea, particle effects, constructor options, ParticleContainerOptions, ParticleOptions."
license: MIT
---

`ParticleContainer` is a specialized container for rendering hundreds to tens of thousands of lightweight sprites in a single draw call. Use it for particle effects, bullet patterns, or any case where you need a large number of similar-looking objects with minimal per-object overhead. Particles share a single base texture and have a restricted transform set; they are not full `Container` children.

Assumes familiarity with `pixijs-scene-core-concepts`. `ParticleContainer` is a special leaf in a different sense: it contains `Particle` instances in its own `particleChildren` array and rejects normal PixiJS children. Use `addParticle`, not `addChild`, and wrap the whole `ParticleContainer` in a `Container` if you need to group it with other scene objects.

The Particle API is new in v8 but is stable for production use.

## Quick Start

```ts
const texture = await Assets.load("particle.png");

const container = new ParticleContainer({
  texture,
  boundsArea: new Rectangle(0, 0, app.screen.width, app.screen.height),
  dynamicProperties: {
    position: true,
    rotation: false,
    color: false,
  },
});

for (let i = 0; i < 10000; i++) {
  container.addParticle(
    new Particle({
      texture,
      x: Math.random() * app.screen.width,
      y: Math.random() * app.screen.height,
    }),
  );
}

app.stage.addChild(container);
```

**Related skills:** `pixijs-scene-core-concepts` (scene graph basics), `pixijs-scene-sprite` (when you need full features per object), `pixijs-assets` (shared textures, atlases), `pixijs-performance` (batching, texture optimization), `pixijs-scene-container` (wrap with other display objects).

## Constructor options

### ParticleContainerOptions

All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`. Note that `children` is omitted: use `particles` instead.

| Option              | Type                 | Default                                                                        | Description                                                                                                                                                                     |
| ------------------- | -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `texture`           | `Texture`            | `null`                                                                         | Shared base texture for all particles. If omitted, the container falls back to the texture of the first particle added; every particle must share the same base texture source. |
| `particles`         | `T[]`                | `[]`                                                                           | Initial array of `Particle` (or `IParticle`) instances. Equivalent to calling `addParticle` for each, but skips per-call view updates.                                          |
| `dynamicProperties` | `ParticleProperties` | `{ vertex: false, position: true, rotation: false, uvs: false, color: false }` | Flags for which particle attributes re-upload to the GPU every frame. Only `position` is dynamic by default; mark what you animate, leave the rest static for speed.            |
| `roundPixels`       | `boolean`            | `false`                                                                        | Rounds particle positions to the nearest pixel. Produces crisper rendering for pixel-art styles at the cost of smooth sub-pixel motion.                                         |
| `shader`            | `Shader`             | default particle shader                                                        | Replaces the default particle shader. The custom shader must declare `aPosition`, `aUV`, `aColor`, plus any dynamic-only attributes enabled via `dynamicProperties`.            |

`boundsArea` is inherited from `Container` but is effectively required on `ParticleContainer`: the container returns empty bounds `(0, 0, 0, 0)` by default for performance, so without `boundsArea` it is culled as invisible when culling is active and `containsPoint` always misses.

### ParticleOptions

`Particle` is a lightweight struct, not a `Container` subclass — none of the `ContainerOptions` fields apply. The full option list:

| Option     | Type          | Default    | Description                                                                                                                            |
| ---------- | ------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `texture`  | `Texture`     | —          | Required. Texture used to render this particle. All particles in the same `ParticleContainer` must share the same base texture source. |
| `x`        | `number`      | `0`        | X position in the container's local space.                                                                                             |
| `y`        | `number`      | `0`        | Y position in the container's local space.                                                                                             |
| `scaleX`   | `number`      | `1`        | Horizontal scale factor.                                                                                                               |
| `scaleY`   | `number`      | `1`        | Vertical scale factor.                                                                                                                 |
| `anchorX`  | `number`      | `0`        | Horizontal anchor in 0–1 range; `0` is left, `0.5` is center, `1` is right.                                                            |
| `anchorY`  | `number`      | `0`        | Vertical anchor in 0–1 range; `0` is top, `0.5` is center, `1` is bottom.                                                              |
| `rotation` | `number`      | `0`        | Rotation in radians.                                                                                                                   |
| `tint`     | `ColorSource` | `0xffffff` | Tint color as hex number or CSS color string. Combined with `alpha` into the internal `color` field.                                   |
| `alpha`    | `number`      | `1`        | Transparency (0–1). Values outside the range are clamped. Combined with `tint` into the internal `color` field.                        |

The constructor also accepts a bare `Texture` as its sole argument (`new Particle(texture)`), which is shorthand for `new Particle({ texture })` using the defaults above.

`Particle.defaultOptions` is a static object you can reassign to change defaults globally; see the "Particle creation" section below.

## Core Patterns

### Particle creation

```ts
const particle = new Particle({
  texture,
  x: 100,
  y: 200,
  scaleX: 0.5,
  scaleY: 0.5,
  anchorX: 0.5,
  anchorY: 0.5,
  rotation: Math.PI / 4,
  tint: 0xff0000,
  alpha: 0.8,
});

container.addParticle(particle);
```

`Particle` is a lightweight struct with flat numeric fields: `x`, `y`, `scaleX`, `scaleY`, `anchorX`, `anchorY`, `rotation`, `color`, `texture`. It also exposes `tint` (hex/CSS color) and `alpha` (0-1) as setters that combine into the internal `color` field. No transform hierarchy, no events, no filters.

You can pass a `Texture` directly as the sole argument: `new Particle(texture)`.

Override `Particle.defaultOptions` to change defaults globally:

```ts
Particle.defaultOptions = {
  ...Particle.defaultOptions,
  anchorX: 0.5,
  anchorY: 0.5,
};
```

### Pre-populating with the particles option

```ts
const particles = Array.from(
  { length: 10000 },
  () =>
    new Particle({
      texture,
      x: Math.random() * 800,
      y: Math.random() * 600,
    }),
);

const container = new ParticleContainer({
  texture,
  boundsArea: new Rectangle(0, 0, 800, 600),
  particles,
});
```

Passing `particles` in the constructor is equivalent to creating the container empty and calling `addParticle` for each one, but avoids per-call view updates.

### Dynamic vs static properties and update()

```ts
const container = new ParticleContainer({
  dynamicProperties: {
    rotation: true,
  },
});
```

`dynamicProperties` controls which particle attributes re-upload to the GPU every frame. The defaults on `ParticleContainer.defaultOptions.dynamicProperties` are:

```ts
{ vertex: false, position: true, rotation: false, uvs: false, color: false }
```

You only need to override the properties you are animating; the rest inherit the defaults (position dynamic, everything else static). Five properties in total:

- `vertex`: scale/anchor vertices
- `position`
- `rotation`
- `uvs`: texture coordinates (for frame-swapped particles)
- `color`: tint and alpha

Mark only what you animate; static properties are cheaper. If you change a static property at runtime, call `container.update()` to re-upload:

```ts
container.particleChildren.forEach((p) => {
  p.tint = 0x00ff00;
});
container.update();
```

### Batch operations on particleChildren

```ts
// Bulk add
const batch = [];
for (let i = 0; i < 5000; i++) {
  batch.push(
    new Particle({ texture, x: Math.random() * 800, y: Math.random() * 600 }),
  );
}
container.particleChildren.push(...batch);
container.update();

// Bulk remove
container.particleChildren.length = 0;
container.update();
```

`addParticle`, `addParticleAt`, `removeParticle`, `removeParticleAt`, and `removeParticles` all trigger view updates per call. For large batch operations, direct array manipulation plus a single `update()` is faster.

### Texture and shader options

`texture` in `ParticleContainerOptions` is optional. If omitted, the container falls back to the texture of the first particle added; every subsequent particle must share the same base texture source. Set it explicitly when you want to declare the atlas up front, or when the first particle might change mid-run:

```ts
const container = new ParticleContainer({ texture });
```

`shader` lets you replace the default particle shader with any `Shader` instance. The custom shader must declare the attributes the particle pipe uploads (`aPosition`, `aUV`, `aColor`, plus any dynamic-only attributes enabled via `dynamicProperties`). Use this for custom blending math, distance-field sprites, or non-standard effects:

```ts
const container = new ParticleContainer({ texture, shader: myCustomShader });
```

### Limitations

`ParticleContainer` intentionally sacrifices features for speed:

- No filters, masks, or blend modes on individual particles.
- No nested children on particles.
- No automatic bounds calculation.
- All particles must share the same base texture source (atlases work; multiple unrelated textures do not).
- Custom shaders are supported via the `shader` option.

### Container method migration

`ParticleContainer` uses a separate child management API optimized for GPU buffer updates. The standard `Container` child methods throw when called on a `ParticleContainer`.

| Standard Container method    | ParticleContainer equivalent                        |
| ---------------------------- | --------------------------------------------------- |
| `addChild(child)`            | `addParticle(particle)`                             |
| `removeChild(child)`         | `removeParticle(particle)`                          |
| `addChildAt(child, index)`   | `addParticleAt(particle, index)`                    |
| `removeChildAt(index)`       | `removeParticleAt(index)`                           |
| `removeChildren(begin, end)` | `removeParticles(begin, end)`                       |
| `getChildAt(index)`          | Access `container.particleChildren[index]` directly |
| `swapChildren()`             | Not available                                       |
| `reparentChild()`            | Not available                                       |

## Common Mistakes

### [CRITICAL] Adding Sprites to ParticleContainer

Wrong:

```ts
const container = new ParticleContainer();
const sprite = new Sprite(texture);
container.addChild(sprite);
```

Correct:

```ts
const container = new ParticleContainer();
const particle = new Particle(texture);
container.addParticle(particle);
```

`ParticleContainer` does not accept `Sprite` children. `addChild` throws an error. Particles must be `Particle` instances (or any object implementing `IParticle`), added via `addParticle`. This is a complete rework from v7, where `ParticleContainer` accepted `Sprite` children.


### [HIGH] Not setting boundsArea on ParticleContainer

Wrong:

```ts
const container = new ParticleContainer();
// bounds is always (0, 0, 0, 0) — culling and hit testing fail
```

Correct:

```ts
const container = new ParticleContainer({
  boundsArea: new Rectangle(0, 0, 800, 600),
});
```

`ParticleContainer` returns empty bounds `(0, 0, 0, 0)` by default for performance. Without `boundsArea`, the container is culled as invisible when culling is active, and `containsPoint` always misses. Set `boundsArea` to the region your particles occupy.


### [HIGH] Using children instead of particleChildren

Wrong:

```ts
container.addParticle(new Particle(texture));
console.log(container.children.length); // 0
```

Correct:

```ts
container.addParticle(new Particle(texture));
console.log(container.particleChildren.length); // 1
```

Particles are stored in the `particleChildren` array, not `children`. The standard `Container.children` array is empty on a `ParticleContainer`. All particle enumeration, counting, and manipulation must use `particleChildren` plus the `*Particle` methods.


### [MEDIUM] Do not use ParticleContainer as a normal container

`ParticleContainer` contains particles, not display objects. If you need to group a particle system with a background sprite or UI overlay, wrap the `ParticleContainer` itself inside a plain `Container`:

```ts
const world = new Container();
world.addChild(backgroundSprite, particleContainer, uiLayer);
```


## API Reference

- [ParticleContainer](https://pixijs.download/release/docs/scene.ParticleContainer.html.md)
- [ParticleContainerOptions](https://pixijs.download/release/docs/scene.ParticleContainerOptions.html.md)
- [Particle](https://pixijs.download/release/docs/scene.Particle.html.md)
- [ParticleOptions](https://pixijs.download/release/docs/scene.ParticleOptions.html.md)
- [IParticle](https://pixijs.download/release/docs/scene.IParticle.html.md)
- [ParticleProperties](https://pixijs.download/release/docs/scene.ParticleProperties.html.md)
