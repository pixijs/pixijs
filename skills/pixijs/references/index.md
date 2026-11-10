# PixiJS reference index

Look here when no router row in `SKILL.md` matches: every topic file and sub-page, with the long-tail keywords (rare options, v7 names, error strings, symptoms) that send you to it. Open the file you land on and read it.

## Foundations

### [application](application.md)
Keywords: `new Application(options)` (v7 constructor), `app.view` → `app.canvas`, `app.domContainerRoot`, `releaseGlobalResources`, `removeView`, destroy before init, `Assets.unload` on teardown, `ResizePlugin`, `ResizeObserver`, `app.resize()`, `cancelResize`, renderer `'resize'` event, `renderer.view.autoDensity`, `renderer.resolution`, `devicePixelRatio`, `TickerPlugin`, `ApplicationPlugin`, `ExtensionType.Application`, extension priority, `PixiMixins.ApplicationOptions`.

- [application/application-options.md](application/application-options.md): every `app.init` option and its default. Keywords: `ApplicationOptions`, `background`/`backgroundColor`, `backgroundAlpha` (fixed after init), `clearBeforeRender`, `antialias`, `depth`, `transient`, `roundPixels`, `hello`, `failIfMajorPerformanceCaveat`, `bezierSmoothness`, `culler.updateTransform`, `eventMode`, `eventFeatures`, `accessibilityOptions`, `context`, `powerPreference`, `premultipliedAlpha`, `preserveDrawingBuffer` / `toDataURL`, `preferWebGLVersion`, `multiView`, `useBackBuffer`, `forceFallbackAdapter`, `gpu`, `gcActive`, `gcMaxUnusedTime`, `gcFrequency`, deprecated `textureGC*`/`renderableGC*`, per-renderer `webgl`/`webgpu`/`canvasOptions` overrides.

### [core-concepts](core-concepts.md)
How frames get to the screen; the per-frame loop is in [ticker](ticker.md). Keywords: `WebGLRenderer`, `WebGPURenderer`, `CanvasRenderer`.

- [core-concepts/renderers.md](core-concepts/renderers.md): backends, `renderer.render()` options, render targets, `generateTexture`, interop. Keywords: `preference` string vs array, `isWebGPUSupported`, `isWebGLSupported`, `renderer.name` vs `type`, `instanceof WebGPURenderer`, Canvas renderer limits (filters skipped, `Mesh` draws nothing), `WebGLLoader`/`WebGPULoader`/`CanvasLoader`, code-splitting renderer systems, `new WebGLRenderer()` + `renderer.init()`, `mipLevel`, `layer`, `flipY`, `colorAttachments`, `depthStencilAttachment`, depth-only target, `renderTarget.push`/`pop`/`bind`/`getBindState`, `copyDepthTexture`, `generateTexture` `frame`/`resolution`/`clearColor`, "copyTo is not a function", `resetState`, `webglcontextlost`, `GPUDevice.lost`, `isBundleValid`/`RenderBundle`.

### [ticker](ticker.md)
Keywords: `addOnce`, `remove(fn, context)`, v7 `dt` callback (TS2365, `NaN`), pixel readback, `elapsedMS`, `targetFPMS`, `FPS`, `onRender` while invisible, `_onRender` (TS2415, TS2425), v7 `updateTransform` override (TS2416), `Ticker.system`, `new Ticker`, `autoStart: false`, `ticker.update(time)`, double render, `visibilitychange` pause.

### [environments](environments.md)
Keywords: `DOMAdapter.set`/`get`, `BrowserAdapter`, `WebWorkerAdapter`, `transferControlToOffscreen`, worker resize/DPR by `postMessage`, `new URL(..., import.meta.url)` worker bundling, "Image is not defined", `HTMLText`/SVG/`extract.image` in a worker, `createImageBitmap`, node-canvas, `Adapter` interface, `adapter.fetch`, `preferWorkers`, `preferCreateImageBitmap`, `unsafe-eval`, `manageImports`, tree-shaking, `pixi.js/browser`, `pixi.js/webworker`, `pixi.js/events`, `pixi.js/filters`, `loadEnvironmentExtensions`, `autoDetectEnvironment`, v7 `settings.ADAPTER`.

### [create](create.md)
Keywords: `create pixi.js`, templates (`bundler-vite`, `bundler-webpack`, `bundler-esbuild`, `bundler-import-map`, `creation-web`, `framework-react`, `extension-default`), `npm install pixi.js`, the `--` separator, Node version, "Top-level await is not available", `es2022` target, `@types/web`, "Cannot find name GPUTextureUsage" (TS2552), `moduleResolution` `node`/`bundler` (TS2882, TS5107, TS5108).

