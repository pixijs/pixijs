# Mesh

[< Back to nodes](../gl2D-nodes.md) | [< Back to spec](../gl2D-spec.md)

Renders custom geometry with a texture. Vertex data is stored as flat number arrays.

All nodes also support the [PixiJS Container Extension](container.md#pixijs-container-extension) for properties like anchor, tint, blendMode, and more.

```json
{
    "type": "mesh",
    "texture": 0,
    "vertices": [0, 0, 100, 0, 100, 100, 0, 100],
    "uvs": [0, 0, 1, 0, 1, 1, 0, 1],
    "indices": [0, 1, 2, 0, 2, 3],
    "topology": "triangle-list"
}
```

| Name     | Type             | Description                    | Default         | Required |
| -------- | ---------------- | ------------------------------ | --------------- | -------- |
| texture  | number \| string | Reference to texture resource  |                 | Yes      |
| vertices | number[]         | Flat array of vertex positions |                 | Yes      |
| uvs      | number[]         | Flat array of UV coordinates   |                 | Yes      |
| indices  | number[]         | Triangle index array           |                 | No       |
| topology | string           | Draw topology                  | "triangle-list" | No       |

## Topology Values

| Value            | Description                        |
| ---------------- | ---------------------------------- |
| "point-list"     | Individual points                  |
| "line-list"      | Pairs of points as line segments   |
| "line-strip"     | Connected line segments            |
| "triangle-list"  | Groups of three vertices (default) |
| "triangle-strip" | Connected triangle strip           |
