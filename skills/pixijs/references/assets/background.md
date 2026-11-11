# Background loading

`Assets.backgroundLoad` and `backgroundLoadBundle`: priming assets you will need soon without blocking.

```ts
import { Assets } from "pixi.js";

declare function showMenu(): void;
declare function startLevel(): void;

await Assets.loadBundle("menu");
showMenu();

Assets.backgroundLoadBundle("level1");

async function onStartClicked() {
  await Assets.loadBundle("level1");
  startLevel();
}
```

- Both calls return immediately (fire-and-forget) and queue assets one at a time, sequentially. `backgroundLoad` takes a URL, alias or array; `backgroundLoadBundle` needs a bundle already registered via a manifest or `addBundle`.
- An explicit `Assets.load()` or `Assets.loadBundle()` interrupts background loading safely: the current background asset finishes, then the explicit load takes priority. For an asset already in flight, the explicit load resolves immediately if background work finished, or waits for the in-progress load.
- Background loading is best-effort: always `await` the foreground `load`/`loadBundle` before using the assets.
- There is no progress callback; `backgroundLoadBundle("level2", onProgress)` reports nothing. For a visible bar, load in the foreground with `onProgress` ([progress](progress.md)).
