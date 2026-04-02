---
name: particle-container
description: >
  Render massive particle counts with PixiJS ParticleContainer. Uses
  Particle class (not Sprite), IParticle interface, addParticle/removeParticle,
  particleChildren array, dynamicProperties (vertex, position, rotation, uvs, color),
  boundsArea requirement, roundPixels, particles constructor option, and update()
  for manual refresh. No children, filters, or masks supported. Use when the user
  asks about particle systems, rendering thousands of sprites, particle effects,
  high-performance rendering, bulk sprite rendering, particle animations, snow,
  rain, fire particles, or optimizing large numbers of similar objects. Covers
  ParticleContainer, Particle, IParticle, addParticle, removeParticle,
  particleChildren, dynamicProperties, boundsArea, update.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  requires: "pixijs, core-concepts"
  sources: "pixijs/pixijs:src/scene/particle-container/shared/ParticleContainer.ts, pixijs/pixijs:src/scene/particle-container/shared/Particle.ts, pixijs/pixijs:src/__docs__/migrations/v8.md"
---

## When to Use This Skill

Apply when the user needs to render large numbers of similar objects (hundreds to tens of thousands) with maximum performance, such as particle effects, bullet patterns, or environmental particles.

**Related skills:** For full-featured individual sprites use **sprite**; for general performance optimization use **performance**; for loading shared textures use **asset-loading**; for scene hierarchy use **core-concepts**.

This skill builds on pixijs and core-concepts. Read them first for foundational concepts.

## Setup

```ts
import { ParticleContainer, Particle, Rectangle } from 'pixi.js';
import { Assets } from 'pixi.js';

const texture = await Assets.load('particle.png');

const container = new ParticleContainer({
    texture,
    boundsArea: new Rectangle(0, 0, 800, 600),
    dynamicProperties: {
        vertex: false,
        position: true,
        rotation: false,
        uvs: false,
        color: false,
    },
    roundPixels: false,
});

for (let i = 0; i < 10000; i++) {
    const particle = new Particle({
        texture,
        x: Math.random() * 800,
        y: Math.random() * 600,
    });
    container.addParticle(particle);
}

app.stage.addChild(container);
```

Key points:
- Use `Particle`, not `Sprite`. Use `addParticle()`, not `addChild()`.
- Set `boundsArea` for culling and hit testing; ParticleContainer never calculates bounds automatically.
- `dynamicProperties` controls which particle attributes upload to the GPU every frame. Five properties: `vertex` (scale/anchor vertices), `position`, `rotation`, `uvs`, `color`. Only mark what you animate; static properties are cheaper.
- `roundPixels` rounds particle positions to the nearest pixel for crisp rendering (default `false`).
- Pass a `particles` array in the constructor to pre-populate instead of calling `addParticle()` in a loop.
- All particles must share the same base texture (sprite sheets work; different base textures do not).

## Core Patterns

### Particle creation and properties

```ts
import { Particle } from 'pixi.js';

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

Particle is a lightweight struct with flat numeric fields: `x`, `y`, `scaleX`, `scaleY`, `anchorX`, `anchorY`, `rotation`, `color`, `texture`. It also exposes `tint` (hex/CSS color) and `alpha` (0-1) as setters that combine into the internal `color` field. No transform hierarchy, no events, no filters.

You can also pass a Texture directly to the constructor:

```ts
const particle = new Particle(texture);
```

Override `Particle.defaultOptions` to change defaults globally (e.g., center all particle anchors):

```ts
Particle.defaultOptions = {
    ...Particle.defaultOptions,
    anchorX: 0.5,
    anchorY: 0.5,
};
```

### Pre-populating with the `particles` option

```ts
const particles = Array.from({ length: 10000 }, () => new Particle({
    texture,
    x: Math.random() * 800,
    y: Math.random() * 600,
}));

