# AnimatedSprite

`AnimatedSprite` frame animation: options and their defaults, speed units, swapping animations, one-shot replay, ticker, per-frame timing and the cache-only factories.

```ts
import { AnimatedSprite, Assets, type Spritesheet } from "pixi.js";

const sheet = await Assets.load<Spritesheet>("character.json");

const walk = new AnimatedSprite({
  textures: sheet.animations["walk"],
  animationSpeed: 12 / 60,
  autoPlay: true,
  anchor: 0.5,
});
```

Load the spritesheet first and take frames from `sheet.animations[key]`. `Texture.from(name)` on an unloaded frame returns `undefined` (with a "not found in the Cache" warning) and the `AnimatedSprite` constructor throws "Cannot read properties of undefined (reading 'texture')"; unlike `Sprite`, it does not fall back to `Texture.EMPTY`.

## Options

Two constructor forms: `new AnimatedSprite(frames, autoUpdate?)` and `new AnimatedSprite({ textures, ...options })`. The options form also takes every `SpriteOptions` field except `texture`.

| Option           | Default | Notes |
| ---------------- | ------- | ----- |
| `textures`       | —       | Required. A `Texture[]`, or `FrameObject[]` (`{ texture, time }`, `time` in **milliseconds**; `0.1` flips frames almost instantly). |
| `animationSpeed` | `1`     | For `Texture[]`: frames advanced per 60 fps tick, scaled by `ticker.deltaTime`. `1` is 60 frames per second, far too fast for most art; N fps is `N / 60` (12 fps → `0.2`). For `FrameObject[]`: a multiplier on each frame's `time`. Negative reverses. |
| `autoPlay`       | `false` | Without it or a `play()` call, only the first frame shows. |
| `autoUpdate`     | `true`  | Plays on `Ticker.shared`, not `app.ticker`, so `app.ticker.stop()` does not pause it. Set `false` and call `sprite.update(ticker)` from `app.ticker`, a custom ticker or game logic. |
| `loop`           | `true`  | `false` for one-shots; then `onComplete` fires at the end. |
| `onComplete`, `onFrameChange(currentFrame)`, `onLoop` | `null` | End of a non-looping run; every displayed-texture change; each wrap of a looping run. |
| `updateAnchor`   | `false` | Copies the current texture's `defaultAnchor` onto the sprite's anchor on every frame change (per-frame pivots, e.g. pinning to a foot), overriding any anchor you set. |

`play()`, `stop()`, `gotoAndStop(i)`, `gotoAndPlay(i)`; `totalFrames` and `playing` are readonly. The `currentFrame` setter throws outside `[0, totalFrames - 1]`, so the last frame is `totalFrames - 1`.

## Switching animations

```ts
import { AnimatedSprite, Spritesheet } from "pixi.js";

declare const hero: AnimatedSprite;
declare const sheet: Spritesheet;

hero.textures = sheet.animations["run"];
hero.play();
```

Assigning `textures` stops playback and jumps to frame 0, even when `autoPlay` was set; the sprite freezes on the first frame of the new animation unless you call `play()` after each swap.

## Replaying a one-shot

A finished one-shot stays on its last frame, and `play()` resumes from there: it only re-fires `onComplete` on the next tick without replaying. Replay with `gotoAndPlay(0)` (`GifSprite.play()`, by contrast, does rewind). When a pooled effect is done, `destroy()` it without `true`: `destroy(true)` destroys every frame texture and the shared atlas (see [scene-container](../scene-container.md#destroy)).

## Per-frame timing from a spritesheet

Spritesheets loaded via `Assets.load` expose per-frame `duration` values at `sheet.data.frames[key].duration` (Aseprite exports carry it; the `SpritesheetFrameData` type does not declare it). Build a `FrameObject[]` from them for pre-authored timing:

```ts
import { AnimatedSprite, Assets, Texture, type FrameObject } from "pixi.js";

const sheet = await Assets.load("0123456789.json");
const frames: FrameObject[] = [];
for (let i = 0; i < 10; i++) {
  const key = `0123456789 ${i}.ase`;
  frames.push({ texture: Texture.from(key), time: sheet.data.frames[key].duration });
}
const sprite = new AnimatedSprite(frames);
```

## Factories

- `AnimatedSprite.fromFrames(aliases)` builds textures via `Texture.from` from cached frame names; the spritesheet must already be loaded.
- `AnimatedSprite.fromImages(urls)` does the same for image URLs (`Texture.from(url)` per entry). It fetches nothing: `await Assets.load(urls)` first, or the constructor throws "Cannot read properties of undefined (reading 'texture')".