### [migration-v8](migration-v8.md)
A whole-codebase v7 checklist; each entry links to the topic file that owns the rule. Keywords: `@pixi/*`, `pixi-filters`, `beginFill`/`endFill`/`lineStyle`/`drawRect`, `beginHole`, `GraphicsGeometry`, `Text` positional args, `NineSlicePlane`, `SimpleMesh`/`SimplePlane`/`SimpleRope`, `MeshGeometry`, `ParticleContainer`/`Particle`, `interactive`/`buttonMode`, ticker `dt`, `Shader.from`/`Filter`/`UniformGroup`, `BaseTexture`/`baseTexture`, `mipmap`/`autoGenerateMipmaps`, dynamic texture frame, `cacheAsBitmap`, `getChildByName`, `settings.RESOLUTION`/`ROUND_PIXELS`/`SCALE_MODE`/`PREFER_ENV`/`TARGET_FPMS`/`ADAPTER`, `defaultOptions`, `getBounds` returning `Bounds`, `SCALE_MODES`/`WRAP_MODES`/`DRAW_MODES`/`BLEND_MODES`, `Loader.shared`, `Assets.add` positional, `BitmapFont.from`, `strokeThickness`/`dropShadow`, `TextFormat` parser renames.

### [scene-core-concepts](scene-core-concepts.md)
Keywords: `addChild` on a `Sprite`/`Graphics`/`Text` (deprecation warning), `ParticleContainer.addChild` throws, `DisplayObject` removed, mask type overview.

- [transforms.md](scene-core-concepts/transforms.md): `localTransform`, `groupTransform`, `worldTransform`, `getGlobalTransform`, screen vs global coordinates, CSS-scaled canvas, `event.client`, `app.renderer.events.pointer.global`, `getGlobalAlpha`, `scale = 0` / `toLocal` divide by zero.
- [render-groups.md](scene-core-concepts/render-groups.md): `isRenderGroup`, `enableRenderGroup`, panning or zooming a large world, HUD fading, render group vs `cacheAsTexture`, nested render groups.
- [constructor-options.md](scene-core-concepts/constructor-options.md): `new Container({ ... })`, `children`/`parent`/`label`, `width`/`height` in options (scale stays 1), `cacheAsTexture` in options (type error, later throws), `setMask`, `interactive`, `effects`, `boundsArea`, `autoGarbageCollect`.
- [layers.md](scene-core-concepts/layers.md): `RenderLayer`, `attach`/`detach`/`detachAll`, `renderLayerChildren`, y-sort, `sortFunction`, `sortRenderLayerChildren`, `layer.visible` ignored, reparent detaches, layer in another render group, filters on a layer's ancestor.
- [masking.md](scene-core-concepts/masking.md): `StencilMask`, `AlphaMask`, `ColorMask`, `ScissorMask`, channel `'alpha'` vs red, inverse mask, `mask = null`, destroying a mask texture, "[MaskFilter] The mask texture was destroyed", masks on the Canvas renderer.

## Scene objects

### [scene-container](scene-container.md)
Keywords: `addChildAt`, `removeChildren` range bug, `replaceChild`, `removeFromParent`, `getChildByLabel`, `sortableChildren`, "contains is not a function" (`getBounds().rectangle`), `getGlobalPosition`, `getSize`, `childAdded`/`added`/`destroyed`/`visibleChanged` events, `destroy(true)`.

### [scene-sprite](scene-sprite.md)
Keywords: `skipCache`, `defaultAnchor`, texture `frame` readonly (TS2540), `texture.update()` vs `source.update()`, canvas redraw, `destroy(true)` on a shared texture.

- [sprite.md](scene-sprite/sprite.md): `Sprite.from`, `visualBounds`, `roundPixels`, canvas and video textures.
- [animated-sprite.md](scene-sprite/animated-sprite.md): `animationSpeed` fps, `autoPlay`, `autoUpdate` / `Ticker.shared`, `textures` swap, `gotoAndPlay` one-shot replay, `onComplete`, `FrameObject` `time` in ms, `fromFrames`/`fromImages`, `updateAnchor`, `currentFrame` out of range.
- [nineslice-sprite.md](scene-sprite/nineslice-sprite.md): v7 `NineSlicePlane`, `leftWidth`/`topHeight`, `defaultBorders`, nine-slice from `generateTexture` (`frame` `Rectangle`), `originalWidth`.
- [tiling-sprite.md](scene-sprite/tiling-sprite.md): `tilePosition`, `tileScale`, `tileRotation`, `applyAnchorToTexture`, NPOT, `addressMode` `'repeat'`.

