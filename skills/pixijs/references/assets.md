# assets

The `Assets` singleton: init order, load result shapes, parsers and extension-less URLs, `LoadOptions` and errors, per-asset `data`, preferences and fetch routing, and which sub-page covers each format.

## Init order

```ts
import { Application, Assets, Sprite, Texture } from "pixi.js";

declare const app: Application;

await Assets.init({ basePath: "/static/", manifest: "manifest.json" });

const texture = await Assets.load<Texture>("bunny.png");
app.stage.addChild(new Sprite(texture));

const loaded = await Assets.load<Texture>(["hero.png", "enemy.png"]);
const hero = loaded["hero.png"];

Assets.add({ alias: "logo", src: "logo.webp" });
await Assets.load("logo");
const logo = new Sprite(Assets.get("logo"));
```

`Assets.init()` is optional, runs once, and must be awaited before any `load`, `loadBundle`, `backgroundLoad` or `unload`, because those call `init()` themselves when it has not run. A later `Assets.init({...})` only logs "AssetManager already initialized" and drops every option: `basePath` is not applied and the manifest's bundles are never registered (`loadBundle` of an unregistered name resolves `undefined` without an error). Put `basePath`, `manifest` and preferences in that one first call; afterwards change preferences with `Assets.setPreferences` and add bundles with `Assets.addBundle`.

## Load results and keys

