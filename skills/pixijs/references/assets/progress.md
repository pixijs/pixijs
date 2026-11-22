# Progress tracking

Progress callbacks on `Assets.load` and `Assets.loadBundle` for loading bars.

```ts
import { Assets, Graphics } from "pixi.js";

declare const loadingBar: Graphics;
declare function showGame(): void;

await Assets.loadBundle("level1", (progress) => {
  loadingBar.clear().rect(0, 0, progress * 400, 20).fill(0x66ccff);
});
showGame();
```

- `Assets.load(urls, onProgress)` takes the callback as its second argument, or inside `LoadOptions` as `{ onProgress, onError, strategy }` ([assets](../assets.md#load-options-and-error-handling)). `Assets.loadBundle(name, onProgress)` takes only the function.
- The value is normalized `[0, 1]` across the whole call and fires after each asset resolves; every asset contributes an equal step (the third of four → `0.75`), so a three-asset bundle jumps `0 → 0.33 → 0.66 → 1`. Animate the bar toward the target for a smoother look. A single asset typically reports once, at `1`.
- `progress === 1` can fire slightly before the promise resolves. Treat the callback as UI only and continue after `await`.
- Progress is scoped per call; for one bar across several sequential loads, count completions yourself.
- Background loading reports no progress ([background](background.md)).
