# pixi_mesh_plane (Extension)

[< Back to nodes](../../gl2D-nodes.md) | [< Back to spec](../../gl2D-spec.md)

A PixiJS-specific high-level mesh type that generates a subdivided plane. The plane geometry is constructed from the texture dimensions and vertex grid density.

All nodes also support the [PixiJS Container Extension](../container.md#pixijs-container-extension) for properties like anchor, tint, blendMode, and more.

Requires `pixi_mesh_plane` in `extensionsUsed` or `extensionsRequired`.

```json
{
    "type": "pixi_mesh_plane",
    "texture": 0,
    "verticesX": 10,
    "verticesY": 10,
    "autoResize": true
}
```

| Name       | Type             | Description                                     | Default | Required |
| ---------- | ---------------- | ----------------------------------------------- | ------- | -------- |
| texture    | number \| string | Reference to texture resource                   |         | Yes      |
| verticesX  | number           | Columns of vertices                             | 10      | No       |
| verticesY  | number           | Rows of vertices                                | 10      | No       |
| autoResize | boolean          | Whether geometry auto-updates on texture change | true    | No       |
