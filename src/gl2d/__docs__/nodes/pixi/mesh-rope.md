# pixi_mesh_rope (Extension)

[< Back to nodes](../../gl2D-nodes.md) | [< Back to spec](../../gl2D-spec.md)

A PixiJS-specific high-level mesh type that generates geometry along a path of points.

All nodes also support the [PixiJS Container Extension](../container.md#pixijs-container-extension) for properties like anchor, tint, and more.

Requires `pixi_mesh_rope` in `extensionsUsed` or `extensionsRequired`.

```json
{
    "type": "pixi_mesh_rope",
    "texture": 0,
    "points": [0, 0, 50, 20, 100, 0, 150, 20],
    "textureScale": 0,
    "autoUpdate": true
}
```

| Name         | Type             | Description                                               | Default | Required |
| ------------ | ---------------- | --------------------------------------------------------- | ------- | -------- |
| texture      | number \| string | Reference to texture resource                             |         | Yes      |
| points       | number[]         | Flat array of `[x, y]` pairs for the path                |         | Yes      |
| textureScale | number           | Texture mode: 0 = stretch, >0 = repeat with scale factor | 0       | No       |
| autoUpdate   | boolean          | Whether vertices auto-update each frame                   | true    | No       |
