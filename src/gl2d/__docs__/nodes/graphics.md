# Graphics

[< Back to nodes](../gl2D-nodes.md) | [< Back to spec](../gl2D-spec.md)

Renders vector graphics from a shared [graphics context](../gl2D-resources.md#graphics-context) resource.

All nodes also support the [PixiJS Container Extension](container.md#pixijs-container-extension) for properties like anchor, tint, and more.

```json
{
    "type": "graphics",
    "context": 0
}
```

| Name    | Type             | Description                            | Default | Required |
| ------- | ---------------- | -------------------------------------- | ------- | -------- |
| context | number \| string | Reference to graphics_context resource |         | Yes      |