### [scene-graphics](scene-graphics.md)
Keywords: `SmoothGraphics`, `DashLineShader`, dashed line, anti-aliasing without MSAA, `GraphicsPath`, `FillStyle`/`StrokeStyle`, `addColorStop`, `colorStops`, `textureSpace` `global`/`local`, `FillPattern` `repetition`/`setTransform`, `poly`/`roundRect`/`star`/`regularPoly`/`roundPoly`/`roundShape`/`chamferRect`/`filletRect`, `moveTo`/`lineTo`/`bezierCurveTo`/`quadraticCurveTo`/`arc`/`arcTo`/`arcToSvg`/`closePath`/`beginPath`, `cut` holes, `containsPoint`, `clone(true)`, `clear`, `bounds`, `setFillStyle`/`setStrokeStyle`, `defaultFillStyle`/`defaultStrokeStyle`, `rotateTransform`/`translateTransform`/`scaleTransform`/`setTransform`/`transform`/`save`/`restore`, stroke `alignment`/`pixelLine`/`cap`/`join`/`miterLimit`, `g.texture()`, `batchMode`, `customShader`, `roundPixels`, v7 `drawCircle`/`beginHole`/`endHole`/`beginTextureFill`/`GraphicsGeometry`. Symptoms: shape draws nothing, gradient shows one colour, rotated shape lands in the wrong place, shared context destroyed and render throws, redrawing every frame.

- [scene-graphics/smooth-graphics.md](scene-graphics/smooth-graphics.md): `SmoothGraphics` (shader anti-aliasing), when to choose it over `Graphics`, `pixelLine` keeping width, `DashLineShader` dash rules, no context sharing with `Graphics`, batching and movement costs, seams.

### [scene-text](scene-text.md)
Keywords: `TextStyle` defaults (black fill), positional constructor deprecated, Arabic/CJK/shaped scripts.

- [text.md](scene-text/text.md): `TextStyle` fields, `tagStyles`, `textureStyle` `scaleMode: 'nearest'`, stroke clipped by `padding`, `FillGradient`/`FillPattern` text, v7 gradient arrays, sharing and destroying a `TextStyle`.
- [bitmap-text.md](scene-text/bitmap-text.md): `BitmapFont.install`, `dynamicFill`, `chars`, `BitmapFontManager`, `.fnt` face name, MSDF, the `resolution` warning.
- [html-text.md](scene-text/html-text.md): `HTMLTextStyle`, `addOverride`/`cssOverrides`, async texture with synchronous width, fonts.
- [split-text.md](scene-text/split-text.md): `SplitText`, `SplitBitmapText`, `autoSplit`, `charAnchor`, `lines`/`words`/`chars`.

### [scene-mesh](scene-mesh.md)
Keywords: `topology` `triangle-strip`/`line-strip`, `indexCount`, `batchMode`, `shrinkBuffersToFit`, `aPosition`/`aUV`, `getBuffer().update()`, `State`, custom shader on a mesh, `hitArea`/`containsPoint`, atlas sub-texture UVs, UVs above 1, v7 `SimpleMesh`/`SimplePlane`/`SimpleRope`/`drawMode`, replaced `onRender` stops updates.

- [mesh.md](scene-mesh/mesh.md): base `Mesh` options, updating vertex buffers, drawing part of the index buffer, custom shaders.
- [mesh-simple.md](scene-mesh/mesh-simple.md): `MeshSimple` `vertices`, `autoUpdate`.
- [mesh-plane.md](scene-mesh/mesh-plane.md): `MeshPlane` `verticesX`/`verticesY`, `autoResize`, `PlaneGeometry.build`.
- [mesh-rope.md](scene-mesh/mesh-rope.md): `MeshRope` `points`, `textureScale`, rope width, `RopeGeometry.update`, trails.
- [mesh-perspective.md](scene-mesh/mesh-perspective.md): `PerspectiveMesh`, `setCorners`, `x0`..`y3`, `PerspectivePlaneOptions`.

### [scene-particle-container](scene-particle-container.md)
Keywords: `IParticle`, `particleChildren` typing (TS2339 on `tint`/`alpha`), `removeParticle`/`removeParticles`/`addParticleAt`, `dynamicProperties` `vertex`/`position`/`rotation`/`uvs`/`color`, `boundsArea` vs `hitArea`, `Particle.defaultOptions`, `ParticleShader`, v7 `Sprite` children, `maxSize`, `tint`/`alpha`/`scale` keys.

