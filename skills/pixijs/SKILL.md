---
name: pixijs
description: "PixiJS v8 (pixi.js) reference. Use it before writing, fixing or porting any PixiJS code, from a one-line fix to a whole app or game. Routes to topic files: Application (app.init, resizeTo, resolution), Container scene graph (addChild, zIndex, RenderLayer, mask, destroy), Sprite, Texture, AnimatedSprite, TilingSprite, NineSliceSprite, Graphics (fill, stroke, FillGradient, SVG, SmoothGraphics), Text, BitmapText, HTMLText, SplitText, Mesh, MeshRope, ParticleContainer, Assets (load, bundles, Spritesheet, fonts, video), Ticker and onRender, events (eventMode, pointertap, drag, hitArea), filters and shaders (BlurFilter, Filter.from, GlProgram), blendMode and erasing into a RenderTexture, generateTexture, cacheAsTexture, Color, Point, Matrix, DOMContainer, GifSprite, HTMLSource, accessibility, performance and teardown, WebGL/WebGPU/Canvas renderers, Web Workers, custom builds, project setup, migration from v7."
license: MIT
---

## Read before you write

1. **List the files.** Write down every router row below that your task touches: each class you construct, options object you pass, effect you build and symptom you fix. A whole app usually lists four to eight (an eraser paint app: application, assets, scene-sprite, events, blend-modes; a game: application, assets, scene-sprite, events, ticker, scene-text).
2. **Read each listed file before you write the code for that part**, even for a one-line change. Open the file itself; a Grep hit is a fragment that drops the rule and the exception beside it. Each topic file links to its sub-pages for rarer branches.
3. **Done when every file on your list has been opened.** Then check your code against the pitfall group below for each feature you built.

No row fits: scan [references/index.md](references/index.md) (sub-pages, long-tail keywords, error strings), then the project's local PixiJS docs.

For a signature or option this skill doesn't cover, fetch the class's API page: `https://pixijs.download/release/docs/<module>.<Class>.html.md` (`app.Application`, `scene.Graphics`, `rendering.Texture`, `assets.Assets`). To find a class's module, look it up in `https://pixijs.download/release/docs/llms.txt`.

## Pitfalls that fail silently

Each line is the fix; its link owns the rule and the code. These run without errors and draw the wrong thing, and a Vite build doesn't type-check, so run `npx tsc --noEmit` to catch wrong option names.

