# Progress Tracking

`Assets.load` and `Assets.loadBundle` accept a progress callback that fires as each asset completes. Use it to drive loading bars, percentage readouts, or spinner state updates during long loads. The progress value is normalized `[0, 1]` across the entire call.

## Quick Start

```ts
const loadingBar = new Graphics();
app.stage.addChild(loadingBar);

await Assets.load(["hero.png", "enemy.png", "map.json"], (progress) => {
  loadingBar.clear();
  loadingBar.rect(0, 0, progress * 400, 20).fill(0x66ccff);
});
```

The callback is invoked after each asset resolves. Final invocation reaches `1.0` just before the promise resolves.

## Core Patterns

### Progress on a single asset

```ts
await Assets.load("large-atlas.json", (progress) => {
  console.log(`${Math.round(progress * 100)}%`);
});
```

Even for a single asset, the callback fires (typically once, reaching `1.0`). For most cases, progress for a single call is not useful; prefer progress on bundles or arrays.

### Progress on an array

```ts
const assets = await Assets.load(
  ["hero.png", "enemy.png", "map.json", "music.mp3"],
  (progress) => updateBar(progress),
);
```

Progress is distributed evenly across the N assets. When the third asset in a four-asset array finishes, progress is `0.75`.

### Progress on a bundle

```ts
await Assets.loadBundle("level1", (progress) => {
  loadingText.text = `Loading… ${Math.round(progress * 100)}%`;
});
```

Each asset in the bundle contributes equally. If the bundle has 10 entries, each contributes `0.1` to the total.

### Progress via `LoadOptions.onProgress`

```ts
await Assets.load("game.json", {
  onProgress: (progress) => updateBar(progress),
  onError: (err, asset) => {
    const src = typeof asset === "string" ? asset : asset.src;
    console.warn("failed:", src, err);
  },
});
```

Instead of a callback as the second argument, pass a `LoadOptions` object. This is the preferred form when you also need error handling or retry strategies. Note that `onError` receives `string | ResolvedAsset`; guard before accessing `.src`.

### Global progress across multiple loads

```ts
async function loadAllWithTotal(tasks: Array<() => Promise<any>>) {
  let done = 0;
  for (const task of tasks) {
    await task();
    done++;
    updateBar(done / tasks.length);
  }
}

await loadAllWithTotal([
  () => Assets.load("menu.json"),
  () => Assets.loadBundle("level1"),
  () => Assets.loadBundle("sounds"),
]);
```

Progress callbacks are scoped per call. If you need a single bar across several sequential loads, wrap the calls manually and count completions yourself.

## Common Mistakes

### [HIGH] Treating progress callback as completion

Wrong:

```ts
Assets.load("hero.png", (progress) => {
  if (progress === 1) {
    showHero();
  }
});
```

Correct:

```ts
await Assets.load("hero.png", (progress) => updateBar(progress));
showHero();
```

`progress === 1` may fire slightly before the returned promise resolves. Always use the `await` or `.then()` to know when loading is truly complete. The progress callback is for UI updates only.


### [MEDIUM] Progress not updating smoothly

Each asset contributes a discrete step. If your bundle has three assets, progress jumps `0 -> 0.33 -> 0.66 -> 1.0`. For a smoother bar, split large bundles into smaller ones, or animate the bar width toward the target value:

```ts
let target = 0;
await Assets.loadBundle("game", (p) => {
  target = p;
});

app.ticker.add(() => {
  loadingBar.width += (target * maxWidth - loadingBar.width) * 0.1;
});
```


### [MEDIUM] Progress via background loading

Wrong:

```ts
Assets.backgroundLoadBundle("game", (p) => updateBar(p));
```

Background loading has no progress callback. For visible progress, use `Assets.loadBundle` (foreground). See `references/background.md`.


## API Reference

- [Assets](https://pixijs.download/release/docs/assets.Assets.html.md)
- [LoadOptions](https://pixijs.download/release/docs/assets.LoadOptions.html.md)
- [ProgressCallback](https://pixijs.download/release/docs/assets.ProgressCallback.html.md)
