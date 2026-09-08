---
name: pixijs-assets
description: "Use this skill when loading and managing resources in PixiJS v8. Covers Assets.init, Assets.load/add/unload, bundles, manifests, background loading, onProgress, caching, spritesheets, video textures, web fonts, bitmap fonts, animated GIFs, compressed textures, SVG as texture or Graphics, resolution detection, per-asset data options, and forcing a specific loader with the parser field (for extension-less URLs). Triggers on: Assets, Assets.load, Assets.init, loadBundle, manifest, backgroundLoad, Spritesheet, Cache, LoadOptions, unload, parser, loadParser, loadWebFont, loadBitmapFont, loadVideoTextures, GifSource, VideoSourceOptions."
license: MIT
---

The `Assets` API is PixiJS's asset loader, resolver, and cache in one singleton. Use it to load textures, video, spritesheets, fonts, JSON, and other resources with format detection, resolution switching, bundle grouping, progress tracking, and GPU cleanup.

## Quick Start

```ts
await Assets.init({ basePath: "/static/" });

const texture = await Assets.load("bunny.png");
const sprite = new Sprite(texture);
app.stage.addChild(sprite);

const [hero, enemy] = await Assets.load(["hero.png", "enemy.png"]);

await Assets.load({
  alias: "logo",
  src: "logo.webp",
});

const logo = new Sprite(Assets.get("logo"));
```

`Assets.init()` is optional but recommended for setting `basePath`, `texturePreference`, or a manifest. After init, call `Assets.load()` with a URL, alias, array, or `UnresolvedAsset`; resolved assets are cached and re-resolved by `Assets.get()`.

## Supported file types

| Type                | Extensions                                                       | Parser ID                     | Loader                                                                                                                          |
| ------------------- | ---------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Textures            | `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`                        | `texture`                     | `loadTextures`                                                                                                                  |
| SVG                 | `.svg`                                                           | `svg`                         | `loadSvg` (see `references/svg.md`)                                                                                             |
| Video textures      | `.mp4`, `.m4v`, `.webm`, `.ogg`, `.ogv`, `.h264`, `.avi`, `.mov` | `video`                       | `loadVideoTextures` (see `references/video.md`)                                                                                 |
| Sprite sheets       | `.json` (Spritesheet format)                                     | `spritesheet`                 | `spritesheetAsset` (see `references/spritesheet.md`)                                                                            |
| Bitmap fonts        | `.fnt`, `.xml`                                                   | `bitmap-font`                 | `loadBitmapFont` (loading works by default; rendering `BitmapText` requires `'pixi.js/text-bitmap'`; see `references/fonts.md`) |
| Web fonts           | `.ttf`, `.otf`, `.woff`, `.woff2`                                | `web-font`                    | `loadWebFont` (see `references/fonts.md`)                                                                                       |
| JSON                | `.json`                                                          | `json`                        | `loadJson`                                                                                                                      |
| Text                | `.txt`                                                           | `text`                        | `loadTxt`                                                                                                                       |
| Compressed textures | `.basis`, `.dds`, `.ktx`, `.ktx2`                                | `basis`, `dds`, `ktx`, `ktx2` | See `references/compressed-textures.md`                                                                                         |
| Animated GIFs       | `.gif`                                                           | `gif`                         | Requires `'pixi.js/gif'`; returns `GifSource` (see `references/gif.md`)                                                         |

The **Parser ID** column is the value you pass to the top-level `parser` field on an asset descriptor to force a specific loader. See "Forcing a parser" below.

## Forcing a parser with `parser`

By default, PixiJS picks a loader by matching the file extension or MIME type. When your URL lacks an extension (CDN signed URLs, blob URLs, API endpoints, content-hashed paths), the resolver can't tell the loader what to do. Set the top-level `parser` field on the asset descriptor to force a specific loader:

