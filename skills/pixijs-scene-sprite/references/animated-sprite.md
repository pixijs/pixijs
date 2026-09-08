# AnimatedSprite

A `Sprite` subclass that cycles through an array of textures for frame-based animation. Use for character walk cycles, explosions, UI icon loops, or any sequence driven by pre-rendered frames from a spritesheet.

## Quick Start

```ts
const sheet = await Assets.load("character.json");

const walk = new AnimatedSprite({
  textures: sheet.animations["walk"],
  animationSpeed: 0.15,
  loop: true,
  autoPlay: true,
});

app.stage.addChild(walk);
```

`AnimatedSprite` extends `Sprite`, so anchor, tint, position, and scale all work the same way. It adds frame playback on top. Inherits `allowChildren = false` from `Sprite`.

## Core Patterns

### Construction

```ts
new AnimatedSprite(frames, autoUpdate?);
new AnimatedSprite({ textures, autoUpdate, autoPlay, loop, animationSpeed });
```

Two constructor forms are supported. The options form accepts all `SpriteOptions` (anchor, tint, position, etc.) plus the animation-specific fields below. The positional form takes a frames array and an optional `autoUpdate` flag.

```ts
const sheet = await Assets.load("character.json");

const walk = new AnimatedSprite({
  textures: sheet.animations["walk"],
  animationSpeed: 0.2,
  loop: true,
  autoPlay: true,
  anchor: 0.5,
  x: 200,
  y: 300,
});
```

#### AnimatedSpriteOptions

| Option           | Type                             | Default | Description                                                                                                       |
| ---------------- | -------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `textures`       | `AnimatedSpriteFrames`           | —       | Frame list: a `Texture[]` or `FrameObject[]` (each `{ texture, time }` with `time` in ms). Required.              |
| `animationSpeed` | `number`                         | `1`     | Playback multiplier; negative values reverse direction.                                                           |
| `autoPlay`       | `boolean`                        | `false` | Start playback immediately on construction.                                                                       |
| `autoUpdate`     | `boolean`                        | `true`  | Drive playback from `Ticker.shared`; set `false` to call `update(ticker)` manually.                               |
| `loop`           | `boolean`                        | `true`  | Restart after the last frame; set `false` for one-shot animations.                                                |
| `onComplete`     | `() => void`                     | `null`  | Fires when a non-looping animation reaches its end.                                                               |
| `onFrameChange`  | `(currentFrame: number) => void` | `null`  | Fires every time the displayed texture changes.                                                                   |
| `onLoop`         | `() => void`                     | `null`  | Fires when a looping animation wraps back to the start.                                                           |
| `updateAnchor`   | `boolean`                        | `false` | Copy `texture.defaultAnchor` onto the sprite's anchor on every frame change. Overrides any previously set anchor. |

Also inherits `SpriteOptions` minus `texture` (use `textures` for frames) — see `sprite.md`. All `Container` options (`position`, `scale`, `tint`, `label`, `filters`, `zIndex`, etc.) are also valid here — see `skills/pixijs-scene-core-concepts/references/constructor-options.md`.

### Playback control

```ts
walk.play();
walk.stop();
walk.gotoAndStop(3);
walk.gotoAndPlay(0);

walk.currentFrame = 2;
console.log(walk.totalFrames);
console.log(walk.playing);
```

- `play()` / `stop()`: start or freeze playback at the current frame.
- `gotoAndStop(frame)` / `gotoAndPlay(frame)`: jump to a specific frame index.
- `currentFrame`: readable and writable. The setter throws if the value is outside `[0, totalFrames - 1]`.
- `totalFrames` (readonly): number of frames in the current texture list.
- `playing` (readonly): current playback state.

### Speed and looping

```ts
walk.animationSpeed = 0.15;
walk.animationSpeed = -1;
walk.loop = false;
```

- `animationSpeed` (default `1`): playback multiplier. Negative reverses direction.
- `loop` (default `true`): restart after last frame. Set to `false` and use `onComplete` for one-shot animations.

### Callbacks

```ts
walk.onComplete = () => console.log("animation done");
walk.onFrameChange = (frame) => console.log(`now on frame ${frame}`);
walk.onLoop = () => console.log("looped back to start");
```

- `onComplete`: fires when a non-looping animation reaches its end.
- `onFrameChange(frameIndex)`: fires every time the displayed texture changes.
- `onLoop`: fires when a looping animation wraps around to the start.

### Auto update

```ts
const walk = new AnimatedSprite({
  textures: sheet.animations["walk"],
  autoUpdate: false,
});

app.ticker.add((ticker) => {
  walk.update(ticker);
});
```

