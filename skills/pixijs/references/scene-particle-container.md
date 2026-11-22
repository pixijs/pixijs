# scene-particle-container

`ParticleContainer` and `Particle`: thousands of lightweight sprites sharing one texture source in one draw call.

```ts
const texture = await Assets.load<Texture>("particle.png");

const container = new ParticleContainer<Particle>({
  texture,
  boundsArea: new Rectangle(0, 0, app.screen.width, app.screen.height),
  dynamicProperties: { position: true, color: true },
});

for (let i = 0; i < 10000; i++) {
  container.addParticle(new Particle({ texture, x: Math.random() * 800, y: Math.random() * 600 }));
}
app.stage.addChild(container);
```

v8 reworked it completely. v7's `ParticleContainer` took `Sprite` children and `(maxSize, properties)` positional arguments; v8 takes one options object, grows its buffer to fit (no `maxSize`), and holds `Particle` instances (or any `IParticle`) in its own `particleChildren` array. `children` stays empty, and the standard `Container` child methods throw:

| Container method             | ParticleContainer equivalent         |
| ---------------------------- | ------------------------------------ |
| `addChild(child)`            | `addParticle(...particles)`          |
| `removeChild(child)`         | `removeParticle(particle)`           |
| `addChildAt(child, index)`   | `addParticleAt(particle, index)`     |
| `removeChildAt(index)`       | `removeParticleAt(index)`            |
| `removeChildren(begin, end)` | `removeParticles(begin, end)`        |
| `getChildAt(index)`          | `container.particleChildren[index]`  |
| `swapChildren()`, `reparentChild()` | Not available                 |

To group particles with sprites or UI, put the `ParticleContainer` inside a plain `Container`.

## The `particles` option draws nothing on its own

The constructor's `particles` list is never marked for upload, and the GPU buffer is sized to fit it, so the static attributes (vertex, UVs, colour) stay empty and every particle is invisible. Use `addParticle(...list)`, which sets the flag, or call `container.update()` once right after constructing. `children` is not an option.

## Typing particleChildren

`ParticleContainer<T extends IParticle = IParticle>`: `particleChildren` is `T[]`, and `IParticle` has only `x`, `y`, `scaleX`, `scaleY`, `anchorX`, `anchorY`, `rotation`, `color` and `texture`. Reading or writing `tint` or `alpha` on `particleChildren` fails strict type checking (TS2339) unless you write `new ParticleContainer<Particle>({...})` (passing a `particles: Particle[]` option also infers it). Alternatively keep your own `Particle[]` array and loop over that.

## Options

`ParticleContainer`:

| Option              | Default                                                                        | Notes |
| ------------------- | ------------------------------------------------------------------------------ | ----- |
| `texture`           | `null`                                                                         | Shared texture. If omitted, the container uses the first particle's texture. Every particle must share the same base texture source (atlases work; unrelated textures do not). |
| `particles`         | `[]`                                                                           | Needs `update()`; see above.                                                                     |
| `dynamicProperties` | `{ vertex: false, position: true, rotation: false, uvs: false, color: false }` | See below.                                                                                       |
| `roundPixels`       | `false`                                                                        |                                                                                                  |
| `shader`            | default particle shader                                                        | See [Custom shader](#custom-shader).                                                             |

`Particle` is a flat struct, not a `Container` (no hierarchy, events, filters, or `ContainerOptions`). Options and defaults: `texture` (required), `x`/`y` `0`, `scaleX`/`scaleY` `1`, `anchorX`/`anchorY` `0` (top-left), `rotation` `0` (radians), `tint` `0xffffff` (any `ColorSource`), `alpha` `1` (clamped to 0–1). `tint` and `alpha` are setters combined into the internal `color` field. `new Particle(texture)` is shorthand for `new Particle({ texture })`. Change defaults globally with `Particle.defaultOptions = { ...Particle.defaultOptions, anchorX: 0.5, anchorY: 0.5 }`.

## dynamicProperties and update()

`dynamicProperties` selects which attributes re-upload every frame; override only the keys you animate, the rest keep the defaults above (`ParticleContainer.defaultOptions.dynamicProperties`). A change to a static property is ignored (no error, nothing changes on screen) until `container.update()` re-uploads everything.

| You change per frame                     | Key that must be `true`                     |
| ---------------------------------------- | ------------------------------------------- |
| `x`, `y`                                 | `position` (default on)                     |
| `rotation`                               | `rotation`                                  |
| `scaleX`, `scaleY`, `anchorX`, `anchorY` | `vertex`                                    |
| `texture` (frame swap)                   | `uvs` (plus `vertex` if frame sizes differ) |
| `tint`, `alpha` (`color`)                | `color`                                     |

The keys are `vertex` and `color`; v7's `vertices`/`scale` and `tint`/`alpha` keys are not read (an unknown key is silently ignored at runtime), so a v7-style `{ tint: true }` leaves colour static and per-frame fades never show.

```ts
// One-off change to a static property: change it, then update() once.
declare const container: ParticleContainer<Particle>;
container.particleChildren.forEach((p) => (p.tint = 0x00ff00));
container.update();

// Per-frame fade: make color dynamic instead.
const sparks = new ParticleContainer<Particle>({ texture: tex, dynamicProperties: { color: true } });
app.ticker.add(() => {
  for (const p of sparks.particleChildren) p.alpha = Math.max(0, p.alpha - 0.01);
});
```

## Adding and removing

`addParticle(...list)` and `removeParticles(begin, end)` flag the container once per call. After editing `particleChildren` directly (push, splice, reassign, `length = 0`), call `update()`, or the static data (size, UVs, colour) of the changed slots is never uploaded and those particles draw wrong or not at all. Spreading very large arrays (~100k+) into one call can overflow the call stack; add in chunks.

Every add or remove re-uploads the static data of all particles on the next render, and `removeParticle` is an `indexOf` + `splice` per particle. For an emitter that spawns and expires particles every frame, keep a fixed pool and recycle expired particles (reset their position, and their `alpha` with `color` dynamic) instead of removing and re-adding them.

## Bounds and hit testing

`ParticleContainer` reports empty bounds `(0, 0, 0, 0)`, so without `boundsArea` it is culled when culling is active, `getBounds()` is empty, and filters on it are skipped (`filterArea` also works for filters). `boundsArea` does **not** make it hit-testable: `containsPoint` ignores it. For pointer events set `hitArea` and `eventMode`:

```ts
const area = new Rectangle(0, 0, 800, 600);
const particles = new ParticleContainer({ boundsArea: area });
particles.hitArea = area;
particles.eventMode = "static";
```

Particles have no events of their own: events fire on the container; work out which particle was hit from `e.getLocalPosition(container)`.

## Whole-system alpha, tint and blend mode

`alpha` and `tint` on the container or any ancestor multiply into every particle, on top of each particle's own `alpha`/`tint`, so `burst.tint = 0x66ccff` or fading a parent `Container` recolours or fades the whole system without touching `particleChildren`. There are no per-particle filters, masks or blend modes: the whole batch shares one `blendMode`, set on the `ParticleContainer` or inherited from a parent (the default `"inherit"` resolves to the ancestor's blend mode, like `Sprite` and `Mesh`).

## Custom shader

`shader` replaces the default particle shader with any `Shader`. The pipe always binds all five attributes (`aVertex`, `aPosition`, `aRotation`, `aUV`, `aColor`) and fills the uniforms `uTranslationMatrix`, `uColor`, `uRound`, `uResolution` and the texture `uTexture`/`uSampler`; start from `ParticleShader` as the template.