**App setup and the frame loop**
- `const app = new Application(); await app.init({ ... })`. Constructor options are ignored; until `init` resolves `app.renderer` is `undefined` and `app.canvas`/`app.screen` throw. [application](references/application.md#lifecycle-construct-init-render-destroy)
- Top-level `await` fails `vite build` on Vite 6 and older; wrap init in an async IIFE. [create](references/create.md#top-level-await-appinit-in-vite-production-builds)
- With `resizeTo`, lay out in `app.renderer.on('resize', (w, h) => ...)`; your own `window` resize listener reads the old `app.screen`. An element target also needs `new ResizeObserver(() => app.queueResize())`. [application](references/application.md#resizeplugin)
- Ticker callbacks receive the `Ticker`: `app.ticker.add((t) => (s.x += 2 * t.deltaTime))`. `deltaTime` is ~1 per 60 fps frame, `deltaMS` is milliseconds. [ticker](references/ticker.md#time-units)
- `app.ticker.update()` already renders, even with `autoStart: false`; skip the extra `app.render()`. [ticker](references/ticker.md#app-lifecycle-and-manual-rendering)
- Per-object frame logic: `obj.onRender = () => { ... }` (replaces v7 `updateTransform` overrides); it also runs while the object is invisible. Name subclass methods anything but `_onRender`. [ticker](references/ticker.md#per-object-onrender-hook)
- Read canvas pixels from a listener at `UPDATE_PRIORITY.UTILITY`, which runs after the render. [ticker](references/ticker.md#frame-order)

**Loading assets and textures**
- `await Assets.init({ basePath, manifest })` before the first `load`, `loadBundle` or `backgroundLoad`; a later `init` is dropped. [assets](references/assets.md#init-order)
- `Assets.load([a, b])` resolves an object keyed by URL or alias: read `res[a]`. [assets](references/assets.md#load-results-and-keys)
- A URL with no file extension (`?id=`, `blob:`, API route) needs `Assets.load({ src, parser: 'texture' })`; without it the result is `null` with only a warning. Audio files have no loader and also resolve `null`; play sound with `@pixi/sound` or `HTMLAudioElement`. [assets](references/assets.md#forcing-a-parser-with-parser)
- `Texture.from(url)` and `Sprite.from(url)` read the cache only (v7 fetched): `await Assets.load(url)` first. [scene-sprite](references/scene-sprite.md#loading-before-creating)
- Wrap a `TextureSource` (`CanvasSource`, `texture.source`): `Sprite.from(source)` or `new Sprite(Texture.from(source))`; `new Sprite(source)` draws nothing. [scene-sprite](references/scene-sprite.md#loading-before-creating)
- Show another region with `sprite.texture = new Texture({ source, frame: new Rectangle(...) })`, or create the texture with `dynamic: true` and call `texture.update()`. [scene-sprite](references/scene-sprite.md#sub-textures-and-frames)
- After drawing into a source canvas, call `texture.source.update()`. [sprite](references/scene-sprite/sprite.md#canvas-and-video-textures)
- Per-asset `data` (`scaleMode`, `resolution`) applies on the first load of a `src` only; set `texture.source.scaleMode` on the result instead. [assets](references/assets.md#data-per-asset)

**Sprites and animation**
- `AnimatedSprite`: `animationSpeed` is frames per 60 fps tick (12 fps is `0.2`), and it needs `autoPlay: true` or `play()`. It runs on `Ticker.shared`, so `app.ticker.stop()` doesn't pause it. [animated-sprite](references/scene-sprite/animated-sprite.md#options)
- Call `play()` after each `anim.textures = ...` swap; replay a finished one-shot with `gotoAndPlay(0)`. [animated-sprite](references/scene-sprite/animated-sprite.md#switching-animations)
- Rotate or scale about a point with `origin`; `pivot` also moves the object, and `anchor` (0-1) shifts only the texture. [scene-sprite](references/scene-sprite.md#anchor-vs-pivot)

**Graphics**
- Shape first, then style: `new Graphics().rect(0, 0, 100, 50).fill(0xff0000).stroke({ width: 2, color: 0x000000 })`. `beginFill`, `drawRect` and `lineStyle` are v7. [scene-graphics](references/scene-graphics.md#shape-then-style)
- `FillGradient`: options object, every colour stop set before the first draw, `textureSpace: 'global'` for pixel coordinates (the default `'local'` is 0-1 across the shape). [scene-graphics](references/scene-graphics.md#gradients-and-patterns)
- Draw-time transforms apply in call order, the reverse of Canvas 2D: `rotateTransform(a).translateTransform(x, y)`. [scene-graphics](references/scene-graphics.md#draw-time-transforms)
- Stroke `alignment` is `1` inside, `0` outside (inverted from v7). [scene-graphics](references/scene-graphics.md#strokes)
- Animate a stable `Graphics` by its transform; `clear()` and redraw every frame re-tessellates. [scene-graphics](references/scene-graphics.md#keep-geometry-stable)

**Drawing into textures (paint, eraser, scratch-off, fog of war, baking)**
- The render root's own `blendMode` is ignored: put an `'erase'` brush inside a plain `Container` and pass the wrapper to `renderer.render({ container: wrapper, target, clear: false })`. `clear: false` keeps earlier strokes. [blend-modes](references/blend-modes.md#inheritance-and-render-roots)
- `'erase'` clears everything under it in the same target, background included; give the erasable layer its own `RenderTexture` and erase into that. [blend-modes](references/blend-modes.md#erase-and-paint-out-layers)
- Brush coordinates are texture pixels: `sprite.toLocal(e.global)` plus the anchor offset. [blend-modes](references/blend-modes.md#erase-and-paint-out-layers)
- `generateTexture({ target, frame: new Rectangle(...) })`: `frame` is a real `Rectangle` (a plain object throws `copyTo is not a function`), and the capture ignores the target's own position, scale and rotation. [renderers](references/core-concepts/renderers.md#generating-a-texture-from-a-container)
- A `cacheAsTexture(true)` container shows changes to its children only after `updateCacheTexture()`. [performance](references/performance.md#cacheastexture-for-performance)

**Particles**
- Fill a `ParticleContainer` with `addParticle(...particles)`; the `particles` option draws nothing until `update()`. Type it `new ParticleContainer<Particle>(...)` to reach `tint` and `alpha`. [scene-particle-container](references/scene-particle-container.md#the-particles-option-draws-nothing-on-its-own)
- Mark every property you change per frame in `dynamicProperties`: `position`, `rotation`, `vertex` (scale, anchor), `color` (tint, alpha), `uvs` (texture). A static one changes only after `update()`, and v7's `tint`/`scale` keys are ignored. [scene-particle-container](references/scene-particle-container.md#dynamicproperties-and-update)
- All particles share one texture source (frames of one atlas). Give the container `boundsArea` (its bounds are empty, so culling and filters skip it) and `hitArea` plus `eventMode` for pointer events. [scene-particle-container](references/scene-particle-container.md#bounds-and-hit-testing)

**Filters and blend modes**
- Assign a new array to change filters: `c.filters = [...(c.filters ?? []), blur]`. [filters](references/filters.md)
- Custom GLSL: `Filter.from({ gl: { vertex: defaultFilterVert, fragment }, resources })`. In the fragment sample `uTexture`, get 0-1 coordinates from `vTextureCoord * uInputSize.xy / uOutputFrame.zw` (both `highp`), and keep colour premultiplied (invert with `vec4(c.a - c.rgb, c.a)`). [filters](references/filters.md#custom-filter)
- On the WebGPU renderer (`preference: 'webgpu'`) every filter needs a `gpu` program too, or all filters on that container are skipped. The Canvas renderer skips filters. [filters](references/filters.md#webgpu-needs-a-wgsl-program-too)
- Effects that reach past the shape (glow, wave, outline) need `padding`; a full-screen stage filter needs `app.stage.filterArea = app.screen`; use `resolution: 'inherit'` on a high-DPI renderer. [filters](references/filters.md#filter-options)
- `DisplacementFilter` takes a `Sprite` that is on the stage; animate the distortion by moving that sprite (map texture `addressMode = 'repeat'`). A `TilingSprite`'s `tilePosition` is never read. [filters](references/filters.md#built-in-filters)
- A filtered container composites with its last filter's `blendMode`: `new BlurFilter({ strength: 8, blendMode: 'add' })`. [blend-modes](references/blend-modes.md#filtered-containers)
- Modes beyond `normal`/`add`/`multiply`/`screen`/`erase`/`min`/`max` need `import 'pixi.js/advanced-blend-modes'` and, on WebGL, `app.init({ useBackBuffer: true })`. [blend-modes](references/blend-modes.md#advanced-blend-modes)

**Text**
- `new Text({ text, style: { fill: 0xffffff } })`: the default fill is black, invisible on the default black background. [scene-text](references/scene-text.md)
- Strings that change every frame (score, timer, FPS) go in `BitmapText`; each `Text` change redraws a canvas and re-uploads it. [scene-text](references/scene-text.md#update-cost-comparison)
- Load web fonts with `await Assets.load({ src, data: { family } })` before creating text; `HTMLText` sees only fonts loaded this way. [html-text](references/scene-text/html-text.md#fonts-must-come-through-assets)
- Raise `style.padding` when a stroke or drop shadow is clipped. [text](references/scene-text/text.md#textstyle)

**Input**
- Give every listening object `eventMode = 'static'` (the default `'passive'` never fires its own listeners) and `cursor = 'pointer'` (v7 `buttonMode`). [events](references/events.md#eventmode)
- Clicks on empty canvas: `app.stage.eventMode = 'static'` and `app.stage.hitArea = app.screen`. A plain `Container` is hit only on its children; give it a `hitArea` to cover the gaps. [events](references/events.md#hit-testing)
- `visible = false` and `renderable = false` remove an object from hit testing; an invisible target uses `alpha = 0` or a `hitArea`. [scene-container](references/scene-container.md#hiding)
- Buttons listen to `pointertap` (`click` is mouse only, `tap` touch only); a double click is `e.detail === 2`. [events](references/events.md#event-types)
- Drag with `globalpointermove` (plain `pointermove` fires only over the object), end on `pointerup` and `pointerupoutside`, convert with `parent.toLocal(e.global)`, and keep points with `p.copyFrom(e.global)` (event objects are reused). [events](references/events.md#drag)
- Stop page scroll with a native `app.canvas.addEventListener('wheel', (e) => e.preventDefault(), { passive: false })`. [events](references/events.md#wheel)

**Scene order, coordinates and masks**
- `zIndex` orders siblings only and sorts at the next render; call `parent.sortChildren()` before reading `children`. [scene-container](references/scene-container.md#zindex-and-sortablechildren)
- Depth-sort across parents with `new RenderLayer({ sortableChildren: true })` and `layer.attach(obj)`; attach again after reparenting, and hide or move the objects themselves (the layer's own `visible`, `alpha` and position do nothing). [layers](references/scene-core-concepts/layers.md)
- Add a mask as a child of the masked `Container`; a `Sprite` mask reads the red channel unless `setMask({ mask, channel: 'alpha' })`. [masking](references/scene-core-concepts/masking.md)
- Map pointers into rotated or scaled containers with `container.toLocal(e.global)`; `getBounds()` returns `Bounds`, so hit-test with `getBounds().rectangle.contains(x, y)`. [scene-container](references/scene-container.md#bounds-and-coordinate-conversion)
- `Matrix` methods apply in call order and `a.append(b)` applies `b` first; Container-style is `scale().rotate().translate()`, applied with `setFromMatrix`. [math](references/math.md#matrix)
- Copy points with `copyFrom(p)` or `set(x, y)`; `pixi.js/math-extras` methods return a new point, so update in place with `pos.add(v, pos)`. [math](references/math.md#point-and-observablepoint)
- `Color` reads a plain `number[]` as 0-1 (`[180, 60, 90]` is white); pass 0-255 as a `Uint8Array`, and alpha as `'#rrggbbaa'` (`0xRRGGBBAA` throws). [color](references/color.md#input-ranges)

**Teardown**
- Destroy a subtree with `destroy({ children: true })` and free loaded files with `Assets.unload(key)`. `destroy(true)` also destroys shared textures, atlases and `GraphicsContext`s, and every later render of another user throws. [scene-container](references/scene-container.md#destroy)
- Call `app.destroy()` after `init` resolves (in React effects, chain it on the init promise); pass `releaseGlobalResources: true` when re-creating an app in the same tab. [application](references/application.md#lifecycle-construct-init-render-destroy)
- Destroy textures you create (`generateTexture`, canvases) with `texture.destroy(true)`; defer a destroy from inside `onRender` with `app.ticker.addOnce(() => obj.destroy())`. [performance](references/performance.md#teardown-and-memory), [scene-container](references/scene-container.md#destroy)

**Renderers and builds**
- `Application` picks WebGL unless `preference: 'webgpu'`. The Canvas renderer skips filters and draws nothing for `Mesh`. [renderers](references/core-concepts/renderers.md#what-the-canvas-renderer-skips)
- `pixi.js/math-extras`, `pixi.js/prepare`, `pixi.js/gif` and `pixi.js/advanced-blend-modes` work only after a side-effect import; with `skipExtensionImports: true`, also import `pixi.js/events`, `pixi.js/filters`, `pixi.js/accessibility` and `pixi.js/dom`. [environments](references/environments.md#custom-builds)

## Reference router

### Foundations

| Reference | Read when your code touches... |
|---|---|
| [application](references/application.md) | `Application`, `app.init()` options and defaults, `app.stage`/`renderer`/`canvas`/`screen`, `resizeTo`, `queueResize`, layout on resize, `resolution`/`autoDensity`/HiDPI (also after init), `autoStart`, `sharedTicker`, `app.start()`/`stop()`, `CullerPlugin`, Application plugins, `app.destroy()` and React StrictMode cleanup. |
| [core-concepts](references/core-concepts.md) | Choosing WebGL/WebGPU/Canvas, `autoDetectRenderer`, checking the backend, `renderer.render()` options (`clear`, `transform`, `target`), `RenderTexture`/`RenderTarget`, `generateTexture`, systems and pipes, renderer loaders, Three.js interop (`resetState`), context and device loss. |
| [ticker](references/ticker.md) | Per-frame logic: `app.ticker.add`, `deltaTime` vs `deltaMS`, `UPDATE_PRIORITY` and frame order, `maxFPS`/`minFPS`, `speed`, `onRender` (v7 `updateTransform`), `Ticker.shared`, a manual loop with `ticker.update()`, pausing. |
| [environments](references/environments.md) | Web Workers and `OffscreenCanvas`, Node/SSR/headless, strict CSP (`pixi.js/unsafe-eval`), `DOMAdapter` and custom `fetch` (auth headers), custom or tree-shaken builds (`skipExtensionImports`, side-effect imports), bundle size. |
| [create](references/create.md) | Scaffolding with `npm create pixi.js` and its templates, adding `pixi.js` to an existing project, `tsconfig` for TypeScript 5-7, Vite top-level-await build errors, `@webgpu/types` conflicts. |
| [migration-v8](references/migration-v8.md) | Porting a whole v7 codebase: `@pixi/*` imports, `BaseTexture`, `DisplayObject`, `settings` and `utils`, `renderer.plugins`, renamed options and enums (`SCALE_MODES`, `BLEND_MODES`). For one API, its topic file is enough. |

### Scene

| Reference | Read when your code touches... |
|---|---|
| [scene-core-concepts](references/scene-core-concepts.md) | The scene graph as a whole: containers vs leaves, render order, which class to use; sub-pages for coordinate spaces and `worldTransform`, render groups (`isRenderGroup`, panning a world), constructor options, `RenderLayer` (depth sort across parents), and masks (`mask`, `setMask`, inverse, sprite-mask channel). |
| [scene-container](references/scene-container.md) | `Container`: `addChild`/`removeChildren`/`reparentChild`, `pivot` vs `origin`, hiding (`visible`/`renderable`/`alpha`), `zIndex` and `sortChildren()`, `getBounds`, `toGlobal`/`toLocal`, `setSize`, container events, `onRender`, `destroy` options. |
| [scene-sprite](references/scene-sprite.md) | `Sprite`, `Texture` vs `TextureSource`, `Sprite.from`/`Texture.from`, sub-textures and `frame`, dynamic and canvas textures, shared-texture destroy; `AnimatedSprite` (speed, swapping or replaying animations, `onComplete`), `NineSliceSprite` (panels, borders), `TilingSprite` (`tilePosition`, scrolling backgrounds). |
| [scene-graphics](references/scene-graphics.md) | `Graphics` beyond a colour-filled shape: paths, holes (`cut`), strokes, `FillGradient`, `FillPattern`, texture fills, draw-time transforms, `GraphicsContext` sharing, SVG import and export (`svg()`, `graphicsContextToSvg`), hit testing, smooth edges without MSAA (`SmoothGraphics`), dashed lines (`DashLineShader`), v7 `beginFill`/`lineStyle` ports. |
| [scene-text](references/scene-text.md) | `Text`, `TextStyle`, `BitmapText` (`BitmapFont.install`, `.fnt`, MSDF), `HTMLText` (fonts, tag styles), `SplitText`/`SplitBitmapText`, per-frame text cost, shaped scripts. |
| [scene-mesh](references/scene-mesh.md) | `Mesh`, `MeshGeometry` (positions, uvs, indices, topology), `MeshSimple`, `MeshPlane`, `MeshRope` (trails), `PerspectiveMesh`, UVs and `addressMode`, mesh hit testing. |
| [scene-particle-container](references/scene-particle-container.md) | `ParticleContainer`, `Particle`, `dynamicProperties`, `update()`, emitters and particle pools, fading or tinting particles, pointer events on particles. |
| [scene-dom-container](references/scene-dom-container.md) | HTML elements over the canvas: `DOMContainer`, inputs and iframes, click-through `pointer-events`, `domContainerRoot`, removing the element. |
| [scene-gif](references/scene-gif.md) | Animated GIFs: `pixi.js/gif`, `GifSprite`, `GifSource`, GIF frame rate, cleanup. |
| [html-source](references/html-source.md) | Live HTML/DOM rendered into a texture (experimental HTML-in-Canvas): `HTMLSource`, `ElementImageSource`, `pixi.js/html-source`, `requestPaint`. |

### Utilities

| Reference | Read when your code touches... |
|---|---|
| [assets](references/assets.md) | `Assets.init`/`load`/`add`/`get`/`unload`, load result shapes, extension-less or `blob:` URLs (`parser`), retries and errors, bundles, manifests, background loading, progress bars, spritesheets, fonts, video, SVG, compressed textures, `@2x` resolution. |
| [events](references/events.md) | Pointer, mouse, touch, wheel: `eventMode`, `pointertap` vs `click`/`tap`, double click, propagation and capture, `hitArea`, `interactiveChildren`, clicks on empty canvas, drag (`globalpointermove`), `cursor`, `FederatedPointerEvent`, `eventFeatures`. |
| [math](references/math.md) | `Point`/`ObservablePoint` (`set`, `copyFrom`), `Matrix` (order, `append`/`prepend`, `decompose`, `setFromMatrix`), `Rectangle` and hit-area shapes, `pixi.js/math-extras` vector methods, `DEG_TO_RAD`. |
| [color](references/color.md) | `Color` and `ColorSource`: input ranges (hex with alpha, arrays, `Uint8Array`), conversions (`toHex`, `toRgba`, `toNumber`), `tint` and alpha, `premultiply`, v7 `utils.string2hex`. |
| [accessibility](references/accessibility.md) | Screen readers and keyboard navigation: `accessible`, `accessibleTitle`, `tabIndex`, `accessibilityOptions`, no overlay element appearing. |

### Effects and rendering

| Reference | Read when your code touches... |
|---|---|
| [blend-modes](references/blend-modes.md) | Any `blendMode` (`add`, `multiply`, `screen`, `erase`), an eraser, scratch-off or fog of war, painting into a `RenderTexture`, blend mode of the render root or of a filtered container, `overlay` and other advanced modes. |
| [filters](references/filters.md) | `BlurFilter`, `ColorMatrixFilter`, `DisplacementFilter`, `NoiseFilter`, `AlphaFilter`, custom `Filter.from` (GLSL, WGSL), filter uniforms, `padding`, `filterArea`, `resolution`, `blendRequired`, `pixi-filters`, multi-pass filters (bloom). |
| [custom-rendering](references/custom-rendering.md) | Custom shaders on a `Mesh`: `Shader.from`, `GlProgram`/`GpuProgram`, `UniformGroup` and uniform types, textures as `resources`, built-in shader inputs (`aPosition`, `uProjectionMatrix`); custom batchers, pipes, render bundles, 3D/array/storage textures. |
| [performance](references/performance.md) | FPS, draw calls, memory leaks, first-frame hitches: teardown (`destroy`, `Assets.unload`), `GCSystem`, `PrepareSystem`, render groups, `cacheAsTexture`, batching order, culling (`cullable`), pooling, filter and mask cost. |