### [scene-dom-container](scene-dom-container.md)
Keywords: `pixi.js/dom`, `skipExtensionImports`, `DOMPipe`, HTML overlay/input/iframe, `pointer-events` click-through, positioned wrapper offset, `removeFromParent` of an ancestor, `dom.width` scales, CSS transform overwritten, TS7016.

### [scene-gif](scene-gif.md)
Keywords: `pixi.js/gif` side-effect import, type-only import elided, `data.fps` and untimed frames, `GifSprite` `fps` ignored, `autoUpdate` on `Ticker.shared`, `clone`, `Assets.unload` vs `destroy(true)`, `parser: 'gif'`.

### [html-source](html-source.md)
Keywords: `HTMLSourceCanvas`, `HTMLSource.defaultOptions`, `texElementSubImage2D`/`drawElementImageToTexture`/`texElementImage2D`/`copyElementImageToTexture` errors, `autoLayout`/`autoUpdate`/`autoRequestPaint`, `content="drawable"`, `layoutsubtree`, element inside the canvas (constructor throws), `isReady`, `updateElementGeometry`/`clearElementGeometry`/`canvasTransform`, `captureElementImage`, `ElementImage`, `autoClose`, `snapshot.close()`, `Sprite.from` vs `new Sprite(source)`, `Texture.from` detection priority -10, Chrome 155/157.

## Utilities

### [assets](assets.md)
Keywords: `Assets.load` array not iterable (TS2488), `Assets.get` with array keys, `strategy` `skip`/`retry`, `retryCount`, `onError` on every attempt, `data` on first load only, unknown URL resolves `null`, `blob:` URL, no audio loader, `Assets.reset`, `defaultSearchParams`, `bundleIdentifier`, loader names (`loadTextures`, `loadSvg`, `loadVideoTextures`, `loadJson`, `loadTxt`, `spritesheetAsset`), `loadParser`, `crossOrigin`, `setPreferences`.

- [bundles.md](assets/bundles.md): `addBundle`, `loadBundle` result keys, `unloadBundle`, unregistered bundle resolves `undefined`.
- [manifests.md](assets/manifests.md): `Assets.init({ manifest })`, inline or from a URL.
- [caching.md](assets/caching.md): `Assets.get`, `Assets.unload`, the `Cache` class.
- [background.md](assets/background.md): `backgroundLoad`, `backgroundLoadBundle`.
- [progress.md](assets/progress.md): `onProgress` for loading bars.
- [spritesheet.md](assets/spritesheet.md): `Spritesheet` JSON fields, `meta.scale`, `related_multi_packs`, `parseSync`, hand-built sheets, `data.texture`, cleanup.
- [fonts.md](assets/fonts.md): `loadWebFont`, `family` and `data` descriptors, bitmap fonts (`.fnt`, `.xml`).
- [video.md](assets/video.md): `VideoSource` options, `resource` play/unmute, autoplay and sound, `updateFPS`, `crossorigin`.
- [svg.md](assets/svg.md): SVG as texture or `GraphicsContext`, `parseAsGraphicsContext` / `setPreferences`, `<style>` ignored.
- [compressed-textures.md](assets/compressed-textures.md): KTX2, Basis, DDS, KTX imports, `getSupportedCompressedTextureFormats`.
- [resolution.md](assets/resolution.md): `@2x`, `RETINA_PREFIX`, `texturePreference`, `{webp,png}` format patterns.

### [events](events.md)
Keywords: `eventMode` `none`/`passive`/`auto`/`static`/`dynamic`, `app.init({ eventMode })`, `isInteractive`, `interactive`, `buttonMode`, `e.detail`, `pointerupoutside`, `contextmenu` / right click, capture phase, `stopPropagation`, passive parent delegation, `cursorStyles`, `persistentDeviceId`, event object reuse, `FederatedWheelEvent`, wheel `preventDefault` / page scroll.

### [math](math.md)
Keywords: `copy()` missing, `Point.shared`/`Matrix.shared`/`Matrix.IDENTITY`, `PointData`, `PointLike`, mirror/flip/negative scale, `setTransform`, `Rectangle` `pad`/`fit`/`enlarge`/`ceil`/`containsRect`/`intersects`/`copyFromBounds`, `Rectangle.EMPTY`, `Circle`/`Ellipse`/`Polygon`/`RoundedRectangle`/`Triangle`, `strokeContains`, `isClockwise`, `containsPolygon`, `SHAPE_PRIMITIVE`, math-extras `rotate` out-param bug, `intersection`, `union`, `lineIntersection`/`segmentIntersection` not exported.

### [color](color.md)
Keywords: `0xRRGGBBAA` throws, tint alpha, normalized `toRgba`, `toUint8RgbArray`, `toHexa`, `toPremultiplied`, `Color.shared`, `isColorLike`, `toBgrNumber`.