- `Assets.load([...])` resolves to an object keyed by each requested URL or alias, never an array: `const [a, b] = await Assets.load([...])` fails tsc (TS2488) and throws "is not iterable". Read entries by key, or use `Object.values(result)`.
- A bare URL is cached under that exact string only. Register a short name with `Assets.add({ alias: "hero", src: "hero.png" })` before loading if you want `Assets.get("hero")`. v7's positional `Assets.add("bunny", "bunny.png")` was removed; use the options object.
- `Texture.from(url)` and `Sprite.from(url)` no longer fetch in v8; they read the cache that `Assets.load` fills ([scene-sprite](scene-sprite.md#loading-before-creating)).
- `Assets.load()` caches until you unload. Between levels or screens, release with `Assets.unload` / `Assets.unloadBundle` ([caching](assets/caching.md)).

## Supported file types

| Type                | Extensions                                                       | Parser ID                     | Loader | Notes |
| ------------------- | ---------------------------------------------------------------- | ----------------------------- | ------ | ----- |
| Textures            | `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`                        | `texture`                     | `loadTextures` | |
| SVG                 | `.svg`                                                           | `svg`                         | `loadSvg` | Texture or `GraphicsContext` ([svg](assets/svg.md)) |
| Video textures      | `.mp4`, `.m4v`, `.webm`, `.ogg`, `.ogv`, `.h264`, `.avi`, `.mov` | `video`                       | `loadVideoTextures` | [video](assets/video.md) |
| Sprite sheets       | `.json` (Spritesheet format)                                     | `spritesheet`                 | `spritesheetAsset` | [spritesheet](assets/spritesheet.md) |
| Bitmap fonts        | `.fnt`, `.xml`                                                   | `bitmap-font`                 | `loadBitmapFont` | Registered by default ([fonts](assets/fonts.md)) |
| Web fonts           | `.ttf`, `.otf`, `.woff`, `.woff2`                                | `web-font`                    | `loadWebFont` | [fonts](assets/fonts.md) |
| JSON                | `.json`                                                          | `json`                        | `loadJson` | |
| Text                | `.txt`                                                           | `text`                        | `loadTxt` | |
| Compressed textures | `.basis`, `.dds`, `.ktx`, `.ktx2`                                | `basis`, `dds`, `ktx`, `ktx2` | | Each needs its side-effect import ([compressed-textures](assets/compressed-textures.md)) |
| Animated GIFs       | `.gif`                                                           | `gif`                         | | Needs `import 'pixi.js/gif'`; returns a `GifSource` ([scene-gif](scene-gif.md)) |

There is no audio loader: `.mp3`/`.wav`/`.ogg` audio resolves `null` (`.ogg` is tried as video). Use `@pixi/sound` or another audio library.

## Forcing a parser with `parser`

The loader picks a parser by testing the URL string only: the extension of the path before `?` (`photo.png?v=3` works), or the MIME type of a `data:` URL. The server's `Content-Type` is never consulted. A URL no parser recognises (`https://cdn.example.com/image?id=42`, any `blob:` URL from `URL.createObjectURL`, `/api/assets/hero`, a content-hashed path with no suffix) is not fetched at all: `Assets.load` logs `[Assets] <url> could not be loaded as we don't know how to parse it, ensure the correct parser has been added` and resolves `null`. It does not throw and `onError` does not fire, so the failure surfaces later as a null texture. Set the top-level `parser` field (beside `src` and `data`, not inside `data`) to a Parser ID from the table:

```ts
import { Assets, Texture } from "pixi.js";

declare const blob: Blob;

const texture = await Assets.load<Texture>({ src: URL.createObjectURL(blob), parser: "texture" });

const config = await Assets.load({ alias: "config", src: "https://api.example.com/v1/config", parser: "json" });

const clip = await Assets.load<Texture>({
  src: "https://cdn.example.com/stream/xyz",
  parser: "video",
  data: { mime: "video/mp4" },
});
```

A URL with a recognised extension needs no `parser`. v7's `loadParser` field still works with the loader's name (`loadParser: "loadTextures"`) but logs a deprecation warning; use `parser: "texture"`.

## Load options and error handling

Two separate option sets:

1. **`LoadOptions`**: the second argument to `Assets.load` only. Controls error recovery, retries and progress across the whole call. `Assets.loadBundle(ids, onProgress)` takes only a progress function; passing an options object there throws "onProgress is not a function". Set bundle strategy and retries through `Assets.init({ loadOptions })` or `Loader.defaultOptions`.
2. **`data`**: a field on each asset descriptor, forwarded to that asset's parser.

```ts
import { Assets } from "pixi.js";

declare function updateBar(p: number): void;

await Assets.load(["hero.png", "enemy.png"], {
  onProgress: (p) => updateBar(p),
  onError: (err, url) => {
    const src = typeof url === "string" ? url : url.src;
    console.warn("failed:", src, err);
  },
  strategy: "retry",
  retryCount: 3,
  retryDelay: 250,
});
```

- `onProgress(progress)`: `[0, 1]` as assets in the call complete.
- `onError(error, url)`: typed `string | ResolvedAsset`, but the loader always passes the `ResolvedAsset`; the guard above keeps TypeScript happy.
- `strategy: 'throw' | 'skip' | 'retry'`, default `'throw'`. `'skip'` calls `onError` once and resolves without the failed asset (`undefined` for a single URL, key missing from the record for an array). `'retry'` reattempts the failed ones.
- `retryCount`, default `3`: retries per asset under `'retry'`, so an asset that keeps failing is attempted `retryCount + 1` times. `onError` fires after **every** failed attempt (not once at the end), then the call rejects as with `'throw'`. Count failures yourself to report only the final one.
- `retryDelay`, default `250` ms between retries.

Global defaults live on `Loader.defaultOptions`, or pass `loadOptions` to `Assets.init()`.

### `data` per asset

| Asset type         | `data` shape | Key options |
| ------------------ | ------------ | ----------- |
| Texture (image)    | `TextureSourceOptions` | `resolution`, `scaleMode`, `alphaMode`, `autoGenerateMipmaps`, `antialias`, `addressMode` |
| SVG                | `{ parseAsGraphicsContext?, resolution? }` | Graphics mode; sharper raster |
| Video              | `VideoSourceOptions` | `autoPlay`, `loop`, `muted`, `playsinline`, `preload`, `updateFPS`, `crossorigin`, `mime` |
| Web font           | `LoadFontData` | `family`, `weights`, `style`, `display`, `unicodeRange`, `featureSettings` |
| Bitmap font        | none | Distance-field detection sets scale mode and mipmaps |
| Spritesheet        | `{ texture?, imageFilename?, ignoreMultiPack?, textureOptions?, cachePrefix? }` | `textureOptions` forwards `TextureSourceOptions` (e.g. `scaleMode`) to the atlas image; `texture` skips the image load; `imageFilename` overrides the referenced image; `ignoreMultiPack` skips multi-pack follow-ups; `cachePrefix` namespaces frame keys |
| GIF                | `GifBufferOptions` | `fps`, `scaleMode`, `resolution`, `autoGenerateMipmaps` |
| Compressed texture | `TextureSourceOptions` | `scaleMode`, `addressMode`, `autoGenerateMipmaps` |
| JSON / Text        | none | Returned as-is |

`data` applies only to the first load of a `src`. A later `Assets.load` of the same URL, under any alias and with different `data`, returns the cached asset built with the first options. Change a loaded texture's sampling on the result (`texture.source.scaleMode = "nearest"`), or `await Assets.unload(src)` before loading it with new `data`. Manifest and bundle entries carry `data` the same way.

## Init options, preferences and fetch routing

`Assets.init(options)` accepts, alongside `basePath`, `manifest` and `texturePreference` ([resolution](assets/resolution.md)):

- `defaultSearchParams`: string or `Record<string, any>` appended to every resolved URL (cache busting).
- `skipDetections: boolean`: skip browser format detection and treat every registered format (avif, webp, ...) as supported. Set `texturePreference.format` to the formats you actually ship, or the resolver may pick avif on a browser that can't decode it.
- `bundleIdentifier: BundleIdentifierOptions`: customise how bundle keys resolve so the same alias can live in several bundles.
- `loadOptions: Partial<LoadOptions>`: default `strategy`, `retryCount`, `retryDelay` and callbacks for every later `Assets.load`.
- `preferences: Partial<AssetsPreferences>`: `crossOrigin`, `preferWorkers`, `preferCreateImageBitmap`, `parseAsGraphicsContext`.

After init, `Assets.setPreferences({ crossOrigin: "anonymous", preferCreateImageBitmap: false })` pushes new preferences to every parser that supports them. `Assets.detections` lists the registered `FormatDetectionParser`s. `Assets.reset()` fully resets resolver, loader and cache; it is meant for tests, so a fresh `Assets.init` can run.

How an image (png/jpg/webp/avif) is fetched depends on these preferences:

| Preferences | Image request goes through |
| --- | --- |
| defaults (`preferWorkers: true`, `preferCreateImageBitmap: true`) | a Web Worker's own global `fetch`; `DOMAdapter.fetch`, a custom adapter and a patched `window.fetch` never see it |
| `preferWorkers: false` | `DOMAdapter.get().fetch(url)` on the main thread, then `createImageBitmap` |
| `preferCreateImageBitmap: false` | an `<img>` from `DOMAdapter.get().createImage()`, no fetch; `crossOrigin` applies only here |

To route image loads through a custom `DOMAdapter.fetch` (auth headers, request logging, offline cache), set `preferWorkers: false`. JSON, text, SVG, bitmap-font and GIF loads always use `DOMAdapter.get().fetch`.

## Sub-pages

| Read when                                                   | Sub-page |
| ----------------------------------------------------------- | -------- |
| Grouping assets per level or screen (`addBundle`, `loadBundle`, `unloadBundle`) | [bundles](assets/bundles.md) |
| Declaring all bundles up front in `Assets.init({ manifest })` | [manifests](assets/manifests.md) |
| `Assets.get`, `Assets.unload`, `Cache`, freeing memory between levels | [caching](assets/caching.md) |
| Preloading the next level (`backgroundLoad`, `backgroundLoadBundle`) | [background](assets/background.md) |
| Loading bars (`onProgress`)                                 | [progress](assets/progress.md) |
| Texture atlases, `Spritesheet`, `meta.scale`                | [spritesheet](assets/spritesheet.md) |
| Web fonts and bitmap fonts                                  | [fonts](assets/fonts.md) |
| Video textures, autoplay, sound                             | [video](assets/video.md) |
| SVG as texture or `Graphics`                                | [svg](assets/svg.md) |
| `.ktx2`, `.basis`, `.dds`, `.ktx`                           | [compressed-textures](assets/compressed-textures.md) |
| `@2x` files, `texturePreference`, format fallbacks          | [resolution](assets/resolution.md) |
| Animated GIFs                                               | [scene-gif](scene-gif.md) |
