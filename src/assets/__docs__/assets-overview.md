---
title: Overview
category: assets
---

# Assets

A one stop shop for all Pixi resource management!
Super modern and easy to use, with enough flexibility to customize and do what you need!
Use the singleton class [Assets]{@link Assets} to easily load and manage all your assets.

```typescript
import { Assets, Texture } from 'pixi.js';
const bunnyTexture = await Assets.load<Texture>('bunny.png');
const sprite = new Sprite(bunnyTexture);
```

Check out the sections below for more information on how to deal with assets.

<details id="assets-loading">
<summary>Asset Loading</summary>
Do not be afraid to load things multiple times - under the hood, it will **NEVER** load anything more than once.
*For example:*
```js
import { Assets } from 'pixi.js';
promise1 = Assets.load('bunny.png')
promise2 = Assets.load('bunny.png')
// promise1 === promise2
```
Here both promises will be the same. Once resolved... Forever resolved! It makes for really easy resource management!
Out of the box Pixi supports the following files:
- Textures (**_avif_**, **_webp_**, **_png_**, **_jpg_**, **_gif_**, **_svg_**) via {@link loadTextures}, {@link loadSvg}
- Video Textures (**_mp4_**, **_m4v_**, **_webm_**, **_ogg_**, **_ogv_**, **_h264_**, **_avi_**, **_mov_**) via {@link loadVideoTextures}
- Sprite sheets (**_json_**) via {@link spritesheetAsset}
- Bitmap fonts (**_xml_**, **_fnt_**, **_txt_**) via {@link loadBitmapFont}
- Web fonts (**_ttf_**, **_woff_**, **_woff2_**) via {@link loadWebFont}
- JSON files (**_json_**) via {@link loadJson}
- Text Files (**_txt_**) via {@link loadTxt}
<br/>
More types can be added fairly easily by creating additional {@link LoaderParser LoaderParsers}.
</details>
<details id="textures">
<summary>Textures</summary>
- Textures are loaded as ImageBitmap on a worker thread where possible. Leading to much less janky load + parse times.
- By default, we will prefer to load AVIF and WebP image files if you specify them.
But if the browser doesn't support AVIF or WebP we will fall back to png and jpg.
- Textures can also be accessed via `Texture.from()` (see {@link Texture.from})
and now use this asset manager under the hood!
- Don't worry if you set preferences for textures that don't exist
(for example you prefer 2x resolutions images but only 1x is available for that texture,
the Assets manager will pick that up as a fallback automatically)
#### Sprite sheets
- It's hard to know what resolution a sprite sheet is without loading it first, to address this
there is a naming convention we have added that will let Pixi understand the image format and resolution
of the spritesheet via its file name: `my-spritesheet{resolution}.{imageFormat}.json`
<br><br>For example:
  - `my-spritesheet@2x.webp.json`* // 2x resolution, WebP sprite sheet*
  - `my-spritesheet@0.5x.png.json`* // 0.5x resolution, png sprite sheet*
- This is optional! You can just load a sprite sheet as normal.
This is only useful if you have a bunch of different res / formatted spritesheets.
</details>
<details id="fonts">
<summary>Fonts</summary>
Web fonts will be loaded with all weights.
It is possible to load only specific weights by doing the following:
```js
import { Assets } from 'pixi.js';
// Load specific weights..
await Assets.load({
    data: {
        weights: ['normal'], // Only loads the weight
    },
    src: `outfit.woff2`,
});
// Load everything...
await Assets.load(`outfit.woff2`);
```
</details>
<details id="background-loading">
<summary>Background Loading</summary>
Background loading will load stuff for you passively behind the scenes. To minimize jank,
it will only load one asset at a time. As soon as a developer calls `Assets.load(...)` the
background loader is paused and requested assets are loaded as a priority.
Don't worry if something is in there that's already loaded, it will just get skipped!
You still need to call `Assets.load(...)` to get an asset that has been loaded in the background.
It's just that this promise will resolve instantly if the asset
has already been loaded.
</details>
<details id="manifests-and-bundles">
<summary>Manifest and Bundles</summary>
- {@link AssetsManifest Manifest} is a descriptor that contains a list of all assets and their properties.
- {@link AssetsBundle Bundles} are a way to group assets together.
```js
import { Assets } from 'pixi.js';
// Manifest Example
const manifest = {
    bundles: [
        {
            name: 'load-screen',
            assets: [
                {
                    alias: 'background',
                    src: 'sunset.png',
                },
                {
                    alias: 'bar',
                    src: 'load-bar.{png,webp}',
                },
            ],
        },
        {
            name: 'game-screen',
            assets: [
                {
                    alias: 'character',
                    src: 'robot.png',
                },
                {
                    alias: 'enemy',
                    src: 'bad-guy.png',
                },
            ],
        },
    ]
};
await Assets.init({ manifest });
// Load a bundle...
loadScreenAssets = await Assets.loadBundle('load-screen');
// Load another bundle...
gameScreenAssets = await Assets.loadBundle('game-screen');
```
</details>