```ts
// Signed CDN URL with no extension
const texture = await Assets.load({
  src: "https://cdn.example.com/signed/abc123?token=xyz",
  parser: "texture",
});

// API endpoint that returns JSON
const data = await Assets.load({
  alias: "config",
  src: "https://api.example.com/v1/config",
  parser: "json",
});

// Extension-less font URL with explicit family
await Assets.load({
  src: "https://cdn.example.com/fonts/hero-v2",
  parser: "web-font",
  data: { family: "Hero", weights: ["400", "700"] },
});

// Video stream without a file extension
const clipTexture = await Assets.load({
  src: "https://cdn.example.com/stream/xyz",
  parser: "video",
  data: { mime: "video/mp4", muted: true, playsinline: true },
});
```

The `parser` field goes at the top level of the asset descriptor (alongside `src` and `data`), not inside `data`. It takes any parser ID from the "Supported file types" table above:

- `'texture'`, `'svg'`, `'video'`: image, SVG, and video textures
- `'json'`, `'text'`: JSON and plain text
- `'web-font'`, `'bitmap-font'`: web and bitmap fonts
- `'spritesheet'`: texture atlas JSON
- `'gif'`: animated GIFs (requires `'pixi.js/gif'`)
- `'basis'`, `'dds'`, `'ktx'`, `'ktx2'`: compressed textures (each requires its side-effect import)

### When you need it

- **Signed CDN URLs**: `https://cdn.example.com/get?id=abc123` has no extension the loader can test against.
- **Blob or ObjectURL**: `URL.createObjectURL(blob)` produces `blob:...` URLs with no extension.
- **Custom routing**: `/api/assets/hero-v2` where the server decides the content type.
- **Content-hashed paths without suffix**: some build pipelines produce names like `/static/abc123def` instead of `/static/abc123def.png`.

If the URL _does_ have an extension, you don't need `parser`; let auto-detection do its job. Only set `parser` when detection can't work.

### `loadParser` is deprecated

The v7 `loadParser` field still works but emits a deprecation warning. Use `parser` for new code.

```ts
// Old (deprecated)
await Assets.load({ src: "...", loadParser: "loadTextures" });

// New
await Assets.load({ src: "...", parser: "texture" });
```

## Topics

Every asset workflow is covered in a reference file. Pick the one that matches the question:

| Topic                          | Reference                                                              | When                                        |
| ------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------- |
| Texture atlases and animations | [references/spritesheet.md](references/spritesheet.md)                 | Loading sprite sheets with `AnimatedSprite` |
| Video textures                 | [references/video.md](references/video.md)                             | `.mp4`, `.webm`, autoplay, looping, mobile  |
| Web and bitmap fonts           | [references/fonts.md](references/fonts.md)                             | `.woff2`, `.fnt`, font families, SDF fonts  |
| Animated GIFs                  | [references/gif.md](references/gif.md)                                 | `.gif`, `GifSprite`, playback control       |
| Grouping assets by feature     | [references/bundles.md](references/bundles.md)                         | `addBundle`, `loadBundle`, `unloadBundle`   |
| Declaring everything upfront   | [references/manifests.md](references/manifests.md)                     | `Assets.init({ manifest })` workflows       |
| Cache lookups and cleanup      | [references/caching.md](references/caching.md)                         | `Assets.get`, `Assets.unload`, `Cache`      |
| Priming future assets          | [references/background.md](references/background.md)                   | `backgroundLoad`, `backgroundLoadBundle`    |
| Loading screens                | [references/progress.md](references/progress.md)                       | `onProgress`, LoadOptions progress          |
| GPU-compressed formats         | [references/compressed-textures.md](references/compressed-textures.md) | `.ktx2`, `.basis`, `.dds`, `.ktx`           |
| Vector vs raster SVG           | [references/svg.md](references/svg.md)                                 | `parseAsGraphicsContext`, texture mode      |
| Retina + format detection      | [references/resolution.md](references/resolution.md)                   | `@{1,2}x`, `format` preferences             |

## Decision guide

