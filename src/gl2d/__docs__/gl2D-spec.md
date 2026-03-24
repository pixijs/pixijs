# gl2D File Format Specification

## 1. Introduction

The **gl2D file format** is a JSON-based scene description format designed for 2D rendering engines. It provides a structured way to describe:

- **Scenes** (collections of nodes)
- **Nodes** (containers, sprites, graphics, meshes, text, etc.)
- **Resources** (textures, images, videos, fonts, graphics contexts, filters, etc.)
- **Extensions** (engine-specific metadata)

gl2D is inspired by **glTF** but tailored for **2D graphics**, focusing on lightweight serialization, hierarchical scene graphs, and efficient resource referencing.

### Design Principles

- **Engine-agnostic core**: core properties are the intersection of what all 2D scene graphs support
- **Open type system**: third-party node types and resource types via extensions
- **Machine-generated, human-readable**: authored by tools and serialize/deserialize APIs, but debuggable by humans
- **Static snapshot**: describes scene state at a point in time; no data binding or runtime behavior

### Coordinate System

gl2D uses a **y-down** coordinate system, matching web/canvas convention. The origin `[0, 0]` is the top-left corner. Positive x is right, positive y is down. Rotation is clockwise in radians.

### Naming Conventions

- **Type and extension names**: `snake_case` (e.g., `tiling_sprite`, `pixi_container_node`)
- **Property names**: `camelCase` (e.g., `blendMode`, `tilePosition`)

### Color Format

All color values across the spec use **CSS color strings**: `"#RRGGBB"`, `"#RRGGBBAA"`, `"rgba(r, g, b, a)"`, or any valid CSS color value.

### Reference Model

Resources and nodes can be referenced by **integer index** (position in the array) or **string ID** (matching the target's `uid` field). String IDs are the canonical reference mechanism; indices are an optimization for compact serialization.

A deserializer should check for string first, fall back to number. A serializer may emit either form.

```json
"texture": 0
"texture": "heroTexture"
```

---

## 2. File Structure Overview

A gl2D file is a single JSON object with the following top-level structure:

```json
{
    "asset": { ... },
    "scene": 0,
    "scenes": [ ... ],
    "nodes": [ ... ],
    "resources": [ ... ],
    "extensionsUsed": [],
    "extensionsRequired": []
}
```

| Name               | Type             | Description                    | Required |
| ------------------ | ---------------- | ------------------------------ | -------- |
| asset              | object           | Metadata about the gl2D asset  | Yes      |
| scene              | number \| string | Reference to the default scene | No       |
| scenes             | array            | Array of scene definitions     | No       |
| nodes              | array            | Array of node definitions      | No       |
| resources          | array            | Array of resource definitions  | No       |
| extensionsUsed     | string[]         | List of used extensions        | No       |
| extensionsRequired | string[]         | List of required extensions    | No       |

---

## 3. Asset Metadata

The `asset` object describes the generator and versioning:

```json
"asset": {
    "version": "1.0",
    "generator": "PixiJS",
    "minVersion": "1.0"
}
```

| Name       | Type   | Description                        | Required |
| ---------- | ------ | ---------------------------------- | -------- |
| version    | string | gl2D spec version (semver)         | Yes      |
| generator  | string | Tool/library that created the file | No       |
| minVersion | string | Minimum gl2D version required      | No       |

### Versioning

gl2D follows **semver** semantics:

- **Minor** versions are additive only (new node types, resource types, optional fields)
- **Major** versions may introduce breaking changes
- `minVersion` tells the consumer "you need at least this version to render this file correctly"
- A v1.0 consumer loading a v1.1 file with only additive features works fine

---

## Spec Contents

- [Scenes](./gl2D-scenes.md)
- [Nodes](./gl2D-nodes.md)
- [Resources](./gl2D-resources.md)
- [Extensions](./gl2D-extensions.md)
- [Example](./gl2D-example.md)
- [JSON Schema](./gl2D-schema.json)
