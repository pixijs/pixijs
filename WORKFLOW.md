# PixiJS Workflow Documentation

> **Purpose**: Comprehensive guide to how different code blocks and files interact, showing the complete data flow and communication patterns throughout the PixiJS engine.

---

## Table of Contents

1. [Application Initialization Workflow](#application-initialization-workflow)
2. [Rendering Pipeline Workflow](#rendering-pipeline-workflow)
3. [Asset Loading Workflow](#asset-loading-workflow)
4. [Scene Graph Update Workflow](#scene-graph-update-workflow)
5. [Event Handling Workflow](#event-handling-workflow)
6. [Extension Registration Workflow](#extension-registration-workflow)
7. [Sprite Rendering Workflow](#sprite-rendering-workflow)
8. [Filter and Mask Workflow](#filter-and-mask-workflow)
9. [Texture Management Workflow](#texture-management-workflow)
10. [Module Interaction Map](#module-interaction-map)

---

## Application Initialization Workflow

### Step 1: Application Creation and Initialization

```
User Code
    │
    ├─→ new Application()
    │   └─→ [src/app/Application.ts]
    │       - Initialize application instance
    │       - Setup mixins from PixiMixins.d.ts
    │       - Register as EventEmitter
    │
    ├─→ app.init(options)
    │   └─→ [src/app/Application.ts::init()]
    │       │
    │       ├─→ autoDetectRenderer(options)
    │       │   └─→ [src/rendering/renderers/autoDetectRenderer.ts]
    │       │       │
    │       │       ├─→ Check preferred renderer type
    │       │       │
    │       │       ├─→ Detect browser capabilities
    │       │       │   └─→ [src/utils/browser/]
    │       │       │       - isWebGPUSupported()
    │       │       │       - isWebGLSupported()
    │       │       │
    │       │       ├─→ Dynamically import selected renderer
    │       │       │   ├─→ WebGPURenderer (./gpu/WebGPURenderer.ts)
    │       │       │   ├─→ WebGLRenderer (./gl/WebGLRenderer.ts)
    │       │       │   └─→ CanvasRenderer (./canvas/CanvasRenderer.ts)
    │       │       │
    │       │       └─→ Return Renderer instance
    │       │
    │       ├─→ renderer.init(options)
    │       │   └─→ [src/rendering/renderers/shared/system/AbstractRenderer.ts::init()]
    │       │       │
    │       │       ├─→ Create rendering context
    │       │       │   └─→ [Environment detection]
    │       │       │       - Canvas API
    │       │       │       - WebGL context
    │       │       │       - WebGPU adapter
    │       │       │
    │       │       ├─→ Initialize Systems
    │       │       │   ├─→ BackgroundSystem
    │       │       │   ├─→ ViewSystem
    │       │       │   ├─→ TextureSystem
    │       │       │   ├─→ MaskSystem
    │       │       │   ├─→ [Renderer-specific systems]
    │       │       │   └─→ SystemRunner.run('init')
    │       │       │
    │       │       └─→ Initialize RenderPipes
    │       │           ├─→ SpritePipe
    │       │           ├─→ GraphicsPipe
    │       │           ├─→ TextPipe
    │       │           ├─→ MeshPipe
    │       │           ├─→ FilterPipe
    │       │           ├─→ BlendModePipe
    │       │           └─→ [More pipes based on extensions]
    │       │
    │       ├─→ Run ApplicationInitHook
    │       │   └─→ [src/utils/global/globalHooks.ts]
    │       │       │
    │       │       ├─→ Invoke all ApplicationInitHook handlers
    │       │       │   └─→ Built-in plugin inits
    │       │       │       - ResizePlugin.init()
    │       │       │       - TickerPlugin.init()
    │       │       │       - [Custom plugin inits]
    │       │       │
    │       │       └─→ Add properties to Application instance
    │       │           - app.render()
    │       │           - app.update()
    │       │           - app.ticker
    │       │
    │       └─→ Create root Container (stage)
    │           └─→ [src/scene/container/Container.ts]
    │
    └─→ Application Ready
        └─→ Emit 'ready' event
            └─→ User can start adding children to app.stage
```

### Key File Interactions

| File | Role | Interactions |
|------|------|--------------|
| `src/app/Application.ts` | Main entry | Orchestrates init, manages lifecycle |
| `src/extensions/Extensions.ts` | Plugin registry | Provides extensions for plugins |
| `src/app/ResizePlugin.ts` | Auto-resize | Hooks into render loop |
| `src/app/TickerPlugin.ts` | Animation | Manages frame updates |
| `src/rendering/renderers/autoDetectRenderer.ts` | Renderer selection | Detects browser, loads renderer |
| `src/utils/browser/*` | Detection | Browser capability checks |
| `src/scene/container/Container.ts` | Scene root | Created as stage |

---

## Rendering Pipeline Workflow

### Complete Render Cycle

```
app.ticker.update()
    ↓
1. TICKER FRAME
   └─→ [src/ticker/Ticker.ts]
       - Calculate deltaTime, deltaMS
       - Call all registered ticker callbacks
           └─→ User update code runs here

2. RESIZE CHECK
   └─→ [src/app/ResizePlugin.ts]
       - Check if canvas needs resize
       - Call renderer.resize()
       - Update view system

3. RENDER PHASE
   └─→ app.render() or app.renderer.render()
       └─→ [src/rendering/renderers/shared/system/AbstractRenderer.ts::render()]
           │
           ├─→ COLLECT PHASE
           │   └─→ traverseScene()
           │       └─→ [src/scene/container/RenderGroup.ts]
           │           │
           │           ├─→ Visit root container
           │           ├─→ For each child (depth-first)
           │           │   │
           │           │   ├─→ Check visibility (container.visible)
           │           │   ├─→ Check alpha (container.alpha > 0)
           │           │   ├─→ Check culling
           │           │   │   └─→ [src/culling/cullingMixin.ts]
           │           │   │       - Compare bounds with viewport
           │           │   │       - Skip if outside if cullable
           │           │   │
           │           │   ├─→ If batchable (Sprite, Graphics)
           │           │   │   └─→ Add to batch collection
           │           │   │       └─→ [src/rendering/batcher/shared/]
           │           │   │
           │           │   └─→ If container
           │           │       └─→ Apply effects (filters, masks)
           │           │           └─→ [src/scene/container/container-mixins/effectsMixin.ts]
           │           │               - Create filter instructions
           │           │               - Create mask instructions
           │           │
           │           ├─→ Collect all objects into instruction set
           │           │   └─→ [src/rendering/renderers/shared/instructions/InstructionSet.ts]
           │           │
           │           └─→ Create RenderGroup instruction
           │               └─→ [src/scene/container/RenderGroup.ts]
           │                   - Represents this subtree
           │
           ├─→ INSTRUCTION BUILDING PHASE
           │   └─→ buildInstructions()
           │       │
           │       ├─→ For each object type
           │       │   ├─→ SpritePipe.buildBatch()
           │       │   │   └─→ Group sprites by texture + blend mode
           │       │   │       └─→ [src/rendering/renderers/gl/pipes/SpritePipe.ts]
           │       │   │           └─→ [src/rendering/renderers/gpu/pipes/SpritePipe.ts]
           │       │   │
           │       │   ├─→ GraphicsPipe.buildBatch()
           │       │   │   └─→ Build geometry data for graphics objects
           │       │   │       └─→ [src/scene/graphics/*]
           │       │   │
           │       │   └─→ [More pipes for each object type]
           │       │
           │       ├─→ Create batch instructions
           │       │   - One instruction per visual batch
           │       │   - Groups similar objects together
           │       │
           │       └─→ Arrange by render order
           │           - Sort by depth/zIndex
           │           - Sort by material properties
           │
           ├─→ UPLOAD PHASE
           │   └─→ For each instruction with data changes
           │       │
           │       ├─→ pipe.upload(instructionSet)
           │       │   └─→ Upload GPU data
           │       │       - Vertex data
           │       │       - Index data
           │       │       - Uniforms
           │       │       └─→ Renderer-specific upload
           │       │           ├─→ WebGL: bindBuffer(), bufferData()
           │       │           └─→ WebGPU: writeBuffer()
           │       │
           │       └─→ Texture binding
           │           └─→ [src/rendering/renderers/shared/texture/TextureSystem.ts]
           │               - Bind textures to GPU
           │
           ├─→ EXECUTION PHASE
           │   └─→ SystemRunner.run('execute')
           │       │
           │       └─→ For each instruction in order
           │           │
           │           ├─→ Get RenderPipe for instruction type
           │           │   └─→ instruction.renderPipeId → pipe
           │           │
           │           ├─→ Execute render state changes
           │           │   ├─→ BlendModePipe.execute()
           │           │   │   └─→ Set blend mode (GL.blendFunc)
           │           │   │
           │           │   ├─→ MaskPipe.execute()
           │           │   │   └─→ Apply mask operations
           │           │   │       └─→ [src/rendering/mask/]
           │           │   │
           │           │   └─→ FilterPipe.execute()
           │           │       └─→ Apply post-process filter
           │           │           └─→ [src/filters/FilterPipe.ts]
           │           │               - Render to texture
           │           │               - Apply shader
           │           │               - Render back to main target
           │           │
           │           ├─→ Make draw call
           │           │   └─→ pipe.execute(instruction)
           │           │       ├─→ WebGLPipe
           │           │       │   └─→ gl.drawArrays() or gl.drawElements()
           │           │       │
           │           │       └─→ WebGPUPipe
           │           │           └─→ renderPass.drawIndexed()
           │           │
           │           └─→ Update GPU state tracking
           │
           └─→ FINISH PHASE
               │
               ├─→ SystemRunner.run('renderEnd')
               │   └─→ Each pipe's renderEnd()
               │       - Release temporary resources
               │       - Clear GPU caches
               │
               ├─→ Emit 'render' event
               │   └─→ User code hooks
               │
               └─→ Present to screen
                   ├─→ WebGL: SwapBuffers (automatic)
                   ├─→ WebGPU: presentationContext.getCurrentTexture()
                   └─→ Canvas: Rendered immediately
```

### File Interactions in Rendering

| Phase | Main File | Calls | Purpose |
|-------|-----------|-------|---------|
| Collection | `RenderGroup.ts` | `Container.ts`, `Sprite.ts`, `Graphics.ts` | Traverse scene graph |
| Batching | `Batcher.ts` | Type-specific pipes | Group similar objects |
| Upload | `RenderPipe.ts`, `System.ts` | GPU context | Upload vertex data |
| Execution | `AbstractRenderer.ts` | Type-specific pipes | Make draw calls |

---

## Asset Loading Workflow

### Asset Load Request Flow

```
User Code
    │
    └─→ Assets.load(['image.png', 'sprite.json'])
        │
        └─→ [src/assets/Assets.ts]
            │
            ├─→ Load settings check
            │   └─→ Check if already loading/loaded
            │
            ├─→ For each asset
            │   │
            │   ├─→ RESOLVE PHASE
            │   │   └─→ Resolver.resolve(url)
            │   │       └─→ [src/assets/resolver/Resolver.ts]
            │   │           │
            │   │           ├─→ Check cache
            │   │           │   └─→ [src/assets/cache/Cache.ts]
            │   │           │       - If found, return cached asset
            │   │           │
            │   │           ├─→ Apply aliases
            │   │           │   └─→ resolveJsonUrl(), resolveTextureUrl()
            │   │           │       └─→ [src/assets/resolver/parsers/]
            │   │           │
            │   │           ├─→ Format detection
            │   │           │   └─→ detectDefaults(), detectWebp(), etc.
            │   │           │       └─→ [src/assets/detections/parsers/]
            │   │           │
            │   │           └─→ Return resolved asset config
            │   │
            │   ├─→ LOAD PHASE
            │   │   └─→ Loader.load(resolvedAsset)
            │   │       └─→ [src/assets/loader/Loader.ts]
            │   │           │
            │   │           ├─→ Detect asset type
            │   │           │   └─→ Based on extension/mime-type
            │   │           │
            │   │           ├─→ Select parser
            │   │           │   ├─→ Texture parsers
            │   │           │   │   └─→ loadTextures() → Texture.from()
            │   │           │   │       └─→ [src/rendering/renderers/shared/texture/Texture.ts]
            │   │           │   │
            │   │           │   ├─→ JSON parser
            │   │           │   │   └─→ loadJson()
            │   │           │   │       └─→ Parse JSON
            │   │           │   │
            │   │           │   ├─→ Font parser
            │   │           │   │   └─→ loadWebFont()
            │   │           │   │       └─→ Font loading via CSS
            │   │           │   │
            │   │           │   ├─→ SVG parser
            │   │           │   │   └─→ loadSvg()
            │   │           │   │       └─→ Render SVG to texture
            │   │           │   │
            │   │           │   └─→ [More parsers in ./parsers/]
            │   │           │
            │   │           ├─→ Download resource
            │   │           │   └─→ Fetch API or XMLHttpRequest
            │   │           │       - Track progress
            │   │           │       - Handle errors
            │   │           │
            │   │           ├─→ Process asset
            │   │           │   ├─→ Image: Create TextureSource
            │   │           │   │   └─→ [src/rendering/renderers/shared/texture/sources/ImageSource.ts]
            │   │           │   │
            │   │           │   ├─→ JSON: Parse and return object
            │   │           │   │
            │   │           │   ├─→ Spritesheet: Parse + create Spritesheet
            │   │           │   │   └─→ [src/spritesheet/Spritesheet.ts]
            │   │           │   │       - Parse frame data
            │   │           │   │       - Create textures for each frame
            │   │           │   │
            │   │           │   └─→ Other: Return processed asset
            │   │           │
            │   │           └─→ Cache asset
            │   │               └─→ [src/assets/cache/Cache.ts]
            │   │                   - Store in memory cache
            │   │                   - Map URL to asset
            │   │
            │   ├─→ CACHE PHASE
            │   │   └─→ cacheTextureArray(), cachePlugin.cache()
            │   │       └─→ [src/assets/cache/parsers/]
            │   │           - Store in cache hierarchy
            │   │
            │   └─→ RETURN ASSET
            │       └─→ Emit progress callback
            │           └─→ onProgress(currentProgress)
            │
            └─→ Return loaded assets
                └─→ Single asset or dictionary of assets
                    └─→ Ready for use in rendering
```

### Background Loading

```
Assets.loadBundle('levelAssets', onProgress)
    │
    ├─→ BackgroundLoader.load()
    │   └─→ [src/assets/BackgroundLoader.ts]
    │       │
    │       ├─→ Start background loading queue
    │       │   - Non-blocking
    │       │   - Reports progress
    │       │
    │       └─→ Load assets in background
    │           └─→ Call regular load() on each
    │
    └─→ Return when complete
        └─→ Assets available for immediate use
```

### Asset Caching

```
Assets.cache
    │
    ├─→ Memory cache
    │   └─→ [src/assets/cache/Cache.ts]
    │       - In-memory storage
    │       - Fast lookup
    │       - URL → Asset mapping
    │
    ├─→ Cache plugins
    │   └─→ cacheTextureArray plugin
    │       └─→ Store texture arrays efficiently
    │
    └─→ Cache reset
        └─→ Clear memory when done
```

---

## Scene Graph Update Workflow

### Adding Children to Container

```
container.addChild(sprite)
    │
    └─→ [src/scene/container/Container.ts::addChild()]
        │
        ├─→ childrenHelperMixin.addChild()
        │   └─→ [src/scene/container/container-mixins/childrenHelperMixin.ts]
        │       │
        │       ├─→ Set sprite.parent = container
        │       ├─→ Add to container.children array
        │       │
        │       └─→ Emit 'childadded' event
        │           └─→ Trigger render update
        │
        └─→ Invalidate render group
            └─→ [src/scene/container/RenderGroup.ts]
                - Mark for rebuild
                - Next render cycle will regenerate instructions
```

### Updating Transform

```
sprite.position.set(100, 100)
    │
    └─→ ObservablePoint._onUpdate()
        └─→ [src/maths/point/ObservablePoint.ts]
            │
            └─→ Notify container of change
                └─→ [src/scene/container/Container.ts]
                    │
                    ├─→ Invalidate bounds
                    │   └─→ Mark cached bounds as dirty
                    │
                    └─→ Mark for transform sync
                        └─→ Next render will recalculate global transform
```

### Changing Properties

```
sprite.visible = false
    │
    └─→ Container detects change
        │
        ├─→ Invalidate render group
        │   └─→ RenderGroup marked for rebuild
        │
        └─→ Next render cycle
            └─→ Object excluded from rendering
```

---

## Event Handling Workflow

### Event Dispatch Flow

```
DOM Event (click, pointerdown, etc)
    │
    └─→ [src/events/EventSystem.ts]
        │
        ├─→ EventBoundary receives event
        │   └─→ [src/events/EventBoundary.ts]
        │       │
        │       ├─→ EVENT CAPTURE
        │       │   └─→ Traverse from stage down to target
        │       │       - Fire 'on' captured event handlers
        │       │
        │       ├─→ HIT TEST
        │       │   └─→ Find target object
        │       │       └─→ [src/events/EventBoundary.ts::hitTest()]
        │       │           │
        │       │           ├─→ Check stage
        │       │           │   └─→ Recursively check children
        │       │           │
        │       │           ├─→ For each visible child
        │       │           │   │
        │       │           │   ├─→ Get global bounds
        │       │           │   │   └─→ [src/scene/container/container-mixins/getFastGlobalBoundsMixin.ts]
        │       │           │   │
        │       │           │   ├─→ Check point in bounds
        │       │           │   │   └─→ Rectangle.contains(point)
        │       │           │   │
        │       │           │   ├─→ Check if interactive
        │       │           │   │   └─→ container.interactive, eventMode
        │       │           │   │
        │       │           │   └─→ If hit, check children recursively
        │       │           │       └─→ Depth-first search for deepest match
        │       │           │
        │       │           └─→ Return deepest hit target
        │       │
        │       ├─→ CREATE FEDERATED EVENT
        │       │   └─→ [src/events/FederatedEvent.ts]
        │       │       ├─→ FederatedPointerEvent
        │       │       ├─→ FederatedMouseEvent
        │       │       ├─→ FederatedWheelEvent
        │       │       └─→ Populate event properties
        │       │           - global (world space)
        │       │           - local (target space)
        │       │           - data (original DOM event)
        │       │
        │       ├─→ EVENT BUBBLING
        │       │   └─→ Dispatch from target up hierarchy
        │       │       │
        │       │       ├─→ Fire 'on' event on target
        │       │       │   └─→ [src/events/FederatedEventTarget.ts]
        │       │       │       └─→ Call registered listeners
        │       │       │
        │       │       ├─→ If not prevented
        │       │       │   └─→ Fire on parent
        │       │       │       └─→ Recurse up hierarchy
        │       │       │
        │       │       └─→ Stop if event.stopPropagation() called
        │       │
        │       └─→ EVENT LIFECYCLE
        │           ├─→ Captured phase (capture: true)
        │           ├─→ At target phase
        │           ├─→ Bubbling phase
        │           └─→ Return to user
        │
        └─→ Complete
```

### Event Types Mapping

```
DOM Event          →  FederatedEvent Type      Properties
────────────────────────────────────────────────────────
pointerdown        →  FederatedPointerEvent     pointerId, isPrimary
pointerup          →  FederatedPointerEvent     
pointermove        →  FederatedPointerEvent     
click              →  FederatedMouseEvent      button, detail
rightclick         →  FederatedMouseEvent      
wheel              →  FederatedWheelEvent      deltaX, deltaY
```

---

## Extension Registration Workflow

### Plugin Registration and Discovery

```
extensions.add(MyPlugin)
    │
    └─→ [src/extensions/Extensions.ts]
        │
        ├─→ METADATA EXTRACTION
        │   └─→ Read MyPlugin.extension property
        │       └─→ ExtensionType.Application
        │
        ├─→ REGISTRY STORAGE
        │   └─→ Store in extensions._registry[type]
        │       └─→ _registry['application'] = [MyPlugin, ...]
        │
        ├─→ TRIGGER DISCOVERY
        │   └─→ emit('extension', MyPlugin)
        │       │
        │       └─→ [src/app/Application.ts] listening
        │           │
        │           ├─→ If ApplicationPlugin
        │           │   └─→ Call plugin.init(app, options)
        │           │       - Add properties to app
        │           │       - Hook into render loop
        │           │
        │           └─→ If RenderPipe
        │               └─→ Store in renderer.renderPipes
        │                   └─→ Available during render
        │
        └─→ ACTIVATION
            └─→ Plugin ready to use
                └─→ Access via app.myFeature or renderer.myRenderPipe
```

### Extension Types and Usage

```
ExtensionType.Application
    └─→ app.init() → plugin.init()
        └─→ Extends application with new methods

ExtensionType.WebGLPipes
    └─→ WebGLRenderer initialization
        └─→ Pipe used for rendering objects

ExtensionType.Asset
    └─→ Assets.load()
        └─→ Used to load custom asset types

ExtensionType.BlendMode
    └─→ New blend modes available for objects
        └─→ sprite.blendMode = 'customMode'

ExtensionType.Environment
    └─→ Environment detection
        └─→ Determines platform capabilities
```

---

## Sprite Rendering Workflow

### Complete Sprite Render Cycle

```
Sprite added to stage
    │
    └─→ app.stage.addChild(sprite)
        │
        └─→ Container marks for update
            │
            └─→ Next render cycle
                │
                ├─→ COLLECTION
                │   └─→ RenderGroup traverses
                │       └─→ Finds sprite in hierarchy
                │           └─→ Checks sprite.visible
                │               └─→ Adds to renderable collection
                │
                ├─→ BATCHING
                │   └─→ SpritePipe.buildBatch()
                │       └─→ [src/rendering/renderers/*/pipes/SpritePipe.ts]
                │           │
                │           ├─→ Compare sprite properties
                │           │   ├─→ sprite.texture
                │           │   ├─→ sprite.blendMode
                │           │   ├─→ sprite.tint
                │           │   └─→ sprite.alpha
                │           │
                │           ├─→ Group with similar sprites
                │           │   └─→ Same texture + blendMode = same batch
                │           │
                │           ├─→ Create batch vertex data
                │           │   └─→ Position, UV, color, etc
                │           │
                │           └─→ Create batch instruction
                │
                ├─→ UPLOAD
                │   └─→ SpritePipe.upload()
                │       └─→ Upload batch data to GPU
                │           ├─→ Vertex Buffer
                │           ├─→ Index Buffer
                │           ├─→ Texture Binding
                │           └─→ Uniform data
                │
                ├─→ EXECUTION
                │   └─→ SpritePipe.execute(instruction)
                │       ├─→ Bind buffers
                │       ├─→ Bind texture
                │       ├─→ Set blend mode
                │       ├─→ Draw call
                │       │   └─→ gl.drawElements(count)
                │       │       └─→ GPU renders all sprites in batch
                │       └─→ Unbind
                │
                └─→ Sprite visible on screen
```

### Sprite Update Flow

```
sprite.position.set(100, 100)
    │
    ├─→ Update local transform
    │
    └─→ Next render:
        │
        ├─→ Recalculate global transform
        │   └─→ parent.globalTransform * local.transform
        │
        ├─→ Update batch vertex data
        │   └─→ New position in vertex buffer
        │
        ├─→ Upload updated data to GPU
        │
        └─→ Render at new position
```

---

## Filter and Mask Workflow

### Filter Application

```
container.filters = [blurFilter]
    │
    └─→ [src/scene/container/container-mixins/effectsMixin.ts]
        │
        ├─→ Mark for effect update
        │
        └─→ Next render:
            │
            ├─→ COLLECT PHASE
            │   └─→ RenderGroup detects filters
            │       └─→ Create FilterEffect instruction
            │
            ├─→ INSTRUCTION BUILDING
            │   └─→ FilterPipe.buildFilter()
            │       └─→ [src/filters/FilterPipe.ts]
            │           │
            │           ├─→ Create render texture target
            │           │   └─→ Texture to render container to
            │           │
            │           └─→ Create filter instruction
            │
            ├─→ EXECUTION
            │   │
            │   ├─→ Render container to texture
            │   │   └─→ Set render target to texture
            │   │       └─→ Render children normally
            │   │
            │   ├─→ Apply filter
            │   │   └─→ FilterPipe.execute()
            │   │       │
            │   │       ├─→ Bind filter texture
            │   │       ├─→ Load filter shader
            │   │       │   └─→ [src/filters/defaults/]
            │   │       │       - BlurFilter → blur shader
            │   │       │       - ColorMatrixFilter → color shader
            │   │       │       - etc
            │   │       │
            │   │       ├─→ Render filter output
            │   │       │   └─→ Full-screen quad with shader
            │   │       │
            │   │       └─→ Result texture rendered to screen
            │   │
            │   └─→ Filtered result visible
```

### Mask Application

```
container.mask = maskShape
    │
    └─→ [src/scene/container/container-mixins/effectsMixin.ts]
        │
        ├─→ Mark for effect update
        │
        └─→ Next render:
            │
            ├─→ COLLECT PHASE
            │   └─→ RenderGroup detects mask
            │       └─→ Create MaskEffect instruction
            │
            ├─→ INSTRUCTION BUILDING
            │   └─→ Determine mask type
            │       ├─→ AlphaMask (texture alpha channel)
            │       │   └─→ [src/rendering/mask/alpha/AlphaMask.ts]
            │       │
            │       ├─→ ColorMask (specific color)
            │       │   └─→ [src/rendering/mask/color/ColorMask.ts]
            │       │
            │       ├─→ StencilMask (stencil buffer)
            │       │   └─→ [src/rendering/mask/stencil/StencilMask.ts]
            │       │
            │       └─→ Select appropriate mask type
            │
            ├─→ EXECUTION
            │   │
            │   ├─→ MaskPipe.push(maskEffect)
            │   │   └─→ [src/rendering/mask/MaskEffectManager.ts]
            │   │       │
            │   │       ├─→ For StencilMask
            │   │       │   ├─→ Enable stencil test
            │   │       │   ├─→ Render mask shape to stencil
            │   │       │   └─→ Set stencil func to match
            │   │       │
            │   │       └─→ For AlphaMask
            │   │           ├─→ Bind mask texture
            │   │           └─→ Adjust blend function
            │   │
            │   ├─→ Render children (masked)
            │   │   └─→ Only visible where mask permits
            │   │
            │   └─→ MaskPipe.pop()
            │       └─→ Restore previous mask state
            │
            └─→ Masked result visible
```

---

## Texture Management Workflow

### Texture Creation and Loading

```
Texture.from('image.png')
    │
    └─→ [src/rendering/renderers/shared/texture/Texture.ts]
        │
        ├─→ Check cache
        │   └─→ TextureCache.get('image.png')
        │
        ├─→ If not cached
        │   │
        │   ├─→ Detect image source type
        │   │   └─→ PNG, JPG, Canvas, Video, etc
        │   │
        │   ├─→ Create TextureSource
        │   │   └─→ [src/rendering/renderers/shared/texture/sources/]
        │   │       ├─→ ImageSource (for image elements)
        │   │       ├─→ CanvasSource (for canvas)
        │   │       ├─→ VideoSource (for video)
        │   │       └─→ BufferImageSource (for raw data)
        │   │
        │   ├─→ Upload to GPU
        │   │   └─→ TextureSystem.uploadTexture()
        │   │       └─→ [src/rendering/renderers/shared/texture/TextureSystem.ts]
        │   │           │
        │   │           ├─→ WebGL
        │   │           │   └─→ gl.texImage2D()
        │   │           │       - Transfer image to GPU
        │   │           │
        │   │           └─→ WebGPU
        │   │               └─→ device.queue.copyExternalImageToTexture()
        │   │                   - Transfer to GPU
        │   │
        │   └─→ Cache texture
        │       └─→ TextureCache.set('image.png', texture)
        │
        └─→ Return Texture
            └─→ Ready for rendering
```

### Spritesheet Handling

```
Spritesheet.from('atlas.json', 'atlas.png')
    │
    └─→ [src/spritesheet/Spritesheet.ts]
        │
        ├─→ Load base texture (atlas.png)
        │   └─→ Texture.from() → GPU texture
        │
        ├─→ Parse frame data (atlas.json)
        │   └─→ Extract frame rectangles and names
        │
        ├─→ For each frame
        │   │
        │   ├─→ Create Texture
        │   │   └─→ Reference sub-region of base texture
        │   │
        │   └─→ Store as spriteName → Texture mapping
        │
        └─→ Access frames
            └─→ spritesheet.textures.playerWalk
                └─→ Use in Sprite rendering
```

---

## Module Interaction Map

### Core Module Dependencies

```
┌─────────────────────────────────────────────────────┐
│                   Application Layer                  │
│  app/Application.ts                                  │
│  ├─→ Depends on: Extensions, Rendering, Scene      │
│  └─→ Provides: init(), render(), stage             │
└────────────────┬──────────────────────────────────┘
                 │
    ┌────────────┴──────────────────────────────────┐
    │                                                 │
┌───▼────────────────────────┐  ┌──────────────────────┐
│     Rendering Layer         │  │   Scene Layer       │
│  rendering/renderers/*      │  │   scene/*           │
├─────────────────────────────┤  ├──────────────────┤
│ - AbstractRenderer          │  │ - Container      │
│ - WebGLRenderer             │  │ - Sprite         │
│ - WebGPURenderer            │  │ - Graphics       │
│ - CanvasRenderer            │  │ - Text           │
│ - RenderPipes               │  │ - Mesh           │
│ - Batching                  │  │ - RenderGroup    │
└────┬──────────────┬─────────┘  └────┬─────────────┘
     │              │                 │
     │              └─────────────────┤
     │                                │
┌────▼────────────────────────────────▼─────────────┐
│          Utility Layers                           │
├──────────────────────────────────────────────────┤
│ - EventSystem (events/)                          │
│ - Ticker (ticker/)                               │
│ - Assets (assets/)                               │
│ - Extensions (extensions/)                       │
│ - Color, Math, Utils                             │
└──────────────────────────────────────────────────┘
```

### Data Flow Between Major Systems

```
┌─ Application Init
│  ├─→ Create Renderer (auto-detect)
│  ├─→ Create Stage (Container)
│  └─→ Load Extensions
│
├─ User Updates Scene
│  ├─→ User code modifies container tree
│  ├─→ Container marks RenderGroup dirty
│  └─→ Ready for next render
│
├─ Ticker Fires
│  ├─→ Calculate deltaTime
│  ├─→ Call ticker callbacks
│  └─→ Signal render needed
│
├─ Render Called
│  ├─→ Collect phase: Traverse scene graph
│  ├─→ Batch phase: Group objects
│  ├─→ Upload phase: Send to GPU
│  └─→ Execute phase: Make draw calls
│
├─ Event Occurs
│  ├─→ DOM event
│  ├─→ EventBoundary hit test
│  ├─→ Dispatch to target
│  └─→ Bubble up hierarchy
│
└─ Asset Loaded
   ├─→ Resolver resolves URL
   ├─→ Loader loads resource
   ├─→ Cache stores result
   └─→ Available for rendering
```

### Key Communication Patterns

#### Pattern 1: Observable Properties
```
sprite.position.set(100, 100)
    ↓
ObservablePoint detects change
    ↓
Notifies Container
    ↓
Container invalidates RenderGroup
    ↓
Next render: position updated
```

#### Pattern 2: Event Emission
```
container.emit('childadded', child)
    ↓
Listeners receive event
    ↓
Can trigger side effects
    ↓
Examples: Render updates, custom logic
```

#### Pattern 3: Plugin Architecture
```
extensions.add(MyPlugin)
    ↓
Application discovers plugin
    ↓
Calls plugin.init()
    ↓
Plugin extends functionality
    ↓
Available via app or renderer
```

#### Pattern 4: Lazy Loading
```
Renderer type not imported initially
    ↓
autoDetectRenderer() detects need
    ↓
Dynamic import WebGLRenderer
    ↓
Code splitting: renderer loaded separately
    ↓
Optimized bundle size
```

---

## Typical Application Workflows

### Simple Game Loop

```typescript
// 1. Setup
const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);

// 2. Load assets
const spriteTexture = await Assets.load('player.png');

// 3. Create scene
const player = new Sprite(spriteTexture);
app.stage.addChild(player);

// 4. Update loop (automatic via ticker)
app.ticker.add((ticker) => {
    player.x += 1;  // Move right
});
// ↓
// Ticker fires every frame
// → User update code runs
// → Scene modified
// → RenderGroup marked dirty
// → Next render updates
// → Sprite drawn at new position
```

### Complex Interaction

```typescript
// Click detection
player.eventMode = 'auto';
player.on('pointerdown', (event) => {
    // Event flow:
    // 1. DOM pointerdown event
    // 2. EventBoundary hit test
    // 3. Finds player sprite
    // 4. Creates FederatedPointerEvent
    // 5. Dispatches to player
    // 6. Handler called
    console.log('Player clicked!');
});

// Update based on interaction
if (playerClicked) {
    player.filters = [new BlurFilter()];
    // → Next render applies filter via FilterPipe
}
```

---

## Summary

PixiJS workflow follows a **clear, modular execution pattern**:

1. **Initialization**: Auto-detect renderer, create stage, load plugins
2. **User Updates**: Modify scene, properties change, tree updated
3. **Collection**: Traverse scene graph, collect renderable objects
4. **Batching**: Group objects by material properties
5. **GPU Transfer**: Upload data to GPU via systems
6. **Rendering**: Execute draw calls via pipes
7. **Display**: Result shown on screen

Each layer communicates with others through:
- **Event emission** for notifications
- **Direct method calls** for immediate actions
- **Plugin extensions** for customization
- **Observable properties** for reactive updates

This architecture enables **high performance**, **flexibility**, and **modularity** while maintaining a simple, intuitive API for developers.
