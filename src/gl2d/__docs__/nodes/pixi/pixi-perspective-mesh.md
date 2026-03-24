# pixi_perspective_mesh (Extension)

[< Back to nodes](../../gl2D-nodes.md) | [< Back to spec](../../gl2D-spec.md)

A PixiJS-specific mesh that generates perspective-projected geometry from four corner points. The mesh subdivides the texture across a grid to approximate perspective distortion.

All nodes also support the [PixiJS Container Extension](../container.md#pixijs-container-extension) for properties like anchor, tint, blendMode, and more.

Requires `pixi_perspective_mesh` in `extensionsUsed` or `extensionsRequired`.

```json
{
    "type": "pixi_perspective_mesh",
    "texture": 0,
    "corners": [0, 0, 200, 10, 210, 190, -10, 200],
    "verticesX": 10,
    "verticesY": 10
}
```

| Name      | Type             | Description                                                  | Default | Required |
| --------- | ---------------- | ------------------------------------------------------------ | ------- | -------- |
| texture   | number \| string | Reference to texture resource                                |         | Yes      |
| corners   | number[]         | Flat array of 4 corner points `[x0,y0, x1,y1, x2,y2, x3,y3]` |         | Yes      |
| verticesX | number           | Number of columns in the subdivision grid                    | 10      | No       |
| verticesY | number           | Number of rows in the subdivision grid                       | 10      | No       |

## Corner Winding Order

Corners are specified clockwise starting from the top-left:

```
[x0,y0] -------- [x1,y1]
   |                  |
   |                  |
[x3,y3] -------- [x2,y2]
```

| Index | Position     |
| ----- | ------------ |
| 0,1   | Top-left     |
| 2,3   | Top-right    |
| 4,5   | Bottom-right |
| 6,7   | Bottom-left  |
