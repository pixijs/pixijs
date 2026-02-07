# PixiJS Documentation Index

This directory contains comprehensive documentation for the PixiJS project structure and architecture.

## 📚 Documentation Files

### 1. **ARCHITECTURE.md** (1070+ lines)
Comprehensive architectural guide covering:

- **Project Overview**: High-level description of PixiJS capabilities
- **Core Architecture Layers**: 7-layer architecture visualization
- **Module Organization**: Complete directory structure with descriptions
- **Key Systems**:
  - Application System
  - Container and Scene Graph
  - Sprite System
  - Renderer System (WebGL, WebGPU, Canvas)
  - Batching System
  - Render Pipe System
  - Asset Management System
  - Event System
  - Ticker System
  - Extension System
  - Plugin Architecture
  - Rendering Pipeline
  - Color Management
  - Mathematics Module
  - Utility Systems

**Use this document to understand:**
- Overall architecture and design patterns
- What each module does
- How different systems fit together
- Component responsibilities

---

### 2. **WORKFLOW.md** (1070+ lines)
Detailed workflow documentation showing:

- **Application Initialization**: Complete init flow with file interactions
- **Rendering Pipeline**: Step-by-step render cycle (collect → batch → upload → execute)
- **Asset Loading**: Full asset loader pipeline with caching
- **Scene Graph Updates**: How object changes propagate
- **Event Handling**: Event dispatch, hit testing, bubbling
- **Extension Registration**: Plugin discovery and activation
- **Sprite Rendering**: Complete sprite render cycle
- **Filter and Mask Workflow**: How effects are applied
- **Texture Management**: Texture creation, loading, spritesheets
- **Module Interaction Map**: Dependencies and communication patterns
- **Typical Application Workflows**: Real-world usage examples

**Use this document to understand:**
- Data flow through the system
- How different modules communicate
- Step-by-step execution flows
- File-to-file interactions
- Problem debugging and tracing

---

## 🎯 Quick Navigation

### Learning Paths

**I want to understand...**

| Goal | Document | Section |
|------|----------|---------|
| Overall structure | ARCHITECTURE.md | Module Organization |
| How rendering works | WORKFLOW.md | Rendering Pipeline Workflow |
| How to load assets | WORKFLOW.md | Asset Loading Workflow |
| How events work | WORKFLOW.md | Event Handling Workflow |
| How plugins work | WORKFLOW.md | Extension Registration Workflow |
| File dependencies | WORKFLOW.md | Module Interaction Map |
| Each system's role | ARCHITECTURE.md | Key Systems and Components |
| Performance optimization | ARCHITECTURE.md | Performance Optimization Strategies |

---

## 📊 Architecture at a Glance

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

## 🔄 Key Workflows

### 1. Application Initialization
```
new Application() → init() → autoDetectRenderer() → Create systems → Ready
```

### 2. Rendering Cycle
```
Collect → Batch → Upload → Execute → Display
```

### 3. Asset Loading
```
Resolve → Detect → Load → Parse → Cache → Return
```

### 4. Event Handling
```
DOM Event → Hit Test → Dispatch → Bubble → Complete
```

---

## 📁 Project Structure

```
src/
├── app/                 # Application framework
├── scene/              # Display objects & scene graph
├── rendering/          # Renderers & rendering systems
├── assets/             # Asset loading & caching
├── extensions/         # Plugin system
├── events/             # Event system
├── filters/            # Effect filters
├── color/              # Color management
├── culling/            # Visibility culling
├── maths/              # Mathematics utilities
├── utils/              # General utilities
├── ticker/             # Animation timing
├── accessibility/      # A11y support
├── dom/                # DOM integration
├── environment/        # Environment detection
└── spritesheet/        # Spritesheet support
```

---

## 🔑 Key Concepts

### Layered Architecture
PixiJS uses a **7-layer architecture** with clear separation of concerns, from high-level Application down to low-level Utilities.

### Plugin System
Extensions add functionality without modifying core code. Types include:
- Application Plugins (ResizePlugin, TickerPlugin)
- Render Pipes (rendering specific object types)
- Asset Loaders (custom asset formats)
- Blend Modes (custom blending)

### Scene Graph
Hierarchical tree of display objects:
- Application.stage is root
- Containers can have children
- Transforms cascade down hierarchy
- Rendering traverses depth-first

### Instruction-Based Rendering
Modern rendering approach:
- Collect objects into instructions
- Batch similar instructions
- Upload to GPU once
- Execute efficiently

### Event System
Federated events with features:
- Hit testing for target detection
- Event bubbling up hierarchy
- Multiple pointer support
- Efficient event dispatch

---

## 🚀 Performance Features

1. **Batching**: Combine similar objects → fewer draw calls
2. **Culling**: Skip off-screen objects → faster traversal
3. **Texture Atlas**: Single texture → fewer bindings
4. **Object Pooling**: Reuse objects → less garbage collection
5. **Dynamic Imports**: Load renderers on demand → smaller bundle

---

## 📖 File References

**Core Entry Points:**
- `src/index.ts` - Main export file
- `src/app/Application.ts` - Application class
- `src/scene/container/Container.ts` - Base scene object

**Rendering:**
- `src/rendering/renderers/autoDetectRenderer.ts` - Renderer selection
- `src/rendering/renderers/*/` - Specific renderer implementations

**Asset System:**
- `src/assets/Assets.ts` - Main asset API
- `src/assets/loader/` - Loader implementations
- `src/assets/resolver/` - URL resolution
- `src/assets/cache/` - Caching layer

**Events:**
- `src/events/EventSystem.ts` - Event management
- `src/events/EventBoundary.ts` - Hit testing
- `src/events/FederatedEvent.ts` - Event types

---

## 💡 Tips for Using These Documents

1. **Start with ARCHITECTURE.md** to understand the big picture
2. **Read WORKFLOW.md** sections matching your area of interest
3. **Use the Table of Contents** for quick navigation
4. **Cross-reference** between documents using section links
5. **Follow file paths** mentioned in workflows to understand actual code
6. **Study the diagrams** for visual understanding of data flow

---

## 🤝 Contributing

When modifying PixiJS:
1. Understand the relevant architecture (ARCHITECTURE.md)
2. Trace the workflow (WORKFLOW.md)
3. Consider performance implications
4. Test module interactions
5. Update documentation if architecture changes

---

## ✨ Key Takeaways

**PixiJS is:**
- **Modular**: Each system is self-contained
- **Extensible**: Plugin architecture allows customization
- **High-Performance**: Batching, culling, pooling optimizations
- **Multi-Platform**: WebGL, WebGPU, Canvas renderers
- **Developer-Friendly**: Simple API, comprehensive features

**This makes it perfect for:**
- Web games
- Interactive applications
- Real-time graphics
- Data visualizations
- Any web-based visual project

---

**Document Version**: 1.0  
**PixiJS Version**: 8.16.0  
**Last Updated**: 2026-02-07
