# PixiJS Quick Reference

A condensed reference for quick lookup of PixiJS architecture and workflows.

---

## 🔍 Quick Lookup Table

| Topic | File | Location |
|-------|------|----------|
| Project structure | ARCHITECTURE.md | Module Organization |
| Layer breakdown | ARCHITECTURE.md | Core Architecture Layers |
| App initialization | WORKFLOW.md | Application Initialization Workflow |
| Rendering cycle | WORKFLOW.md | Rendering Pipeline Workflow |
| Asset loading | WORKFLOW.md | Asset Loading Workflow |
| Event dispatch | WORKFLOW.md | Event Handling Workflow |
| Plugin system | ARCHITECTURE.md | Extension System |
| Scene graph | ARCHITECTURE.md | Scene Graph |
| Performance | ARCHITECTURE.md | Performance Optimization Strategies |

---

## 🎯 Common Questions & Answers

### "Where does rendering happen?"
- **Answer**: `src/rendering/renderers/` (WebGL, WebGPU, Canvas)
- **Flow**: Application.render() → RenderGroup collection → Pipe execution
- **See**: WORKFLOW.md → Rendering Pipeline Workflow

### "How are assets loaded?"
- **Answer**: `src/assets/` (Loader, Cache, Resolver)
- **Flow**: Assets.load() → Resolve → Detect → Load → Parse → Cache
- **See**: WORKFLOW.md → Asset Loading Workflow

### "How do events work?"
- **Answer**: `src/events/` with EventBoundary for hit testing
- **Flow**: DOM event → Hit test → Dispatch to target → Bubble up
- **See**: WORKFLOW.md → Event Handling Workflow

### "How to extend PixiJS?"
- **Answer**: Use extension system in `src/extensions/`
- **Types**: Application, RenderPipes, AssetLoaders, BlendModes, etc.
- **See**: ARCHITECTURE.md → Extension System

### "What is the scene graph?"
- **Answer**: Hierarchical tree of display objects
- **Root**: Application.stage (Container)
- **Purpose**: Transform hierarchy, render ordering, event propagation
- **See**: ARCHITECTURE.md → Scene Graph

### "How does batching improve performance?"
- **Answer**: Groups similar objects → fewer draw calls
- **Example**: 100 sprites with same texture → 1 draw call
- **See**: ARCHITECTURE.md → Performance Optimization Strategies

---

## 📊 File Dependency Map

```
Application (app/Application.ts)
    ├─→ Renderer (rendering/renderers/*)
    │   ├─→ RenderPipes (rendering/renderers/*/pipes/)
    │   ├─→ Systems (rendering/renderers/shared/system/)
    │   └─→ TextureSystem (rendering/renderers/shared/texture/)
    │
    ├─→ Stage Container (scene/container/Container.ts)
    │   ├─→ Sprite (scene/sprite/Sprite.ts)
    │   ├─→ Graphics (scene/graphics/*)
    │   ├─→ Text (scene/text/*)
    │   └─→ RenderGroup (scene/container/RenderGroup.ts)
    │
    ├─→ Ticker (ticker/Ticker.ts)
    │
    ├─→ Assets (assets/Assets.ts)
    │   ├─→ Loader (assets/loader/)
    │   ├─→ Resolver (assets/resolver/)
    │   └─→ Cache (assets/cache/)
    │
    ├─→ EventSystem (events/EventSystem.ts)
    │   └─→ EventBoundary (events/EventBoundary.ts)
    │
    └─→ Extensions (extensions/Extensions.ts)
        └─→ Plugins (various)
```

---

## 🔄 Core Workflows at a Glance

### 1. Application Setup (30 seconds)
```typescript
const app = new Application();
await app.init({ width: 800, height: 600 });
document.body.appendChild(app.canvas);
// → Auto-detects renderer
// → Initializes systems & pipes
// → Ready to use
```

### 2. Add Sprite (10 seconds)
```typescript
const texture = await Assets.load('image.png');
const sprite = new Sprite(texture);
app.stage.addChild(sprite);
// → Next render includes sprite
```

### 3. Update Animation (5 seconds)
```typescript
app.ticker.add((ticker) => {
    sprite.rotation += 0.1 * ticker.deltaTime;
});
// → Called every frame
// → Frame-independent animation
```

