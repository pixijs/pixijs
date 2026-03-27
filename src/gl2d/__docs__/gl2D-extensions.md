# Extensions

[< Back to spec](./gl2D-spec.md)

Extensions allow engines to add custom metadata to nodes, resources, and scenes.

## Extension Namespacing

Extension names must use a **vendor prefix**:

- `pixi_` for PixiJS-specific extensions
- `phaser_` for Phaser-specific extensions
- `gl2d_` for spec-blessed standard extensions
- Custom prefixes for third-party engines

---

## Standard Extensions

Standard extensions use the `gl2d_` prefix. They are not part of the core spec but are well-defined and expected to be widely supported.

### gl2d_filters

Applied to nodes. References [filter resources](./gl2D-resources.md#filter). Array order is application order.

```json
{
    "extensions": {
        "gl2d_filters": {
            "filters": [0, "backgroundBlur"]
        }
    }
}
```

| Name    | Type                 | Description                            | Required |
| ------- | -------------------- | -------------------------------------- | -------- |
| filters | (number \| string)[] | Ordered references to filter resources | Yes      |

---

## Extension Registration

- **extensionsUsed**: list of all extensions present in the file
- **extensionsRequired**: list of extensions required to correctly load the file; a consumer that doesn't understand a required extension should refuse to load

```json
"extensionsUsed": ["pixi_container_node", "gl2d_filters"],
"extensionsRequired": ["pixi_texture_resource"]
```

---

## PixiJS Extension Node Types

These node types are specific to PixiJS and use the `pixi_` vendor prefix.

### pixi_mesh_plane

A high-level mesh that generates a subdivided plane from texture dimensions and vertex grid density. See [mesh-plane.md](./nodes/pixi/mesh-plane.md).

Typically in `extensionsUsed` (can be serialized as a plain `mesh` with pre-computed geometry).

### pixi_mesh_rope

A high-level mesh that generates geometry along a path of points. See [mesh-rope.md](./nodes/pixi/mesh-rope.md).

Typically in `extensionsUsed` (can be serialized as a plain `mesh` with pre-computed geometry).

### pixi_perspective_mesh

A mesh with perspective projection from four corner points. See [pixi-perspective-mesh.md](./nodes/pixi/pixi-perspective-mesh.md).

Typically in `extensionsUsed` (falls back to empty container).

### pixi_gif_sprite

Animated GIF playback. Requires a `pixi_gif` resource. See [pixi-gif-sprite.md](./nodes/pixi/pixi-gif-sprite.md).

Typically in `extensionsRequired` (no meaningful fallback without the GIF data).

### pixi_split_text

Canvas-rendered text split into individually transformable lines, words, and characters. See [pixi-split-text.md](./nodes/pixi/pixi-split-text.md).

Typically in `extensionsRequired` (segment transforms are lost without split support).

### pixi_split_bitmap_text

Bitmap font text split into individually transformable lines, words, and characters. See [pixi-split-bitmap-text.md](./nodes/pixi/pixi-split-bitmap-text.md).

Typically in `extensionsRequired` (segment transforms are lost without split support).

### pixi_dom_container

An HTML element integrated into the scene graph. Requires a `pixi_dom_element` resource. See [pixi-dom-container.md](./nodes/pixi/pixi-dom-container.md).

Typically in `extensionsRequired` (browser-specific; no meaningful fallback).

---

## PixiJS Extension Resource Types

### pixi_gif

GIF animation source data. Referenced by `pixi_gif_sprite` nodes.

```json
{
    "type": "pixi_gif",
    "uid": "walkCycle",
    "uri": "assets/walk.gif",
    "fps": 30
}
```

| Name | Type   | Description                                    | Default | Required |
| ---- | ------ | ---------------------------------------------- | ------- | -------- |
| type | string | Must be `"pixi_gif"`                           |         | Yes      |
| uid  | string | Unique identifier                              |         | No       |
| name | string | Human-readable name                            |         | No       |
| uri  | string | Path/URL to the GIF file                       |         | Yes      |
| fps  | number | Fallback FPS if GIF timing data is missing     | 30      | No       |

### pixi_dom_element

Declares a DOM element for use by `pixi_dom_container` nodes. The element can be pre-provided via the consumer's resource map, or resolved at runtime using the optional `selector` fallback.

```json
{
    "type": "pixi_dom_element",
    "uid": "scoreLabel",
    "selector": "#score-label"
}
```

| Name     | Type   | Description                                      | Required |
| -------- | ------ | ------------------------------------------------ | -------- |
| type     | string | Must be `"pixi_dom_element"`                     | Yes      |
| uid      | string | Unique identifier (used as key in resource map)  | Yes      |
| name     | string | Human-readable name                              | No       |
| selector | string | CSS selector fallback for automatic resolution   | No       |

Resolution order: consumer-provided resource map first, then `selector` query, then warn/skip.

---

## Custom Node and Resource Types

Custom [node types](./gl2D-nodes.md#custom-node-types) and resource types are registered as extensions. A consumer encountering an unknown node type should treat it as a `container`. An unknown resource type should be skipped.
