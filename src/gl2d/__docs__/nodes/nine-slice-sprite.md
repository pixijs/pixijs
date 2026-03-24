# Nine Slice Sprite

[< Back to nodes](../gl2D-nodes.md) | [< Back to spec](../gl2D-spec.md)

A **nine-slice sprite** scales its texture while preserving corners and edges.

All nodes also support the [PixiJS Container Extension](container.md#pixijs-container-extension) for properties like anchor, tint, blendMode, and more.

```json
{
    "type": "nine_slice_sprite",
    "texture": 0,
    "width": 200,
    "height": 100,
    "leftWidth": 10,
    "topHeight": 10,
    "rightWidth": 10,
    "bottomHeight": 10
}
```

| Name         | Type             | Description                     | Default | Required |
| ------------ | ---------------- | ------------------------------- | ------- | -------- |
| texture      | number \| string | Reference to texture resource   |         | Yes      |
| width        | number           | Width of the nine-slice sprite  |         | No       |
| height       | number           | Height of the nine-slice sprite |         | No       |
| leftWidth    | number           | Width of the left column        | 10      | No       |
| topHeight    | number           | Height of the top row           | 10      | No       |
| rightWidth   | number           | Width of the right column       | 10      | No       |
| bottomHeight | number           | Height of the bottom row        | 10      | No       |

