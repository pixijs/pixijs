# Container

[< Back to nodes](../gl2D-nodes.md) | [< Back to spec](../gl2D-spec.md)

Groups other nodes, applies hierarchical transforms.

```json
{
    "type": "container",
    "name": "Player",
    "children": [1, 2],
    "translation": [200, 150],
    "alpha": 0.8,
    "blendMode": "multiply",
    "mask": {
        "node": 3,
        "inverse": false
    }
}
```

Container has no additional core properties beyond the [shared node properties](../gl2D-nodes.md#core-node-properties).

---

## PixiJS Container Extension

```json
{
    "extensions": {
        "pixi_container_node": {
            "origin": [100, 100],
            "skew": [0, 0],
            "pivot": [0, 0],
            "anchor": [0.5, 0.5],
            "width": 200,
            "height": 200,
            "tint": "#ff0000",
            "roundPixels": true,
            "zIndex": 1,
            "isRenderGroup": false,
            "renderable": true,
            "boundsArea": [0, 0, 200, 200],
            "sortableChildren": true
        }
    }
}
```

| Name             | Type             | Description                            | Default  | Required |
| ---------------- | ---------------- | -------------------------------------- | -------- | -------- |
| origin           | [number, number] | Transform origin point in pixels       |          | No       |
| skew             | [number, number] | Skew in radians `[x, y]`               | [0, 0]   | No       |
| pivot            | [number, number] | Pivot point in pixels `[x, y]`         | [0, 0]   | No       |
| anchor           | [number, number] | Anchor point (normalized `[0-1, 0-1]`) | [0, 0]   | No       |
| width            | number           | Explicit width override                |          | No       |
| height           | number           | Explicit height override               |          | No       |
| tint             | string           | Color tint (CSS color string)          |          | No       |
| roundPixels      | boolean          | Whether to round pixel values          | false    | No       |
| zIndex           | number           | Depth sorting order                    | 0        | No       |
| isRenderGroup    | boolean          | Treat as render group                  | false    | No       |
| renderable       | boolean          | Whether node is rendered               | true     | No       |
| boundsArea       | number[]         | Cached bounds area                     |          | No       |
| sortableChildren | boolean          | Auto-sort children by zIndex           | false    | No       |
