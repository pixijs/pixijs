# pixi_dom_container (Extension)

[< Back to nodes](../../gl2D-nodes.md) | [< Back to spec](../../gl2D-spec.md)

A PixiJS-specific node that integrates an HTML element into the scene graph. References a `pixi_dom_element` resource that declares which element to use.

All nodes also support the [PixiJS Container Extension](../container.md#pixijs-container-extension) for properties like anchor, tint, and more.

This is a browser-specific node type. Non-browser consumers cannot render it meaningfully.

Requires `pixi_dom_container` in `extensionsUsed` or `extensionsRequired`.

```json
{
    "type": "pixi_dom_container",
    "element": "scoreLabel",
    "anchor": [0.5, 0.5]
}
```

| Name    | Type             | Description                              | Default | Required |
| ------- | ---------------- | ---------------------------------------- | ------- | -------- |
| element | number \| string | Reference to a `pixi_dom_element` resource |         | Yes      |
| anchor  | [number, number] | Anchor point `[x, y]` (0-1 normalized)  | [0, 0]  | No       |

## Anchor Values

| Value     | Position     |
| --------- | ------------ |
| [0, 0]    | Top-left     |
| [0.5, 0.5]| Center       |
| [1, 1]    | Bottom-right |