### [accessibility](accessibility.md)
Keywords: `accessibleHint`, `accessibleText`, `accessibleType`, `accessibleChildren`, `accessiblePointerEvents`, `AccessibilitySystem`, `enabledByDefault`, `debug`, `activateOnTab`, `deactivateOnMouseMove`, `setAccessibilityEnabled`, tab order, "container N" title, relabelling an element, keyboard activation with `e.global` undefined, mobile touch hook, `pixi.js/accessibility` with `skipExtensionImports`, unavailable on the Canvas renderer and in Web Workers.

## Effects and rendering

### [blend-modes](blend-modes.md)
Keywords: v7 `BLEND_MODES`, `none`/`min`/`max`, `inherit`, `renderer.render` root `blendMode`, `isRenderGroup` inheritance, `cacheAsTexture` blend mode, erase layer isolation, paint-out `RenderTexture` with `clear: false`, `pixi.js/advanced-blend-modes`, `color-burn`/`overlay`/`soft-light`, `useBackBuffer`, `Filter.defaultOptions.resolution`.

### [filters](filters.md)
Keywords: frozen `filters` array, "object is not extensible", `BlurFilter` `strengthX`/`strengthY`/`kernelSize`/`repeatEdgePixels`, `ColorMatrixFilter` multiply order and presets, `DisplacementFilter` map sprite and `scale` Point, `NoiseFilter` `seed`, `defaultFilterVert`, `GlProgram` filter, `vTextureCoord`, `uInputSize`, `uOutputFrame`, `uInputClamp`, v7 `uSampler`, highp link error ("Precisions of uniform ... differ"), premultiplied colour / invert filter, `resolution: 'inherit'`, `antialias`, `clipToViewport`, full-screen filter with `app.screen`, `uBackTexture`, gl-only filter on WebGPU, `@pixi/filter-*` (v7), v7 `filter.uniforms`, v7 `new Filter(vertex, fragment, uniforms)`.

- [filters/multi-pass.md](filters/multi-pass.md): custom `apply()`, bloom, `TexturePool.getSameSizeTexture`, `applyFilter`, `compatibleRenderers`, v7 `getFilterTexture`.
- [filters/wgsl-filter.md](filters/wgsl-filter.md): WGSL filter skeleton, the `gpu` program, `GlobalFilterUniforms`, `@group(0)` bindings.

### [custom-rendering](custom-rendering.md)
Keywords: `uWorldTransformMatrix`, `uTransformMatrix`, `uColor`, `uWorldColorAlpha`, v7 `projectionMatrix`/`translationMatrix`, `mesh.texture` with a custom shader, premultiplied shader output, `#version 300 es`, precision and sampler precision, `compatibleRenderers`, "Mesh shader has no gpuProgram", `isStatic`/`update()`, UBO / `ubo: true`, `uTexture`/`uSampler`/`source.style` resources, resource key matching, CSP `unsafe-eval`.

- [custom-rendering/uniform-types.md](custom-rendering/uniform-types.md): uniform `type` strings, `mat3x3<f32>` from a `Matrix`, non-square matrices, array uniforms with `size`.
- [custom-rendering/advanced-gpu.md](custom-rendering/advanced-gpu.md): custom `Batcher` (`ExtensionType.Batcher`, `batcherName`, `BatchableElement`), `InstructionPipe` and `destroyInstructionSet`, `Buffer.update` ranges, `BufferImageSource.update`, `vertexCount`/`getSize`, `indexCount`/`batchMode`, `clockwiseFrontFace`/`cullMode`, WGSL `overrides`/`ShaderOverrides`, `gpuLayout`, `TextureView` depth sampling, integer textures (`usampler2D`), several color attachments (`colorAttachments`, MRT, fragment outputs, `clearValue`/`loadOp`), 3D/array textures (`sampler3D`, `layer`), storage textures, render bundles, `TexturePool.getOptimalTexture`.

### [performance](performance.md)
Keywords: jank, level teardown, `releaseGlobalResources`, `gcMaxUnusedTime`/`gcFrequency`/`gcActive`, deprecated `textureGC`, `texture.source.unload()`, `pixi.js/prepare`, `prepare.upload`, staggered destroy, `updateCacheTexture`, max texture size, `maxBatchableTextures`, `@0.5x`, `Culler`, `cullArea`, `cullableChildren`, culled one frame late, `filterArea`, `repeatEdgePixels`, mask cost, `interactiveChildren`, transient MSAA `RenderTexture`, `tileBased`, `Buffer.update` range, render bundles, `generateTexture` of a `Graphics`.