### 4. Handle Click (5 seconds)
```typescript
sprite.eventMode = 'auto';
sprite.on('pointerdown', () => console.log('clicked!'));
// → Hit tested automatically
// → Event dispatched to sprite
```

---

## 🏗️ Architecture Summary

### Layers (Top to Bottom)

1. **Application Layer**
   - User-facing API
   - Lifecycle management
   - Files: `app/`

2. **Scene Layer**
   - Display objects (Sprite, Graphics, Text)
   - Hierarchy & transforms
   - Files: `scene/`

3. **Asset Layer**
   - Loading & caching
   - Format detection
   - Files: `assets/`

4. **Rendering Pipeline**
   - Collection, batching, instruction building
   - Files: `rendering/renderers/shared/`

5. **Renderer Layer**
   - Backend-specific rendering
   - WebGL, WebGPU, Canvas
   - Files: `rendering/renderers/gl|gpu|canvas/`

6. **System Layer**
   - Utilities & infrastructure
   - Extensions, events, environment
   - Files: `extensions/`, `events/`, `environment/`

7. **Utility Layer**
   - Math, color, logging, pooling
   - Files: `maths/`, `color/`, `utils/`

---

## 📈 Data Flow Diagram

```
User Code
    ↓
Application.init()
    ↓
Create Renderer (auto-detect)
    ↓
Initialize Systems & Pipes
    ↓
Create Stage (root Container)
    ↓
User adds children to stage
    ↓
Ticker fires each frame
    ↓
User code updates scene
    ↓
RenderGroup marked dirty
    ↓
Collect phase: Traverse scene
    ↓
Batch phase: Group objects
    ↓
Upload phase: Send to GPU
    ↓
Execute phase: Draw calls
    ↓
Present to screen
```

---

## 🎮 Usage Patterns

### Pattern 1: Simple Rendering
```typescript
// Just display something
const sprite = new Sprite(texture);
app.stage.addChild(sprite);
// Done! Automatically renders each frame
```

### Pattern 2: Interactive Game
```typescript
// Update on events + timer
sprite.on('click', (event) => {
    sprite.rotation += 0.1;
});

app.ticker.add((ticker) => {
    sprite.y += 100 * ticker.deltaMS / 1000;
});
```

### Pattern 3: Complex Effects
```typescript
// Apply filters & masks
container.filters = [new BlurFilter()];
container.mask = maskShape;
// Automatically applied during render
```

### Pattern 4: Batch Loading
```typescript
// Load multiple assets
await Assets.loadBundle('level1', (progress) => {
    console.log(`Loading: ${progress * 100}%`);
});
// Access via Assets.get()
```

---

## ⚡ Performance Tips

| Tip | Benefit | Implementation |
|-----|---------|-----------------|
| Use spritesheets | Fewer textures | `Spritesheet.from()` |
| Enable culling | Skip off-screen | `container.cullable = true` |
| Use object pools | Less GC | Manual pooling with Pool class |
| Batch similar objects | Fewer draw calls | Automatic via batching system |
| Cache as texture | Complex → simple | `container.cacheAsTexture()` |
| Use render groups | Organize scene | `Container` hierarchy |

---

## 🔧 File Navigation

### Finding Things

**"Where is the Container class?"**
→ `src/scene/container/Container.ts`

**"Where is the Sprite class?"**
→ `src/scene/sprite/Sprite.ts`

**"Where is the WebGL renderer?"**
→ `src/rendering/renderers/gl/WebGLRenderer.ts`

**"Where is asset loading?"**
→ `src/assets/Assets.ts`

**"Where is event handling?"**
→ `src/events/EventSystem.ts`

**"Where are the mixins defined?"**
→ `src/scene/container/container-mixins/`

**"Where is the ticker?"**
→ `src/ticker/Ticker.ts`

---

## 📚 Reading Recommendations

### For Beginners
1. Read DOCUMENTATION_INDEX.md (this section)
2. Read ARCHITECTURE.md sections: Project Overview, Core Architecture Layers
3. Read WORKFLOW.md sections: Application Initialization, Sprite Rendering

### For Intermediate
1. Read all of ARCHITECTURE.md
2. Read WORKFLOW.md sections: Rendering Pipeline, Event Handling
3. Study module dependencies

