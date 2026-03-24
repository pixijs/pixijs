# Tiling Sprite

[< Back to nodes](../gl2D-nodes.md) | [< Back to spec](../gl2D-spec.md)

A **tiling sprite** repeats its texture to fill the node's width and height. Useful for backgrounds, patterns, and infinite scrolling textures.

All nodes also support the [PixiJS Container Extension](container.md#pixijs-container-extension) for properties like anchor, tint, blendMode, and more.

```json
{
    "type": "tiling_sprite",
    "texture": 0,
    "width": 800,
    "height": 600,
    "tileScale": [1, 1],
    "tilePosition": [0, 0],
    "tileRotation": 0
}
```

| Name         | Type             | Description                   | Default | Required |
| ------------ | ---------------- | ----------------------------- | ------- | -------- |
| texture      | number \| string | Reference to texture resource |         | Yes      |
| width        | number           | Width of the tiling area      |         | No       |
| height       | number           | Height of the tiling area     |         | No       |
| tileScale    | [number, number] | Scale of the tiles `[x, y]`   | [1, 1]  | No       |
| tilePosition | [number, number] | Offset of the tiles `[x, y]`  | [0, 0]  | No       |
| tileRotation | number           | Rotation of tiles in radians  | 0       | No       |

---

## PixiJS Tiling Sprite Extension

```json
{
    "extensions": {
        "pixi_tiling_sprite_node": {
            "applyAnchorToTexture": true,
            "clampMargin": 0.5
        }
    }
}
```

| Name                 | Type    | Description                                      | Default | Required |
| -------------------- | ------- | ------------------------------------------------ | ------- | -------- |
| applyAnchorToTexture | boolean | Whether to apply the anchor point to the texture | false   | No       |
| clampMargin          | number  | Texture edge clamping margin to reduce seams     | 0.5     | No       |
