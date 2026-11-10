# migration-v8

A v7-to-v8 checklist for porting a whole codebase: each v7 pattern, its v8 replacement, and a link to the topic file that owns the rule. Port in this order: imports → Application init → Graphics → Text → events → shaders/filters → cleanup.

## Initialization

- `new Application({...})` used synchronously → `const app = new Application(); await app.init({...})`; constructor options are ignored with a deprecation warning ([application](application.md)).
- `app.view` → `app.canvas` (`app.view` warns).
- `new Application<HTMLCanvasElement>()` → `new Application<Renderer<HTMLCanvasElement>>()`.

## Imports

Everything imports from the single `pixi.js` package. Never use the deprecated v7 core `@pixi/*` packages, at any version: `@pixi/accessibility`, `@pixi/app`, `@pixi/assets`, `@pixi/compressed-textures`, `@pixi/core`, `@pixi/display`, `@pixi/events`, `@pixi/extensions`, `@pixi/extract`, `@pixi/filter-alpha`, `@pixi/filter-blur`, `@pixi/filter-color-matrix`, `@pixi/filter-displacement`, `@pixi/filter-fxaa`, `@pixi/filter-noise`, `@pixi/graphics`, `@pixi/mesh`, `@pixi/mesh-extras`, `@pixi/mixin-cache-as-bitmap`, `@pixi/mixin-get-child-by-name`, `@pixi/mixin-get-global-position`, `@pixi/particle-container`, `@pixi/prepare`, `@pixi/sprite`, `@pixi/sprite-animated`, `@pixi/sprite-tiling`, `@pixi/spritesheet`, `@pixi/text`, `@pixi/text-bitmap`, `@pixi/text-html`. Supplemental packages such as `@pixi/sound` are still valid.

