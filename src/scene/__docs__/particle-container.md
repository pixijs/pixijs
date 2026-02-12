---
title: Particle Container
description: Learn how to use the ParticleContainer and Particle classes in PixiJS for high-performance particle systems.
category: scene
---

# Particle Container

PixiJS v8 includes a high-performance particle system via the `ParticleContainer` and `Particle` classes. Designed for rendering vast numbers of lightweight visuals (sparks, bubbles, explosions), this system provides raw speed by stripping away non-essential overhead.

> [!WARNING]
> The Particle API is stable but **experimental**. Its interface may evolve in future PixiJS versions. We welcome feedback to help guide its development.

```ts
import { ParticleContainer, Particle, Texture } from 'pixi.js';

const texture = Texture.from('bunny.png');

const container = new ParticleContainer({
  dynamicProperties: {
    position: true, // default
    vertex: false,
    rotation: false,
    color: false,
  },
});

for (let i = 0; i < 100000; i++) {
  const particle = new Particle({
    texture,
    x: Math.random() * 800,
    y: Math.random() * 600,
  });

  container.addParticle(particle);
}

app.stage.addChild(container);
```

## Why use ParticleContainer?

- **Extreme performance**: Render hundreds of thousands or millions of particles at high FPS.
- **Lightweight design**: Particles are more efficient than `Sprite`, lacking children, events, or filters.
- **Fine-grained GPU uploads**: You declare which properties change per frame (`dynamic`) vs which are set once (`static`). Only dynamic properties are uploaded to the GPU each frame, reducing bandwidth.

### Performance tip: static vs dynamic

- **Dynamic properties** are uploaded to the GPU every frame.
- **Static properties** are uploaded only when `update()` is called.

Declare your needs explicitly:

```ts
const container = new ParticleContainer({
  dynamicProperties: {
    position: true,
    rotation: true,
    vertex: false,
    color: false,
  },
});
```

If you later modify a static property or the particle list, you must call:

```ts
container.update();
```

## Limitations and API differences

`ParticleContainer` is designed for speed and simplicity. As such, it doesn't support the full `Container` API:

`ParticleContainer` uses a separate child management API optimized for GPU buffer updates:

| Standard Container method | ParticleContainer equivalent |
| --- | --- |
| `addChild(child)` | `addParticle(particle)` |
| `removeChild(child)` | `removeParticle(particle)` |
| `addChildAt(child, index)` | `addParticleAt(particle, index)` |
| `removeChildAt(index)` | `removeParticleAt(index)` |
| `removeChildren(begin, end)` | `removeParticles(begin, end)` |
| `getChildAt(index)` | Access `container.particleChildren[index]` directly |
| `swapChildren()` | Not available |
| `reparentChild()` | Not available |

## Creating a particle

A `Particle` supports key display properties and is far more efficient than `Sprite`.

### Particle example

```ts
const particle = new Particle({
  texture: Texture.from('spark.png'),
  x: 200,
  y: 100,
  scaleX: 0.8,
  scaleY: 0.8,
  rotation: Math.PI / 4,
  tint: 0xff0000,
  alpha: 0.5,
});
```

You can also use the shorthand:

```ts
const particle = new Particle(Texture.from('spark.png'));
```

---

## API reference

- {@link ParticleContainer}
- {@link Particle}