- **Need to load a single image?** Use `Assets.load(url)`. No setup required.
- **Loading many assets grouped by level/scene?** Use a bundle. See `references/bundles.md`.
- **Know all assets at build time?** Use a manifest in `Assets.init`. See `references/manifests.md`.
- **Need a loading bar?** Pass a progress callback to `Assets.load`. See `references/progress.md`.
- **Smooth transitions between levels?** Background-load the next level. See `references/background.md`.
- **Memory budget matters?** Use compressed textures and `Assets.unload` between screens. See `references/compressed-textures.md` and `references/caching.md`.
- **Need crisp SVG icons at any size?** Load as Graphics, not texture. See `references/svg.md`.
- **Retina + WebP/AVIF?** Configure `texturePreference` and use format patterns. See `references/resolution.md`.

## Load options and error handling

There are two separate "options" concepts when loading assets:

1. **`LoadOptions`**: the second argument to `Assets.load`/`loadBundle`. Controls error recovery, retries, progress, and completion callbacks across a whole load.
2. **`data`**: a field on each asset descriptor. Forwards parser-specific options (scale mode, resolution, font family, autoplay flags, etc.) to the specific loader for that asset.

### LoadOptions (per call)

```ts
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
- `onError(error, url)`: `url` is `string | ResolvedAsset`. Guard before reading `.src`; when `url` is a string, `.src` is undefined.
- `strategy: 'throw' | 'skip' | 'retry'` — default `'throw'`. `'skip'` resolves with any successful assets; `'retry'` reattempts the failed ones.
- `retryCount` — default `3`, retries per asset when `strategy` is `'retry'`.
- `retryDelay` — default `250` ms between retries.

Global defaults live on `Loader.defaultOptions`, or pass `loadOptions` to `Assets.init()`.

### `data` options (per asset)

Each loader parser reads its own options from the `data` field on the asset descriptor. Use the table below to pick the right options for each asset type:

| Asset type         | `data` shape                                                                    | Key options                                                                                                                                                                                                                                                | Reference                           |
| ------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Texture (image)    | `TextureSourceOptions`                                                          | `resolution`, `scaleMode`, `alphaMode`, `autoGenerateMipmaps`, `antialias`, `addressMode`                                                                                                                                                                  | `references/resolution.md`          |
| SVG                | `{ parseAsGraphicsContext?, resolution? }`                                      | `parseAsGraphicsContext` for Graphics mode; `resolution` for sharper raster                                                                                                                                                                                | `references/svg.md`                 |
| Video              | `VideoSourceOptions`                                                            | `autoPlay`, `loop`, `muted`, `playsinline`, `preload`, `updateFPS`, `crossorigin`, `mime`                                                                                                                                                                  | `references/video.md`               |
| Web font           | `LoadFontData`                                                                  | `family`, `weights`, `style`, `display`, `unicodeRange`, `featureSettings`                                                                                                                                                                                 | `references/fonts.md`               |
| Bitmap font        | (none; auto-configured)                                                         | Distance-field detection sets scale mode and mipmaps                                                                                                                                                                                                       | `references/fonts.md`               |
| Spritesheet        | `{ texture?, imageFilename?, ignoreMultiPack?, textureOptions?, cachePrefix? }` | `textureOptions` forwards `TextureSourceOptions` (e.g. `scaleMode`) to the atlas image; `texture` to skip image load; `imageFilename` to override the referenced image; `ignoreMultiPack` to skip multi-pack follow-ups; `cachePrefix` to namespace frames | `references/spritesheet.md`         |
| GIF                | `GifBufferOptions`                                                              | `fps`, `scaleMode`, `resolution`, `autoGenerateMipmaps`                                                                                                                                                                                                    | `references/gif.md`                 |
| Compressed texture | `TextureSourceOptions`                                                          | `scaleMode`, `addressMode`, `autoGenerateMipmaps`                                                                                                                                                                                                          | `references/compressed-textures.md` |
| JSON / Text        | (none)                                                                          | Returned as-is                                                                                                                                                                                                                                             | —                                   |

Example combining `LoadOptions` and `data`:

```ts
await Assets.load(
  {
    alias: "hero",
    src: "hero.png",
    data: { scaleMode: "nearest", resolution: 2 },
  },
  { strategy: "retry", retryCount: 3 },
);
```

Inside a manifest or bundle, every entry can carry its own `data`:

```ts
await Assets.init({
  manifest: {
    bundles: [
      {
        name: "level1",
        assets: [
          { alias: "tiles", src: "tiles.png", data: { scaleMode: "nearest" } },
          { alias: "font", src: "hero.woff2", data: { family: "Hero" } },
          {
            alias: "clip",
            src: "intro.mp4",
            data: { autoPlay: false, muted: true },
          },
        ],
      },
    ],
  },
});
```

## Runtime configuration

`Assets.init(options)` accepts, alongside `basePath` and `manifest`:

- `defaultSearchParams` — string or `Record<string, any>` appended to every resolved URL. Useful for cache busting.
- `skipDetections: boolean` — bypass browser format detection for faster init. Requires explicit `texturePreference.format`.
- `bundleIdentifier: BundleIdentifierOptions` — customize how bundle keys resolve so the same alias can live in multiple bundles.
- `loadOptions: Partial<LoadOptions>` — set the default `strategy`, `retryCount`, `retryDelay`, and callbacks for every subsequent `Assets.load` call.
- `preferences: Partial<AssetsPreferences>` — `crossOrigin`, `preferWorkers`, `preferCreateImageBitmap`, `parseAsGraphicsContext`.

After init, preferences can still be tuned:

```ts
Assets.setPreferences({
  crossOrigin: "anonymous",
  preferCreateImageBitmap: false,
});

