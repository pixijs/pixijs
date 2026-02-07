# PixiJS Architecture Documentation

> **Version**: 8.16.0  
> **Purpose**: Comprehensive architecture guide explaining the project structure, core systems, and how each component works together.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Architecture Layers](#core-architecture-layers)
3. [Module Organization](#module-organization)
4. [Key Systems and Components](#key-systems-and-components)
5. [Plugin Architecture](#plugin-architecture)
6. [Rendering Pipeline](#rendering-pipeline)
7. [Asset Management System](#asset-management-system)
8. [Scene Graph](#scene-graph)
9. [Event System](#event-system)
10. [Extension System](#extension-system)

---

## Project Overview

PixiJS is a **high-performance 2D rendering library** for the web that provides:

- **Multiple Rendering Backends**: WebGL, WebGPU, and Canvas
- **Asset Management**: Complete loader and caching system
- **Display System**: Scene graph with containers, sprites, and graphics
- **Event Handling**: Federated event system with pointer/touch support
- **Advanced Features**: Filters, masks, blending modes, text rendering, and more
- **Performance Optimization**: Batching, culling, and render instruction system

**Main Entry Point**: `src/index.ts`

```typescript
// Core exports from PixiJS
export * from './accessibility';
export * from './advanced-blend-modes';
export * from './app';
export * from './assets';
export * from './color';
export * from './compressed-textures';
export * from './culling';
export * from './dom';
export * from './environment';
export * from './events';
export * from './extensions';
export * from './filters';
export * from './maths';
export * from './prepare';
export * from './rendering';
export * from './scene';
export * from './spritesheet';
export * from './ticker';
export * from './utils';
```

---

## Core Architecture Layers

PixiJS follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│        Application Layer                 │
│  (Application, Plugins, Ticker)          │
├─────────────────────────────────────────┤
│        Scene Layer                       │
│  (Container, Sprite, Graphics, Text)    │
├─────────────────────────────────────────┤
│        Asset Management Layer            │
│  (Loader, Cache, Resolver)              │
├─────────────────────────────────────────┤
│        Rendering Pipeline Layer          │
│  (RenderPipes, Batchers, Instructions)  │
├─────────────────────────────────────────┤
│        Renderer Layer                    │
│  (WebGL, WebGPU, Canvas)                │
├─────────────────────────────────────────┤
│        System Layer                      │
│  (Extensions, Environment, Events)      │
├─────────────────────────────────────────┤
│        Utility Layer                     │
│  (Math, Color, Utils, Logging)          │
└─────────────────────────────────────────┘
```

---

## Module Organization

### High-Level Module Structure

The `src/` directory is organized into functional modules:

```
src/
├── app/                          # Application framework
│   ├── Application.ts            # Main Application class
│   ├── ApplicationMixins.d.ts    # Type definitions for mixins
│   ├── ResizePlugin.ts           # Automatic resizing plugin
│   ├── TickerPlugin.ts           # Animation tick management
│   └── init.ts                   # Plugin initialization
│
├── scene/                        # Scene graph and display objects
│   ├── container/                # Core Container class
│   ├── sprite/                   # Sprite rendering
│   ├── graphics/                 # Vector graphics
│   ├── text/                     # Text rendering
│   ├── mesh/                     # 3D mesh objects
│   ├── particle-container/       # Optimized particle rendering
│   └── view/                     # Base view container
│
├── rendering/                    # Rendering systems and pipes
│   ├── renderers/                # Renderer implementations
│   │   ├── gl/                   # WebGL renderer
│   │   ├── gpu/                  # WebGPU renderer
│   │   ├── canvas/               # Canvas renderer
│   │   └── shared/               # Shared rendering systems
│   ├── batcher/                  # Batch rendering optimization
│   └── mask/                     # Masking systems
│
├── assets/                       # Asset loading and management
│   ├── loader/                   # Loader system
│   ├── resolver/                 # URL resolution
│   ├── cache/                    # Caching layer
│   ├── detections/               # Asset type detection
│   └── BackgroundLoader.ts       # Background loading
│
├── extensions/                   # Plugin system
│   └── Extensions.ts             # Extension registry
│
├── events/                       # Event system
│   ├── EventBoundary.ts          # Event boundary
│   ├── EventSystem.ts            # Event management
│   ├── FederatedEvent.ts         # Event types
│   └── EventTicker.ts            # Event timing
│
├── filters/                      # Effect filters
│   ├── defaults/                 # Built-in filters
│   ├── blend-modes/              # Advanced blending
│   └── mask/                     # Mask filters
│
├── color/                        # Color management
│   └── Color.ts                  # Color utility
│
├── culling/                      # Visibility culling
│   └── cullingMixin.ts           # Culling behavior
│
├── maths/                        # Mathematical utilities
│   ├── matrix/                   # Matrix operations
│   ├── point/                    # Point/Vector math
│   └── shapes/                   # Geometric shapes
│
├── utils/                        # General utilities
│   ├── browser/                  # Browser detection
│   ├── data/                     # Data structures
│   ├── pool/                     # Object pooling
│   ├── logging/                  # Debug utilities
│   └── types.ts                  # Type definitions
│
├── ticker/                       # Animation ticking
│   └── Ticker.ts                 # Core ticker class
│
├── accessibility/                # Accessibility support
│   └── AccessibilitySystem.ts    # A11y implementation
│
├── dom/                          # DOM integration
│   ├── DOMContainer.ts           # DOM element wrapper
│   └── CanvasObserver.ts         # Canvas observation
│
├── environment/                  # Environment detection
│   └── autoDetectEnvironment.ts  # Auto-detection
│
├── spritesheet/                  # Spritesheet support
│   └── Spritesheet.ts            # Spritesheet class
│
├── prepare/                      # Preparation system
│   └── Prepare.ts                # Pre-rendering
│
└── [bundle files]                # Environment-specific bundles
    ├── bundle.browser.ts
    ├── bundle.webworker.ts
    ├── bundle.gif.ts
    └── ...
```

---

## Key Systems and Components

### 1. Application System

**File**: `src/app/Application.ts`

The `Application` class is the main entry point for PixiJS applications:

```typescript
// Application initialization flow
const app = new Application();

// Initialize with options
await app.init({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
    antialias: true,
    resolution: 1,
    preference: 'webgl'  // or 'webgpu'
});

// Add to DOM
document.body.appendChild(app.canvas);

// Access core properties
app.renderer          // The active renderer (WebGL/WebGPU/Canvas)
app.stage             // Root container for display objects
app.ticker            // Animation ticker
app.canvas            // Canvas element
```

**Key Features**:
- Auto-detects best available renderer
- Plugin-based architecture (ResizePlugin, TickerPlugin)
- Lifecycle management (init, start, stop, destroy)
- Event emission for application state changes

**Plugins**:
- `ResizePlugin`: Automatically resizes canvas to match container
- `TickerPlugin`: Manages animation frame updates

### 2. Container and Scene Graph

**File**: `src/scene/container/Container.ts`

The `Container` class is the fundamental building block for the scene hierarchy:

```typescript
// Create container hierarchy
const container = new Container();
const child = new Sprite(texture);
container.addChild(child);

// Container provides:
container.children         // Array of child objects
container.parent          // Parent container
container.visible         // Visibility flag
container.alpha           // Opacity (0-1)
container.scale.set(2)    // Scale transformation
container.rotation        // Rotation in radians
container.position.set(100, 100)  // Position

// Rendering properties
container.blendMode       // Blend mode (NORMAL, ADD, MULTIPLY, etc)
container.sortableChildren // Enable z-order sorting
container.cullable        // Enable culling optimization
container.mask            // Masking support
container.filters         // Applied filters array
```

**Container Mixins** (composition pattern):

```typescript
// Container includes multiple mixins providing functionality:
- childrenHelperMixin      // Child management (add, remove, etc)
- sortMixin                // Z-order sorting
- measureMixin             // Bounds calculation
- toLocalGlobalMixin       // Coordinate transformation
- collectRenderablesMixin  // Render instruction collection
- cacheAsTextureMixin      // Texture caching
- effectsMixin             // Filter/mask effects
- findMixin                // Child searching
- onRenderMixin            // Render events
- getFastGlobalBoundsMixin // Optimized bounds
```

**Event System Integration**:
```typescript
container.on('childAdded', (child) => {});
container.on('childRemoved', (child) => {});
container.on('rendered', () => {});
```

### 3. Sprite System

**File**: `src/scene/sprite/Sprite.ts`

`Sprite` is a specialized `Container` for displaying textures:

```typescript
// Create sprite from texture
const sprite = new Sprite({
    texture: Texture.from('image.png'),
    anchor: { x: 0.5, y: 0.5 },  // Center point
    x: 100,
    y: 100
});

// Sprite properties
sprite.texture             // Current texture
sprite.anchor              // Registration point
sprite.roundPixels         // Pixel-perfect rendering
sprite.blendMode           // Blending mode
```

**Sprite Rendering Path**:
1. Sprite extends `ViewContainer`
2. Provides texture and anchor point
3. Uses batching for optimized rendering
4. Collected by RenderGroup during scene traversal

### 4. Renderer System

**File**: `src/rendering/renderers/autoDetectRenderer.ts`

PixiJS supports multiple rendering backends:

```typescript
// Auto-detection logic
const renderer = await autoDetectRenderer({
    width: 800,
    height: 600,
    preference: 'webgl'  // Priority: webgpu > webgl > canvas
});

// Each renderer type:
// - WebGPURenderer (./gpu/WebGPURenderer.ts)
// - WebGLRenderer (./gl/WebGLRenderer.ts)
// - CanvasRenderer (./canvas/CanvasRenderer.ts)
```

**Renderer Architecture**:

```
Renderer (AbstractRenderer)
├── Systems (context-specific)
│   ├── BackgroundSystem
│   ├── ViewSystem
│   ├── TextureSystem
│   ├── MaskSystem
│   └── [Renderer-specific systems]
│
└── RenderPipes (rendering logic)
    ├── SpritePipe
    ├── GraphicsPipe
    ├── TextPipe
    ├── MeshPipe
    ├── BlendModePipe
    ├── FilterPipe
    └── [More pipes]
```

**Rendering Flow**:
```typescript
1. Collect phase: traverse scene graph, build instructions
2. Sort phase: organize instructions for optimal rendering
3. Execute phase: run instructions, make draw calls
```

### 5. Batching System

**Location**: `src/rendering/batcher/`

Batch rendering optimizes GPU calls by combining similar objects:

```typescript
// Batching process:
1. Collect objects by type (Sprite, Graphics, Text, etc)
2. Group by texture and blend mode
3. Create batch instructions
4. Execute single draw call per batch
5. Reduces draw calls significantly (100+ objects → 1-5 calls)
```

**Key Components**:
- `Batcher`: Main batching orchestrator
- `BatchableElement`: Interface for batchable objects
- Batch groups: Organized by material properties

### 6. Render Pipe System

**File**: `src/rendering/renderers/shared/instructions/RenderPipe.ts`

Pipes handle specific rendering tasks:

```typescript
// InstructionPipe interface
interface InstructionPipe {
    upload?()          // Upload data to GPU
    execute()          // Execute render operation
    push()             // Push effect (filter, mask)
    pop()              // Pop effect
    renderStart?()     // Frame start
    renderEnd?()       // Frame end
}

// Examples:
- SpritePipe: Renders sprites
- GraphicsPipe: Renders vector graphics
- TextPipe: Renders text
- MaskPipe: Applies masks
- BlendModePipe: Sets blend mode
- FilterPipe: Applies filters
```

### 7. Asset Management System

**File**: `src/assets/Assets.ts`

Complete asset loading and caching:

```typescript
// Basic loading
const texture = await Assets.load('image.png');
const textures = await Assets.load(['image1.png', 'image2.png']);

// Bundle loading
await Assets.addBundle('levelAssets', {
    'player': 'assets/player.png',
    'enemy': 'assets/enemy.png'
});
const assets = await Assets.loadBundle('levelAssets');

// Progress tracking
await Assets.load('large-file.zip', (progress) => {
    console.log(`Loading: ${progress * 100}%`);
});

// Asset types supported
- PNG, JPG, WebP textures
- JSON files
- Text files
- Web Fonts
- SVG images
- Video files (MP4, WebM, Ogv)
- Bitmap fonts
- Spritesheets
```

**Asset System Components**:

```
Assets System
├── Loader (./loader/)
│   └── Parsers for each asset type
├── Resolver (./resolver/)
│   └── URL resolution and manifests
├── Cache (./cache/)
│   └── In-memory caching
├── Detections (./detections/)
│   └── Format/capability detection
└── BackgroundLoader
    └── Async pre-loading
```

### 8. Event System

**File**: `src/events/EventSystem.ts`

Federated event system with hit detection:

```typescript
// Event types
- PointerEvent (mouse/touch/pen)
  - pointerdown, pointermove, pointerup
  - pointercancel, pointerleave, pointerenter
  
- MouseEvent
  - click, rightclick, dblclick
  
- WheelEvent
  - wheel

// Event flow
1. Native DOM event
2. EventBoundary receives
3. Hit test (intersection checking)
4. Dispatch to target
5. Bubble up scene graph

// Usage
container.on('pointerdown', (event) => {
    console.log(event.global);  // Global coordinates
    console.log(event.local);   // Local coordinates
});
```

**Event Architecture**:
- `FederatedEventTarget`: Mixin for event capabilities
- `EventBoundary`: Hit testing and dispatch
- `EventSystem`: Event loop management
- `EventTicker`: Timing for event frame

### 9. Ticker System

**File**: `src/ticker/Ticker.ts`

Animation frame management:

```typescript
// Ticker provides frame-synchronized updates
const ticker = new Ticker();

ticker.add((ticker) => {
    // Called once per frame
    sprite.rotation += 0.1 * ticker.deltaTime;
    sprite.x += 100 * (ticker.deltaMS / 1000);
});

ticker.start();

// Ticker properties
ticker.deltaTime      // Frame-relative delta (1.0 at 60fps)
ticker.deltaMS        // Milliseconds elapsed this frame
ticker.elapsedMS      // Raw time elapsed
ticker.lastTime       // Timestamp in ms
ticker.speed          // Playback speed multiplier
ticker.maxFrameSkip    // Max accumulated time per frame
```

### 10. Extension System

**File**: `src/extensions/Extensions.ts`

Plugin architecture for extending PixiJS:

```typescript
// Extension types
enum ExtensionType {
    Application,           // App plugins
    WebGLPipes,           // WebGL render pipes
    WebGPUPipes,          // WebGPU render pipes
    CanvasPipes,          // Canvas render pipes
    Asset,                // Asset loaders
    LoadParser,           // Custom loaders
    ResolveParser,        // URL resolvers
    CacheParser,          // Cache handlers
    MaskEffect,           // Mask types
    BlendMode,            // Custom blend modes
    TextureSource,        // Texture sources
    Environment,          // Environment detection
    ShapeBuilder,         // Custom shape builders
    Batcher,              // Custom batchers
}

// Register extension
extensions.add(MyPlugin);

// Usage in Application
export interface Application extends PixiMixins.Application {
    // Plugins added via extensions.add()
    myCustomFeature?: () => void;
}
```

---

## Plugin Architecture

### Application Plugins

Plugins extend Application functionality:

```typescript
// Plugin structure
class MyPlugin {
    public static extension = ExtensionType.Application;

    static init(options: Partial<ApplicationOptions>) {
        // Called during app initialization
        Object.defineProperty(this, 'myFeature', {
            value: () => console.log('My feature!')
        });
    }

    static destroy() {
        // Cleanup
    }
}

extensions.add(MyPlugin);
```

### Built-in Plugins

1. **ResizePlugin** (`src/app/ResizePlugin.ts`)
   - Auto-resize canvas to match container
   - Handle device pixel ratio

2. **TickerPlugin** (`src/app/TickerPlugin.ts`)
   - Manage animation frame loop
   - Coordinate ticker updates

3. **CullerPlugin**
   - Remove off-screen objects from rendering
   - Improve performance

---

## Rendering Pipeline

### Complete Rendering Flow

```
Application.render()
    ↓
[For each renderer.render({container, target})]
    ↓
1. COLLECTION PHASE
   - Traverse scene graph (depth-first)
   - Collect batchable objects
   - Build instruction set
   ↓
2. INSTRUCTION BUILDING
   - Create RenderGroup instructions
   - Build batches
   - Calculate transforms
   ↓
3. SORTING PHASE
   - Sort instructions for optimal rendering
   - Group by texture/blend mode
   - Minimize GPU state changes
   ↓
4. EXECUTION PHASE
   - For each instruction:
     - Upload data to GPU
     - Set render state
     - Execute render operation
   ↓
5. FINISH
   - Flush remaining batches
   - Cleanup resources
```

### Instruction Set

**File**: `src/rendering/renderers/shared/instructions/InstructionSet.ts`

Instructions are atomic render operations:

```typescript
// Types of instructions
- Batch (draw multiple objects)
- RenderGroup (container group)
- Mask (mask effect)
- Filter (post-process filter)
- BlendMode (state change)
- ViewportTransform (coordinate transform)
```

---

## Asset Management System

### Asset Loading Pipeline

```
Assets.load(urls)
    ↓
1. RESOLUTION
   - Resolve URL to asset path
   - Check cache
   - Return if cached
   ↓
2. PARSING
   - Detect asset type
   - Select appropriate parser
   - Download resource
   ↓
3. PROCESSING
   - Process based on type
   - Create texture/data
   - Cache result
   ↓
4. RETURN
   - Return parsed asset
   - Update progress
```

### Supported Asset Types

```typescript
// Texture assets
- PNG, JPG, WebP, AVIF (images)
- BMP, TIFF (less common)

// Data assets
- JSON (config, data)
- Text (strings)

// Font assets
- Web fonts (TTF, OTF, WOFF)
- Bitmap fonts

// Sprite assets
- Spritesheets (TextureAtlas)
- Animated sprites

// Media assets
- Video (MP4, WebM, Ogv)
- Audio (external)

// Archive assets
- ZIP files
- Basis compressed textures
```

### Cache Strategies

```typescript
// Memory cache
Assets.cache.set('key', value)
Assets.cache.get('key')
Assets.cache.has('key')
Assets.cache.reset()

// Cache plugins
- Memory cache
- Local storage cache (optional)
```

---

## Scene Graph

### Hierarchical Structure

```typescript
// Typical scene hierarchy
Application
└── stage (root Container)
    ├── Layer 1 (Container)
    │   ├── Enemy1 (Sprite)
    │   ├── Enemy2 (Sprite)
    │   └── Enemy3 (Sprite)
    ├── Layer 2 (Container)
    │   ├── Platform (Graphics)
    │   └── Particle Container
    └── UI (Container)
        ├── Button1 (Sprite)
        ├── Button2 (Sprite)
        └── Text (Text)
```

### Transform Hierarchy

Transforms cascade down the hierarchy:

```typescript
// Local transform
sprite.position.set(100, 100)  // Local to parent
sprite.rotation = Math.PI / 4
sprite.scale.set(2)

// Global transform computed from hierarchy
globalTransform = parentGlobalTransform * localTransform

// Used for:
- Rendering position
- Hit testing
- Culling
```

### Bounds Calculation

```typescript
// Local bounds
sprite.getLocalBounds()

// Global bounds (including all transforms)
sprite.getGlobalBounds()

// Parent bounds (includes children)
container.getLocalBounds()
container.getGlobalBounds()
```

---

## Event System

### Event Propagation

```
DOM Event
    ↓
EventSystem receives
    ↓
Hit Test (EventBoundary)
    └─ Check intersection with objects
    └─ Return target object
    ↓
Dispatch Event
    ├─ Fire event on target
    ├─ Bubble up parents
    └─ Fire captured events (if enabled)
    ↓
Complete
```

### Event Types

```typescript
// Pointer events (mouse, touch, pen)
FederatedPointerEvent extends FederatedEvent
├── Properties: pointerId, pointerType, isPrimary
├── Events: pointerdown, pointermove, pointerup, pointercancel
├── Extra: pointerenter, pointerleave, pointertap

// Mouse events
FederatedMouseEvent extends FederatedPointerEvent
├── Events: click, rightclick, dblclick, mouseup, mousedown, mousemove

// Wheel events
FederatedWheelEvent extends FederatedEvent
├── Events: wheel

// Touch events (via pointerdown/up)
```

---

## Extension System

### Extension Registry

```typescript
// Global extension registry
extensions.add(plugin)        // Register single
extensions.add(p1, p2, ...)   // Register multiple
extensions.remove(plugin)     // Unregister
extensions.onExtension(type, handler)  // Listen for type

// Extension lifecycle
1. Register with type
2. Renderer/system discovers
3. Initialize with options
4. Activate for use
5. Destroy on cleanup
```

### Custom Extension Example

```typescript
// Custom blend mode
class MyBlendMode {
    public static extension = ExtensionType.BlendMode;
    
    public static name = 'MyCustomMode';
    
    public glCheck() { /* WebGL */ }
    public glDraw(target) { /* WebGL draw */ }
    
    public gpuCheck() { /* WebGPU */ }
    public gpuDraw(target) { /* WebGPU draw */ }
}

extensions.add(MyBlendMode);

// Use in rendering
sprite.blendMode = 'MyCustomMode';
```

---

## Color Management

**File**: `src/color/Color.ts`

Comprehensive color handling:

```typescript
// Supported formats
const color = new Color('red')              // Color name
const color = new Color(0xff0000)           // Hex integer
const color = new Color('#ff0000')          // Hex string
const color = new Color('rgb(255,0,0)')     // RGB string
const color = new Color({r:255, g:0, b:0})  // RGB object
const color = new Color([1, 0, 0, 1])       // RGBA array

// Conversions
color.toRgbString()     // "rgb(255, 0, 0)"
color.toArray()         // [1, 0, 0, 1]
color.toNumber()        // 0xff0000
color.toHex()          // "#ff0000"

// Utilities
Color.shared            // Global shared instance
Color.temp              // Temporary instance for operations
```

---

## Mathematics Module

**Location**: `src/maths/`

```typescript
// Matrix operations
const matrix = new Matrix()
matrix.translate(100, 100)
matrix.scale(2, 2)
matrix.rotate(Math.PI / 4)
matrix.prepend(otherMatrix)

// Point/Vector math
const point = new Point(100, 100)
const point2 = point.clone()
point.set(50, 50)

// Shapes (for collision/bounds)
new Rectangle(0, 0, 100, 100)
new Circle(100, 100, 50)
new Polygon([0, 0, 100, 0, 50, 100])
new Triangle(...)
new Ellipse(...)
new RoundedRectangle(...)

// Utilities
groupD8              // 8-way grouping
pow2                 // Power of 2
squaredDistanceToLineSegment()
pointInTriangle()
```

---

## Utility Systems

### Object Pooling

```typescript
// Efficient object reuse
const pool = new Pool(Vector2);
const v = pool.acquire();    // Get from pool
v.set(10, 20);
pool.release(v);             // Return to pool
```

### Logging and Deprecation

```typescript
// Debug utilities
import { warn, deprecation } from '../utils/logging'

warn('This is a warning')
deprecation('v8.0.0', 'oldMethod', 'newMethod')
```

### Browser Detection

```typescript
import { isWebGLSupported } from '../utils/browser/isWebGLSupported'
import { isWebGPUSupported } from '../utils/browser/isWebGPUSupported'

if (await isWebGPUSupported()) { /* use WebGPU */ }
if (isWebGLSupported()) { /* use WebGL */ }
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Init                        │
│  - Create Canvas                                              │
│  - Auto-detect Renderer                                       │
│  - Initialize Plugins (Ticker, Resize)                       │
│  - Create Root Stage (Container)                             │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Loop                          │
│  - Ticker fires update event                                 │
│  - User code updates scene                                   │
│  - Renderer.render() called                                  │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Scene Collection Phase                          │
│  - Traverse stage hierarchy (depth-first)                    │
│  - Collect visible objects                                   │
│  - Build transform hierarchy                                 │
│  - Create instructions                                       │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│             Instruction Building Phase                       │
│  - Batch similar objects                                     │
│  - Group by texture/blend mode                               │
│  - Arrange by render order                                   │
│  - Sort for optimal GPU state changes                        │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Execution Phase                                 │
│  - Set viewport/scissor                                      │
│  - For each instruction:                                     │
│    - Upload data to GPU                                      │
│    - Set render state (blend, mask, filter)                  │
│    - Make draw call                                          │
│  - Clear GPU resources                                       │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│           Present to Screen                                  │
│  - WebGL: SwapBuffers                                        │
│  - WebGPU: Present command buffer                            │
│  - Canvas: 2D context renders                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Optimization Strategies

### 1. Batching

- Combine sprites with same texture/blend mode
- Reduces draw calls dramatically
- Automatic in PixiJS

### 2. Culling

- Skip rendering off-screen objects
- Uses bounding box intersection
- Controlled via `cullable` property

### 3. Texture Atlases (Spritesheets)

- Combine multiple textures
- Reduces texture binding overhead
- Improves cache efficiency

### 4. Caching as Texture

- Complex scene → single texture
- Trades render complexity for texture memory
- Use for static UI panels

### 5. Object Pooling

- Reuse objects instead of creating new
- Reduces garbage collection
- Important for particle systems

---

## Summary

PixiJS is structured as a **layered, modular, plugin-based rendering framework**:

1. **Application Layer**: Entry point with lifecycle management
2. **Scene Graph**: Hierarchical display objects with transforms
3. **Asset System**: Complete loader/cache with multiple formats
4. **Rendering Pipeline**: Instruction-based rendering with multiple backends
5. **Extension System**: Pluggable architecture for customization
6. **Event System**: Federated events with hit testing
7. **Utility Layer**: Math, color, logging, pooling

Each layer is **self-contained but interconnected**, allowing developers to use PixiJS at different levels of abstraction—from simple sprite rendering to complex game engines.