`autoUpdate` (default `true`): uses `Ticker.shared`. Set `false` and call `update(ticker)` manually to drive playback from a custom ticker or pause it with game logic.

### Per-frame timing

```ts
const explosion = new AnimatedSprite({
  textures: [
    { texture: frame0, time: 100 },
    { texture: frame1, time: 200 },
    { texture: frame2, time: 300 },
  ],
});
```

`FrameObject` entries use `{ texture, time }` where `time` is in **milliseconds**, not seconds. Mix per-frame timing for effects that linger on key frames (impact, reveal, pause).

Spritesheets loaded via `Assets.load` expose per-frame `duration` values at `sheet.data.frames[key].duration`. Build a `FrameObject[]` from those durations when you need pre-authored timing:

```ts
const sheet = await Assets.load("0123456789.json");
const frames = [];
for (let i = 0; i < 10; i++) {
  const key = `0123456789 ${i}.ase`;
  frames.push({
    texture: Texture.from(key),
    time: sheet.data.frames[key].duration,
  });
}
const sprite = new AnimatedSprite(frames);
```

### Factories

```ts
const walk = AnimatedSprite.fromFrames(["walk0.png", "walk1.png", "walk2.png"]);
const idle = AnimatedSprite.fromImages(["idle0.png", "idle1.png"]);
```

- `fromFrames(aliases)`: builds textures via `Texture.from` from Assets cache aliases. Requires the spritesheet to already be loaded.
- `fromImages(urls)`: builds textures from URLs. Does not await loading; textures resolve asynchronously.

Prefer `new AnimatedSprite({ textures: sheet.animations[...] })` after `await Assets.load(...)` for deterministic loading.

### updateAnchor

```ts
const walk = new AnimatedSprite({
  textures: sheet.animations["walk"],
  updateAnchor: true,
});
```

`updateAnchor` (default `false`): when `true`, the sprite's anchor is copied from the current texture's `defaultAnchor` on every frame change. Useful when exporting frames with per-frame pivot points (e.g., to pin the animation to a moving foot or hand). Overrides any previously set anchor on each frame change.

## Common Mistakes

### [HIGH] Using `Texture.from` on unloaded frames

Wrong:

```ts
const walk = new AnimatedSprite([
  Texture.from("walk0.png"),
  Texture.from("walk1.png"),
]);
```

Correct:

```ts
const sheet = await Assets.load("character.json");
const walk = new AnimatedSprite(sheet.animations["walk"]);
```

`Texture.from()` only reads the cache in v8. If the spritesheet has not been loaded, the textures resolve to `Texture.EMPTY` and the sprite shows nothing. Always `await Assets.load()` the spritesheet first, then use `sheet.animations[key]`.


### [HIGH] Forgetting to call `play()` or set `autoPlay`

Wrong:

```ts
const walk = new AnimatedSprite({ textures: sheet.animations["walk"] });
app.stage.addChild(walk);
```

Correct:

```ts
const walk = new AnimatedSprite({
  textures: sheet.animations["walk"],
  autoPlay: true,
});
app.stage.addChild(walk);
```

`autoPlay` defaults to `false`. Without `autoPlay: true` or a manual `walk.play()` call, the sprite displays only the first frame.


### [MEDIUM] Using seconds instead of milliseconds for `FrameObject.time`

Wrong:

```ts
new AnimatedSprite([
  { texture: frame0, time: 0.1 },
  { texture: frame1, time: 0.2 },
]);
```

Correct:

```ts
new AnimatedSprite([
  { texture: frame0, time: 100 },
  { texture: frame1, time: 200 },
]);
```

`FrameObject.time` is in milliseconds. A value of `0.1` will advance frames almost instantly.


### [MEDIUM] Setting `currentFrame` out of range

Wrong:

```ts
walk.currentFrame = walk.totalFrames;
```

Correct:

```ts
walk.currentFrame = walk.totalFrames - 1;
```

The setter throws if the value is outside `[0, totalFrames - 1]`. Use `totalFrames - 1` for the last frame.


## API Reference

- [AnimatedSprite](https://pixijs.download/release/docs/scene.AnimatedSprite.html.md)
- [AnimatedSpriteOptions](https://pixijs.download/release/docs/scene.AnimatedSpriteOptions.html.md)
- [FrameObject](https://pixijs.download/release/docs/scene.FrameObject.html.md)
- [Spritesheet](https://pixijs.download/release/docs/assets.Spritesheet.html.md)