for (const detection of Assets.detections) {
  console.log(detection.extension);
}

Assets.reset();
```

- `Assets.setPreferences(preferences)` — push new preferences to every parser that supports them.
- `Assets.detections` — getter exposing the registered `FormatDetectionParser` list; use when inspecting what formats the current environment advertises.
- `Assets.reset()` — internal full reset (resolver + loader + cache). Intended for tests so a fresh `Assets.init` can run.

## Common Mistakes

### [CRITICAL] Using `Texture.from(url)` to load

Wrong:

```ts
const texture = Texture.from("https://example.com/image.png");
```

Correct:

```ts
const texture = await Assets.load("https://example.com/image.png");
```

In v8, `Texture.from()` only reads the cache. It does not fetch from a URL. Use `Assets.load()` first; the return value is the texture itself.


### [HIGH] Using positional `Assets.add` signature

Wrong:

```ts
Assets.add("bunny", "bunny.png");
```

Correct:

```ts
Assets.add({ alias: "bunny", src: "bunny.png" });
```

The positional `Assets.add(key, url)` form was removed in v8. Use the options object with `alias` and `src` properties.


### [HIGH] Not unloading textures between levels

`Assets.load()` caches textures indefinitely. For level-based games or screens with distinct asset sets, call `Assets.unloadBundle()` when transitioning to release GPU memory.


## API Reference

- [Assets](https://pixijs.download/release/docs/assets.Assets.html.md)
- [Loader](https://pixijs.download/release/docs/assets.Loader.html.md)
- [Resolver](https://pixijs.download/release/docs/assets.Resolver.html.md)
- [Cache](https://pixijs.download/release/docs/assets.Cache.html.md)
- [LoadOptions](https://pixijs.download/release/docs/assets.LoadOptions.html.md)
- [AssetInitOptions](https://pixijs.download/release/docs/assets.AssetInitOptions.html.md)
- [AssetsManifest](https://pixijs.download/release/docs/assets.AssetsManifest.html.md)
- [AssetsBundle](https://pixijs.download/release/docs/assets.AssetsBundle.html.md)
- [BackgroundLoader](https://pixijs.download/release/docs/assets.BackgroundLoader.html.md)
- [Spritesheet](https://pixijs.download/release/docs/assets.Spritesheet.html.md)
