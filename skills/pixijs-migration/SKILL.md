---
name: pixijs-migration
description: >
  Migrate from PixiJS v7 to v8. Async app.init(), single pixi.js package
  (deprecated v7 core @pixi/* sub-packages replaced; supplemental packages like @pixi/sound still valid), Graphics API overhaul (shape-then-fill),
  BaseTexture removed (TextureSource types), shader/uniform rework,
  ParticleContainer requires Particle class, constructor options objects,
  DisplayObject removed (Container is base), settings removed, utils removed,
  Ticker callback signature, event system changes. Use when the user asks
  about upgrading PixiJS, migrating from v7, breaking changes in v8,
  deprecated APIs, @pixi/ imports not working, DisplayObject errors,
  beginFill/endFill replacement, old constructor syntax, or v7 code that
  stopped working after upgrade.
metadata:
  type: lifecycle
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/__docs__/migrations/v8.md"
---

## When to Use This Skill

Apply when the user is upgrading a PixiJS project from v7 to v8, encountering deprecated API errors after an upgrade, or asking about breaking changes between v7 and v8.

**Related skills:** For async Application setup use **getting-started**; for the new Graphics API use **graphics**; for shader/uniform changes use **custom-rendering**; for Text constructor changes use **text**; for destroy and cleanup patterns use **performance**.

## Migration Checklist: v7 to v8

Work through each category. Each item shows the expected v8 pattern and the v7 pattern that must be replaced.

### Initialization

**Async app.init()** -- Expected:
```ts
const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);
```
Fail: passing options to `new Application({...})` and using synchronously.

**app.canvas replaces app.view** -- `app.view` emits a deprecation warning.

**Application type parameter** -- Expected: `new Application<Renderer<HTMLCanvasElement>>()`. Fail: `new Application<HTMLCanvasElement>()`.

### Imports

**Single package** -- Expected:
```ts
import { Sprite, Application, Assets, Graphics } from 'pixi.js';
```
Fail: importing from any of the deprecated v7 core `@pixi/*` sub-packages (see list below). Supplemental packages like `@pixi/sound` are still valid and should continue to be used.

Deprecated `@pixi/*` packages (never use, any version):
`@pixi/accessibility`, `@pixi/app`, `@pixi/assets`, `@pixi/compressed-textures`, `@pixi/core`, `@pixi/display`, `@pixi/events`, `@pixi/extensions`, `@pixi/extract`, `@pixi/filter-alpha`, `@pixi/filter-blur`, `@pixi/filter-color-matrix`, `@pixi/filter-displacement`, `@pixi/filter-fxaa`, `@pixi/filter-noise`, `@pixi/graphics`, `@pixi/mesh`, `@pixi/mesh-extras`, `@pixi/mixin-cache-as-bitmap`, `@pixi/mixin-get-child-by-name`, `@pixi/mixin-get-global-position`, `@pixi/particle-container`, `@pixi/prepare`, `@pixi/sprite`, `@pixi/sprite-animated`, `@pixi/sprite-tiling`, `@pixi/spritesheet`, `@pixi/text`, `@pixi/text-bitmap`, `@pixi/text-html`.

**Custom builds** -- Set `manageImports: false` and import only needed extensions:
```ts
import 'pixi.js/graphics';
import 'pixi.js/text';
import 'pixi.js/events';
import { Application } from 'pixi.js';
await app.init({ manageImports: false });
```

**Extensions not auto-imported** (require explicit import even with manageImports enabled):
`pixi.js/advanced-blend-modes`, `pixi.js/unsafe-eval`, `pixi.js/prepare`, `pixi.js/math-extras`, `pixi.js/dds`, `pixi.js/ktx`, `pixi.js/ktx2`, `pixi.js/basis`.

**Community filters** -- Expected: `import { AdjustmentFilter } from 'pixi-filters/adjustment'`. Fail: `@pixi/filter-adjustment`.

### Graphics API

**Shape-then-fill** -- Expected:
```ts
const g = new Graphics().rect(50, 50, 100, 100).fill(0xff0000);
```
Fail: `beginFill(0xff0000).drawRect(50, 50, 100, 100).endFill()`.

**Renamed shape methods:**

| v7 | v8 |
|---|---|
| `drawRect` | `rect` |
| `drawCircle` | `circle` |
| `drawEllipse` | `ellipse` |
| `drawPolygon` | `poly` |
| `drawRoundedRect` | `roundRect` |
| `drawStar` | `star` |
| `drawRegularPolygon` | `regularPoly` |
| `drawRoundedPolygon` | `roundPoly` |
| `drawRoundedShape` | `roundShape` |
| `drawChamferRect` | `chamferRect` |
| `drawFilletRect` | `filletRect` |

**Fill replaces beginFill/beginTextureFill** -- Expected:
```ts
graphics.rect(0, 0, 100, 100).fill({ texture: Texture.WHITE, alpha: 0.5, color: 0xff0000 });
```
Fail: `beginFill(color, alpha)` or `beginTextureFill({ texture, alpha, color })`.

**Stroke replaces lineStyle** -- Expected:
```ts
graphics.rect(0, 0, 100, 100).fill('blue').stroke({ width: 2, color: 'white' });
```
Fail: `lineStyle(2, 'white')` or `lineTextureStyle({ texture, width, color })`.

**Holes use cut()** -- Expected:
```ts
graphics.rect(0, 0, 100, 100).fill(0x00ff00).circle(50, 50, 20).cut();
```
Fail: `beginHole()` / `endHole()`.

**GraphicsContext replaces GraphicsGeometry** -- Expected:
```ts
const context = new GraphicsContext().rect(0, 0, 100, 100).fill(0xff0000);
const g1 = new Graphics(context);
const g2 = new Graphics(context);
```
Fail: `new Graphics(graphics.geometry)`.

### Text

**Options object constructor** -- Expected:
```ts
const text = new Text({ text: 'Hello', style: { fontSize: 24 } });
const bmp = new BitmapText({ text: 'Hello', style: { fontFamily: 'MyFont' } });
const html = new HTMLText({ text: '<b>Hello</b>', style: { fontSize: 24 } });
```
Fail: `new Text('Hello', { fontSize: 24 })` (positional args).

**Bitmap font loading** -- Must `import 'pixi.js/text-bitmap'` before `Assets.load('font.fnt')`.

### Sprites / Mesh

**Texture.from no longer loads URLs** -- Must call `await Assets.load('image.png')` first, then `Texture.from('image.png')`.

**NineSliceSprite replaces NineSlicePlane** -- Expected:
```ts
const ns = new NineSliceSprite({
    texture, leftWidth: 10, topHeight: 10, rightWidth: 10, bottomHeight: 10,
});
```

**Mesh renames:** `SimpleMesh` -> `MeshSimple`, `SimplePlane` -> `MeshPlane`, `SimpleRope` -> `MeshRope`. All use options objects.

**MeshGeometry options** -- Expected:
```ts
const geom = new MeshGeometry({ positions: vertices, uvs, indices, topology: 'triangle-list' });
```
Fail: `new MeshGeometry(vertices, uvs, indices)`.

**ParticleContainer uses Particle** -- Expected:
```ts
const container = new ParticleContainer({ boundsArea: new Rectangle(0, 0, 800, 600) });
const particle = new Particle(texture);
container.addParticle(particle);
```
Fail: `container.addChild(new Sprite(texture))`.

### Events

**eventMode replaces interactive** -- Expected:
```ts
sprite.eventMode = 'static';
sprite.cursor = 'pointer';
sprite.on('pointertap', () => { /* handle */ });
```
Legacy: `sprite.interactive = true;` (still works as an alias for `eventMode = 'static'`, but prefer the explicit form).

Default `eventMode` is `'passive'` (no events). Must set `'static'` or `'dynamic'` explicitly.

**Ticker callback** -- Expected:
```ts
app.ticker.add((ticker) => { bunny.rotation += ticker.deltaTime; });
```
Broken: `app.ticker.add((dt) => { bunny.rotation += dt; })` -- compiles but `dt` is a `Ticker` object, not a number. Coerces to `NaN`, silently corrupting rotation.

**updateTransform removed** -- Use `this.onRender = this._onRender.bind(this)` in constructor instead.

### Shaders

**Shader.from uses options** -- Expected:
```ts
const shader = Shader.from({
    gl: { vertex: vertexSrc, fragment: fragmentSrc },
    resources: {
        myUniforms: new UniformGroup({ uTime: { value: 0, type: 'f32' } }),
    },
});
```
Fail: `Shader.from(vertex, fragment, uniforms)`.

**Filter constructor** -- Expected:
```ts
const filter = new Filter({
    glProgram: GlProgram.from({ fragment, vertex }),
    resources: { filterUniforms: { uTime: { value: 0, type: 'f32' } } },
});
```
Fail: `new Filter(vertex, fragment, { uTime: 0 })`.

**Uniforms require type** -- `new UniformGroup({ uTime: { value: 1, type: 'f32' } })`. Fail: `new UniformGroup({ uTime: 1 })`.

**Textures are resources, not uniforms** -- Pass as top-level resource entries (`texture.source`, `texture.style`), not inside UniformGroup.

### Textures

**Sprite no longer auto-detects texture UV changes** -- If you modify a texture's frame after creation, call `texture.update()` to recalculate UVs, then call `sprite.onViewUpdate()` to refresh the sprite. Both calls are required in this order. Updating source data (e.g. video textures) is still automatic.
```ts
texture.frame.width = texture.frame.width / 2;
texture.update();            // recalculate texture UVs first
sprite.onViewUpdate();       // then refresh the sprite's display
```

**Mipmaps** -- `BaseTexture.mipmap` renamed to `autoGenerateMipmaps`. For RenderTextures, you must manually update mipmaps:
```ts
const rt = RenderTexture.create({ width: 100, height: 100, autoGenerateMipmaps: true });
renderer.render({ target: rt, container: scene });
rt.source.updateMipmaps();
```

### Adapters

**DOMAdapter replaces settings.ADAPTER** -- Expected:
```ts
import { DOMAdapter, WebWorkerAdapter } from 'pixi.js';
DOMAdapter.set(WebWorkerAdapter);
DOMAdapter.get().createCanvas();
```
Fail: `settings.ADAPTER = WebWorkerAdapter; settings.ADAPTER.createCanvas();`.

Built-in adapters: `BrowserAdapter` (default), `WebWorkerAdapter` (for web workers).

### Other

**DisplayObject removed** -- `Container` is the base class. `class MyObj extends DisplayObject` fails.

**Leaf nodes cannot have children** -- `Sprite`, `Graphics`, `Mesh`, `Text` are leaf nodes. Wrap in `Container`.

**Renamed properties** (old names still exist as deprecated aliases with warnings):
- `container.name` -> `container.label`
- `container.cacheAsBitmap = true` -> `container.cacheAsTexture(true)`

**getBounds() return type changed:** `getBounds()` now returns a `Bounds` object, not a `Rectangle`. `Bounds` has `.x`, `.y`, `.width`, `.height` getters, so basic usage works. Use `.rectangle` when you need a `Rectangle` instance (e.g., for `.contains()`).

**settings object removed** -- Use `AbstractRenderer.defaultOptions.resolution = 1` and `DOMAdapter.set(BrowserAdapter)`.

**utils namespace removed** -- `import { isMobile } from 'pixi.js'` instead of `utils.isMobile`.

**Text parser renames:**
- `TextFormat` -> `bitmapFontTextParser`
- `XMLStringFormat` -> `bitmapFontXMLStringParser`
- `XMLFormat` -> `bitmapFontXMLParser`

**Assets.add** -- `Assets.add({ alias: 'bunny', src: 'bunny.png' })`. Fail: `Assets.add('bunny', 'bunny.png')`.

**Enum constants replaced with strings:**

| v7 | v8 |
|---|---|
| `SCALE_MODES.NEAREST` | `'nearest'` |
| `SCALE_MODES.LINEAR` | `'linear'` |
| `WRAP_MODES.CLAMP` | `'clamp-to-edge'` |
| `WRAP_MODES.REPEAT` | `'repeat'` |
| `WRAP_MODES.MIRRORED_REPEAT` | `'mirror-repeat'` |
| `DRAW_MODES.TRIANGLES` | `'triangle-list'` |
| `DRAW_MODES.TRIANGLE_STRIP` | `'triangle-strip'` |
| `DRAW_MODES.LINES` | `'line-list'` |
| `DRAW_MODES.LINE_STRIP` | `'line-strip'` |
| `DRAW_MODES.POINTS` | `'point-list'` |

**Culling is manual** -- Set `cullable = true`, then call `Culler.shared.cull(container, viewRect)` before render. Or add `CullerPlugin` via `extensions.add(CullerPlugin)`.

## Pre-Migration Summary

- [ ] No deprecated v7 core `@pixi/*` packages in dependencies (supplemental packages like `@pixi/sound` are fine)
- [ ] All core `@pixi/*` imports converted to `pixi.js`
- [ ] All `new Application({...})` converted to `await app.init({...})`
- [ ] All Graphics code uses shape-then-fill pattern
- [ ] All constructors use options objects (Text, Mesh, NineSliceSprite, etc.)
- [ ] Shader/Filter code uses `{gl, resources}` pattern with typed uniforms
- [ ] ParticleContainer code uses `Particle`, not `Sprite`
- [ ] Ticker callbacks access `ticker.deltaTime`, not first param as delta
- [ ] Event handling uses `eventMode` instead of `interactive`
- [ ] `settings` and `utils` references removed
- [ ] `DisplayObject` references replaced with `Container`
- [ ] Texture UV modifications call `sprite.onViewUpdate()` where needed
- [ ] RenderTexture mipmap code calls `source.updateMipmaps()` manually
- [ ] `settings.ADAPTER` replaced with `DOMAdapter.set()`

## Common Mistakes

### [CRITICAL] Importing from deprecated v7 core @pixi/* sub-packages

Wrong:
```ts
import { Sprite } from '@pixi/sprite';
import { Application } from '@pixi/app';
```

Correct:
```ts
import { Sprite, Application } from 'pixi.js';
```

v8 uses a single `pixi.js` package. The v7 core `@pixi/*` sub-packages are deprecated and must not be used (see the full list under Imports above). Supplemental packages like `@pixi/sound` are still valid.

Source: src/__docs__/migrations/v8.md

### [CRITICAL] Using DisplayObject as base class

Wrong: `class MyObject extends DisplayObject { ... }`
Correct: `class MyObject extends Container { ... }`

`DisplayObject` was removed in v8. `Container` is the base class for all display objects.

Source: src/__docs__/migrations/v8.md

### [HIGH] Using old SCALE_MODES/WRAP_MODES/DRAW_MODES enums

Wrong: `texture.source.scaleMode = SCALE_MODES.NEAREST;`
Correct: `texture.source.scaleMode = 'nearest';`

v8 uses string values. Old enums may work as deprecated aliases but should be replaced.

Source: src/__docs__/migrations/v8.md

### [HIGH] Using `interactive = true` instead of `eventMode`

Legacy: `sprite.interactive = true;` (still works as an alias for `eventMode = 'static'`)
Preferred: `sprite.eventMode = 'static';`

Default `eventMode` is `'passive'` (no events). Must set `'static'` (hit-testable, no tick checks) or `'dynamic'` (hit-testable with tick checks) explicitly. `interactive = true` still works without a deprecation warning, but `eventMode` is the canonical v8 API.

Source: src/__docs__/migrations/v8.md

### [HIGH] Using utils namespace

Wrong: `import { utils } from 'pixi.js'; utils.isMobile.any();`
Correct: `import { isMobile } from 'pixi.js'; isMobile.any();`

The `utils` namespace was removed. All utility functions are direct imports.

Source: src/__docs__/migrations/v8.md

### [HIGH] Expecting texture UV changes to auto-update sprites

Wrong: modifying `texture.frame` and assuming the sprite updates automatically.
Correct: call `sprite.onViewUpdate()` after modifying texture UVs.

Sprites no longer subscribe to texture UV change events for performance. Source data updates (e.g. video) still auto-reflect.

Source: src/__docs__/migrations/v8.md

---

See also: getting-started (async init), graphics (shape-then-fill API), custom-rendering (shader changes), text (constructor changes), performance (destroy patterns)

## Learn More

- [Application](https://pixijs.download/release/docs/app.Application.html.md)
- [PixiJS API Reference](https://pixijs.download/release/docs/llms.txt)