- Community filters: `@pixi/filter-adjustment` → `import { AdjustmentFilter } from 'pixi-filters/adjustment'`.
- `manageImports: false` → `skipExtensionImports: true`, which drops events, filters, accessibility and `DOMContainer` until you import them; see [environments: custom builds](environments.md#custom-builds).
- Not auto-imported, even with default imports: `pixi.js/advanced-blend-modes`, `pixi.js/unsafe-eval`, `pixi.js/prepare`, `pixi.js/math-extras`, `pixi.js/dds`, `pixi.js/ktx`, `pixi.js/ktx2`, `pixi.js/basis`, `pixi.js/gif` (`GifSprite` is not exported from `pixi.js`), `pixi.js/html-source`.

## Graphics

Shape first, then style it:

```ts
import { Graphics, GraphicsContext, Texture } from "pixi.js";

const g = new Graphics()
  .rect(0, 0, 100, 100)
  .fill({ texture: Texture.WHITE, alpha: 0.5, color: 0xff0000 })
  .stroke({ width: 2, color: "white" })
  .circle(50, 50, 20)
  .cut();

const context = new GraphicsContext().rect(0, 0, 100, 100).fill(0xff0000);
const g1 = new Graphics(context);
const g2 = new Graphics(context);
```

| v7 | v8 |
| --- | --- |
| `beginFill(c).drawRect(...).endFill()` | `rect(...).fill(c)` |
| `beginFill(color, alpha)`, `beginTextureFill({ texture, alpha, color })` | `.fill({ color, alpha, texture })` after the shape |
| `lineStyle(2, 'white')`, `lineTextureStyle({ texture, width, color })` | `.stroke({ width, color, texture })` |
| `beginHole()` / `endHole()` | draw the hole shape, then `.cut()` |
| `new Graphics(graphics.geometry)` (`GraphicsGeometry`) | `new Graphics(context)` sharing a `GraphicsContext` |

Every `drawX` lost its prefix (`drawRect` → `rect`, `drawRoundedRect` → `roundRect`, `drawPolygon` → `poly`); full list in [scene-graphics](scene-graphics.md#v7-names--v8).

## Text

- `new Text('Hello', { fontSize: 24 })` → `new Text({ text: "Hello", style: { fontSize: 24 } })`; the same options object for `BitmapText` and `HTMLText`. Positional arguments still render but log a deprecation warning.
- `Assets.load('font.fnt')` loads a bitmap font with no extra import; `style.fontFamily` must match the font's `face` name.

## Sprites and meshes

- `Texture.from(url)` no longer loads URLs: `await Assets.load('image.png')` first, then `Texture.from('image.png')`.
- `NineSlicePlane` → `new NineSliceSprite({ texture, leftWidth, topHeight, rightWidth, bottomHeight })`.
- `SimpleMesh` → `MeshSimple`, `SimplePlane` → `MeshPlane`, `SimpleRope` → `MeshRope`; all take options objects.
- `new MeshGeometry(vertices, uvs, indices)` → `new MeshGeometry({ positions: vertices, uvs, indices, topology: "triangle-list" })`.
- ParticleContainer takes `Particle`s, not Sprites: `container.addChild(new Sprite(texture))` → `container.addParticle(new Particle(texture))`, with `new ParticleContainer({ boundsArea: new Rectangle(0, 0, 800, 600) })`.

## Events and per-frame logic

- `interactive = true` → `eventMode = "static"` (the legacy alias still works). The default `eventMode` is `'passive'`, so a listener fires only on a `'static'` or `'dynamic'` object, a parent delegating its children's events included; see [events](events.md).
- `buttonMode = true` → `eventMode = "static"; cursor = "pointer"`.
- `app.ticker.add((dt) => ...)` → `app.ticker.add((ticker) => { bunny.rotation += ticker.deltaTime; })`: the callback gets the `Ticker`, not a delta number.
- An `updateTransform()` override no longer runs per frame → `this.onRender = () => ...` set in the constructor, never a method named `_onRender`. Rules for both: [ticker](ticker.md).

## Shaders and filters

```ts
import { Filter, GlProgram, Shader, UniformGroup } from "pixi.js";

declare const vertexSrc: string;
declare const fragmentSrc: string;

const shader = Shader.from({
  gl: { vertex: vertexSrc, fragment: fragmentSrc },
  resources: {
    myUniforms: new UniformGroup({ uTime: { value: 0, type: "f32" } }),
  },
});

const filter = new Filter({
  glProgram: GlProgram.from({ fragment: fragmentSrc, vertex: vertexSrc }),
  resources: { filterUniforms: { uTime: { value: 0, type: "f32" } } },
});
```

- Replaces `Shader.from(vertex, fragment, uniforms)` and `new Filter(vertex, fragment, { uTime: 0 })`.
- Every uniform needs a `type`: `new UniformGroup({ uTime: 1 })` → `{ uTime: { value: 1, type: 'f32' } }`.
- Textures are top-level resource entries (`texture.source`, `texture.style`), not uniforms inside a `UniformGroup`.

## Textures

- A sprite follows `texture.frame` changes only on a texture created with `dynamic: true` before the sprite uses it; otherwise assign a new `Texture`. See [scene-sprite](scene-sprite.md#sub-textures-and-frames).
- `BaseTexture.mipmap` → `autoGenerateMipmaps`. RenderTexture mipmaps are not regenerated after a render; update them yourself:

```ts
import { RenderTexture, type Container, type Renderer } from "pixi.js";

declare const renderer: Renderer;
declare const scene: Container;

const rt = RenderTexture.create({ width: 100, height: 100, autoGenerateMipmaps: true });
renderer.render({ target: rt, container: scene });
rt.source.updateMipmaps();
```

## Renamed and removed APIs

Renamed; the old names remain as deprecated aliases that warn:

- `container.name` → `container.label`; `getChildByName(n)` → `getChildByLabel(n)`
- `container.cacheAsBitmap = true` → `container.cacheAsTexture(true)`
- `texture.baseTexture` → `texture.source`
- `event.data.global` → `event.global`
- `renderer.render(stage, { renderTexture })` → `renderer.render({ container: stage, target: renderTexture })`

Removed, so the v7 form fails TypeScript:

| v7 | v8 |
| --- | --- |
| `class X extends DisplayObject` | `extends Container` |
| `renderer.backgroundColor = 0x000000` | `renderer.background.color = 0x000000` (or `background` in `init`) |
| `BitmapFont.from("name", style, { chars })` | `BitmapFont.install({ name: "name", style, chars })` |
| `{ stroke: 0xffffff, strokeThickness: 4 }` | `{ stroke: { color: 0xffffff, width: 4 } }` |
| `{ dropShadow: true, dropShadowColor, dropShadowBlur, dropShadowDistance }` | `{ dropShadow: { color, blur, distance, angle, alpha } }` |
| `Loader.shared.add(...).load(cb)` | `await Assets.load(...)` (see [assets](assets.md)) |
| `Assets.add('bunny', 'bunny.png')` | `Assets.add({ alias: 'bunny', src: 'bunny.png' })` |
| `utils.isMobile`, any `utils.*` | direct import: `import { isMobile } from 'pixi.js'` |
| `utils.string2hex("#f00")`, `utils.hex2rgb(n)` | `new Color("#f00").toNumber()`, `new Color(n).toRgbArray()` (see [color](color.md)) |
| `BLEND_MODES.ADD` | `"add"` |
| `TextFormat` / `XMLStringFormat` / `XMLFormat` | `bitmapFontTextParser` / `bitmapFontXMLStringParser` / `bitmapFontXMLParser` |

- `Sprite`, `Graphics`, `Mesh` and `Text` are leaf nodes and cannot have children; wrap them in a `Container`.
- `renderer.plugins` is gone: use `renderer.extract`, `renderer.events`, `renderer.accessibility`, `renderer.prepare` (after `import 'pixi.js/prepare'`). `renderer.view` is now the view system; the canvas is `renderer.canvas` (or `app.canvas`).
- `getBounds()` returns `Bounds`: read `.rectangle` for a `Rectangle` (`.contains()`); see [scene-container](scene-container.md#bounds-and-coordinate-conversion).
- Culling is manual: `cullable = true` plus `CullerPlugin` or `Culler.shared.cull(...)`; see [performance](performance.md#culling).

Enum constants became strings:

| v7 | v8 |
| --- | --- |
| `SCALE_MODES.NEAREST` / `LINEAR` | `'nearest'` / `'linear'` |
| `WRAP_MODES.CLAMP` / `REPEAT` / `MIRRORED_REPEAT` | `'clamp-to-edge'` / `'repeat'` / `'mirror-repeat'` |
| `DRAW_MODES.TRIANGLES` / `TRIANGLE_STRIP` | `'triangle-list'` / `'triangle-strip'` |
| `DRAW_MODES.LINES` / `LINE_STRIP` / `POINTS` | `'line-list'` / `'line-strip'` / `'point-list'` |

## settings object removed

Each v7 setting is now an `app.init()` option or a static `defaultOptions` field:

| v7 | v8 per app (`app.init`) | v8 global default (set before `init` / texture creation) |
| --- | --- | --- |
| `settings.RESOLUTION` | `resolution` (with `autoDensity: true`) | `AbstractRenderer.defaultOptions.resolution` |
| `settings.ROUND_PIXELS` | `roundPixels: true` | `AbstractRenderer.defaultOptions.roundPixels = true` |
| `settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT` | `failIfMajorPerformanceCaveat` | `AbstractRenderer.defaultOptions.failIfMajorPerformanceCaveat` |
| `settings.PREFER_ENV` | `preference: "webgl"` | |
| `settings.ADAPTER` | | `DOMAdapter.set(adapter)` before `init` (`BrowserAdapter` default, `WebWorkerAdapter`; see [environments](environments.md)) |
| `BaseTexture.defaultOptions.scaleMode` / `settings.SCALE_MODE` | per texture: `source.scaleMode` | `TextureSource.defaultOptions.scaleMode = "nearest"` |
| `settings.MIPMAP_TEXTURES` | per texture: `autoGenerateMipmaps` | `TextureSource.defaultOptions.autoGenerateMipmaps = true` |
| `settings.TARGET_FPMS` | | `Ticker.targetFPMS` |

```ts
import { AbstractRenderer, Application, TextureSource } from "pixi.js";

AbstractRenderer.defaultOptions.roundPixels = true;
TextureSource.defaultOptions.scaleMode = "nearest";

const app = new Application();
await app.init({ width: 320, height: 180 }); // app.renderer.roundPixels === true
```

`AbstractRenderer.defaultOptions` is merged into the options inside `init()`, so changing it afterwards does nothing; `renderer.roundPixels` is a read-only getter, so round pixels can't be switched on after init. Every `Sprite`, `Graphics`, `Text`, `Mesh`, `TilingSprite`, `NineSliceSprite` and `ParticleContainer` also takes its own `roundPixels` (option or property).