### For Advanced
1. Deep dive into WORKFLOW.md
2. Study data flow diagrams
3. Trace through specific systems (rendering, batching, events)
4. Read actual source code files mentioned

---

## 🎯 Key Code Locations

```
Entry Points:
  - src/index.ts               Main export
  - src/app/Application.ts     Application class

Scene Objects:
  - src/scene/container/Container.ts       Container
  - src/scene/sprite/Sprite.ts             Sprite
  - src/scene/graphics/*/                  Graphics
  - src/scene/text/Text.ts                 Text

Rendering:
  - src/rendering/renderers/autoDetectRenderer.ts
  - src/rendering/renderers/gl/WebGLRenderer.ts
  - src/rendering/renderers/gpu/WebGPURenderer.ts
  - src/rendering/renderers/canvas/CanvasRenderer.ts

Systems:
  - src/rendering/renderers/shared/system/AbstractRenderer.ts
  - src/rendering/renderers/shared/texture/TextureSystem.ts
  - src/rendering/mask/MaskEffectManager.ts

Pipes:
  - src/rendering/renderers/*/pipes/SpritePipe.ts
  - src/rendering/renderers/*/pipes/GraphicsPipe.ts
  - src/filters/FilterPipe.ts

Assets:
  - src/assets/Assets.ts           Main API
  - src/assets/loader/Loader.ts    Loader
  - src/assets/resolver/Resolver.ts Resolver
  - src/assets/cache/Cache.ts      Cache

Events:
  - src/events/EventSystem.ts      Event system
  - src/events/EventBoundary.ts    Hit testing
  - src/events/FederatedEvent.ts   Event types

Utilities:
  - src/maths/                     Math utilities
  - src/color/Color.ts             Color
  - src/utils/                     General utilities
  - src/ticker/Ticker.ts           Animation ticker
```

---

## 💬 Common Code Patterns

### Add child to container
```typescript
container.addChild(sprite);
```

### Listen to event
```typescript
container.on('pointerdown', (event) => {});
```

### Update each frame
```typescript
app.ticker.add((ticker) => {
    // Called every frame
});
```

### Load asset
```typescript
const texture = await Assets.load('image.png');
```

### Create sprite
```typescript
const sprite = new Sprite(texture);
```

### Apply filter
```typescript
container.filters = [new BlurFilter()];
```

### Apply mask
```typescript
container.mask = maskShape;
```

### Get bounds
```typescript
const bounds = sprite.getBounds();
```

### Transform coordinates
```typescript
const localPoint = container.toLocal(globalPoint);
```

---

## 🚀 Quick Checklist

Starting a new PixiJS project?

- [ ] Create Application
- [ ] Initialize with options
- [ ] Add to DOM
- [ ] Load assets
- [ ] Create display objects
- [ ] Add to stage
- [ ] Attach event handlers
- [ ] Add ticker callbacks
- [ ] Start rendering loop

---

## 📖 Document Index

| Document | Purpose | Length |
|----------|---------|--------|
| DOCUMENTATION_INDEX.md | Navigation & overview | Medium |
| ARCHITECTURE.md | System design & structure | Long (~1070 lines) |
| WORKFLOW.md | Data flow & interactions | Long (~1070 lines) |
| QUICK_REFERENCE.md | This file - quick lookup | Short |

---

## 🎓 Learning Path

```
START HERE
    ↓
Read: DOCUMENTATION_INDEX.md
    ↓
Read: ARCHITECTURE.md (Module Organization section)
    ↓
Read: WORKFLOW.md (Application Initialization section)
    ↓
Choose specific topic → Read relevant section
    ↓
Check QUICK_REFERENCE.md for file locations
    ↓
Read source code files
```

---

## ❓ Need Help?

1. **Quick answer?** → Check QUICK_REFERENCE.md
2. **Understanding architecture?** → Read ARCHITECTURE.md
3. **Tracing data flow?** → Check WORKFLOW.md
4. **Finding a file?** → Use file paths in QUICK_REFERENCE.md
5. **Overall navigation?** → Start with DOCUMENTATION_INDEX.md

---

**Version**: 1.0  
**PixiJS**: 8.16.0  
**Purpose**: Quick lookup reference for PixiJS documentation