const container = new ParticleContainer({
    texture,
    boundsArea: new Rectangle(0, 0, 800, 600),
    particles,
});
```

This is equivalent to creating the container and calling `addParticle()` for each one, but avoids per-call view updates.

### Dynamic vs static properties and update()

```ts
const container = new ParticleContainer({
    dynamicProperties: {
        vertex: false,
        position: true,
        rotation: true,
        uvs: false,
        color: false,
    },
});
```

Dynamic properties re-upload to the GPU every frame. Static properties only upload when you call `container.update()` or add/remove particles. If you change a static property (e.g. color when `color: false`), call `update()` afterward:

```ts
container.particleChildren.forEach((p) => {
    p.tint = 0x00ff00;
});
container.update();
```

### Batch operations on particleChildren

For maximum throughput, manipulate `particleChildren` directly and call `update()`:

```ts
// Bulk add
const particles = [];
for (let i = 0; i < 5000; i++) {
    particles.push(new Particle({ texture, x: Math.random() * 800, y: Math.random() * 600 }));
}
container.particleChildren.push(...particles);
container.update();

// Bulk remove
container.particleChildren.length = 0;
container.update();
```

`addParticle()`, `addParticleAt()`, `removeParticle()`, `removeParticleAt()`, and `removeParticles()` trigger view updates per call. For large batch operations, direct array manipulation plus a single `update()` is faster.

### Limitations

ParticleContainer intentionally sacrifices features for speed:
- No `addChild()`/`removeChild()` (throws errors; use `addParticle()`/`removeParticle()`)
- No `getChildAt()`/`setChildIndex()`/`getChildIndex()`/`swapChildren()` (use `particleChildren` array directly)
- No filters, masks, or blend modes on individual particles
- No nested children on particles
- No automatic bounds calculation
- All particles share the same base texture source
- Custom shaders are supported via the `shader` option

## Common Mistakes

### [CRITICAL] Adding Sprites to ParticleContainer

Wrong:
```ts
const container = new ParticleContainer();
const particle = new Sprite(texture);
container.addChild(particle);
```

Correct:
```ts
const container = new ParticleContainer();
const particle = new Particle(texture);
container.addParticle(particle);
```

v8 ParticleContainer does not accept Sprite children. `addChild()` throws an error. Particles must be `Particle` instances (or any object implementing `IParticle`), added via `addParticle()`. This is a complete rework from v7, where ParticleContainer accepted Sprites.

Source: src/__docs__/migrations/v8.md

### [HIGH] Not setting boundsArea on ParticleContainer

Wrong:
```ts
const container = new ParticleContainer();
// bounds is always (0, 0, 0, 0) -- culling and hit testing fail
```

Correct:
```ts
const container = new ParticleContainer({
    boundsArea: new Rectangle(0, 0, 800, 600),
});
```

ParticleContainer returns empty bounds `(0, 0, 0, 0)` by default for performance. Without `boundsArea`, the container will be culled as invisible when culling is active, and `containsPoint` hit testing will always miss. Set `boundsArea` to the region your particles occupy.

Source: src/__docs__/migrations/v8.md

### [HIGH] Using children instead of particleChildren

Wrong:
```ts
const container = new ParticleContainer();
container.addParticle(new Particle(texture));
console.log(container.children.length); // 0 -- particles are not in children
```

Correct:
```ts
const container = new ParticleContainer();
container.addParticle(new Particle(texture));
console.log(container.particleChildren.length); // 1
```

Particles are stored in the `particleChildren` array, not `children`. The standard Container `children` array is empty on a ParticleContainer. All particle enumeration, counting, and manipulation must use `particleChildren`, `addParticle()`, `addParticleAt()`, `removeParticle()`, `removeParticleAt()`, and `removeParticles()`.

Source: src/scene/particle-container/shared/ParticleContainer.ts

---

See also: core-concepts (Container, transforms), sprite (when you need full features per object), performance (batching, texture optimization), asset-loading (shared textures for particles)

## Learn More

- [ParticleContainer](https://pixijs.download/release/docs/scene.ParticleContainer.html.md)
- [Particle](https://pixijs.download/release/docs/scene.Particle.html.md)
