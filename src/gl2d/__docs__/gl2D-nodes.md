# Nodes

[< Back to spec](./gl2D-spec.md)

Nodes are the **building blocks** of a gl2D scene. They represent containers, sprites, graphics, meshes, text, or other visual elements.

## Graph Constraints

The node graph **must be a forest** (a set of trees):

- No cycles are permitted
- A node may appear in at most one `children` array
- Validators should enforce this constraint

## Core Node Properties

All node types share these core properties:

| Name        | Type                                             | Description                                       | Default | Required |
| ----------- | ------------------------------------------------ | ------------------------------------------------- | ------- | -------- |
| type        | string                                           | Node type discriminator                           |         | Yes      |
| uid         | string                                           | Unique identifier (used for string references)    |         | No       |
| name        | string                                           | Human-readable name                               |         | No       |
| children    | (number \| string)[]                             | References to child nodes                         | []      | No       |
| translation | [number, number]                                 | Position `[x, y]`                                 | [0, 0]  | No       |
| rotation    | number                                           | Rotation in radians (clockwise)                   | 0       | No       |
| scale       | [number, number]                                 | Scale `[x, y]`                                    | [1, 1]  | No       |
| matrix      | [number, number, number, number, number, number] | 2D affine transform matrix `[a, b, c, d, tx, ty]` |         | No       |
| alpha       | number                                           | Opacity (0.0 - 1.0)                               | 1       | No       |
| visible     | boolean                                          | Whether the node is visible                       | true    | No       |
| blendMode   | enum                                             | Blend mode                                        | "normal"| No       |
| mask        | object                                           | Masking options                                   |         | No       |
| extensions  | object                                           | Engine-specific extension data                    |         | No       |

### Blend Mode Values

W3C Compositing spec modes plus common extras:

`normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`, `soft-light`, `difference`, `exclusion`, `hue`, `saturation`, `color`, `luminosity`, `add`, `subtract`, `erase`, `none`

### Masking Options

| Name    | Type             | Description                  | Default | Required |
| ------- | ---------------- | ---------------------------- | ------- | -------- |
| node    | number \| string | Reference to the mask node   |         | Yes      |
| inverse | boolean          | Whether the mask is inverted | false   | No       |

### Transform Mutual Exclusivity

If `matrix` is present, `translation`, `rotation`, and `scale` are **ignored**. A serializer should emit one or the other, never both.

Serializers should **omit fields that match the default value** to reduce file size.

---

## Node Types

| Type                | Description                      | Docs                                                 |
| ------------------- | -------------------------------- | ---------------------------------------------------- |
| `container`         | Groups nodes, applies transforms | [container.md](./nodes/container.md)                 |
| `sprite`            | Texture-based drawable           | [sprite.md](./nodes/sprite.md)                       |
| `tiling_sprite`     | Repeating texture fill           | [tiling-sprite.md](./nodes/tiling-sprite.md)         |
| `nine_slice_sprite` | Scalable with preserved edges    | [nine-slice-sprite.md](./nodes/nine-slice-sprite.md) |
| `text`              | Canvas text rendering            | [text.md](./nodes/text.md)                           |
| `bitmap_text`       | Bitmap font text                 | [bitmap-text.md](./nodes/bitmap-text.md)             |
| `html_text`         | HTML/CSS text rendering          | [html-text.md](./nodes/html-text.md)                 |
| `animated_sprite`   | Frame sequence animation         | [animated-sprite.md](./nodes/animated-sprite.md)     |
| `graphics`          | Vector drawing commands          | [graphics.md](./nodes/graphics.md)                   |
| `mesh`              | Custom geometry                  | [mesh.md](./nodes/mesh.md)                           |
| `particle_container`| Bulk particle rendering          | [particle-container.md](./nodes/particle-container.md)|

### Extension Node Types (PixiJS)

| Type                       | Description                        | Docs                                                                   |
| -------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| `pixi_mesh_plane`          | Subdivided plane mesh              | [mesh-plane.md](./nodes/pixi/mesh-plane.md)                                 |
| `pixi_mesh_rope`           | Geometry along a path              | [mesh-rope.md](./nodes/pixi/mesh-rope.md)                                   |
| `pixi_perspective_mesh`    | Perspective-projected mesh         | [pixi-perspective-mesh.md](./nodes/pixi/pixi-perspective-mesh.md)           |
| `pixi_gif_sprite`          | Animated GIF playback              | [pixi-gif-sprite.md](./nodes/pixi/pixi-gif-sprite.md)                       |
| `pixi_split_text`          | Text split into segments           | [pixi-split-text.md](./nodes/pixi/pixi-split-text.md)                       |
| `pixi_split_bitmap_text`   | Bitmap text split into segments    | [pixi-split-bitmap-text.md](./nodes/pixi/pixi-split-bitmap-text.md)         |
| `pixi_dom_container`       | HTML element in scene graph        | [pixi-dom-container.md](./nodes/pixi/pixi-dom-container.md)                 |

---

## Custom Node Types

Third-party engines may define custom node types via [extensions](./gl2D-extensions.md). A node with an unrecognized type should be treated as a `container` by consumers that don't understand it (children still render, specific behavior is lost).

Custom types must use a **vendor prefix**: `"type": "phaser_tilemap"`.

The type name must appear in `extensionsRequired` if the node's behavior is essential, or `extensionsUsed` if it degrades gracefully.
