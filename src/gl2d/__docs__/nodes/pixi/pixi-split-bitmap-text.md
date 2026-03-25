# pixi_split_bitmap_text (Extension)

[< Back to nodes](../../gl2D-nodes.md) | [< Back to spec](../../gl2D-spec.md)

A PixiJS-specific node that splits bitmap text into individually transformable lines, words, and characters. The deserializer re-splits the text from the input parameters.

All nodes also support the [PixiJS Container Extension](../container.md#pixijs-container-extension) for properties like anchor, tint, and more.

Requires `pixi_split_bitmap_text` in `extensionsUsed` or `extensionsRequired`.

```json
{
    "type": "pixi_split_bitmap_text",
    "text": "Hello World",
    "style": 0,
    "bitmapFont": 1,
    "charAnchor": [0.5, 0.5],
    "wordAnchor": [0.5, 0.5],
    "lineAnchor": [0.5, 0.5],
    "autoSplit": true
}
```

| Name       | Type             | Description                                          | Default | Required |
| ---------- | ---------------- | ---------------------------------------------------- | ------- | -------- |
| text       | string           | The text content to split                            |         | Yes      |
| style      | number \| string | Reference to a `text_style` resource                 |         | Yes      |
| resolution | number           | Resolution of the text rendering                     | 1       | No       |
| bitmapFont | number \| string | Reference to a `bitmap_font` resource                |         | No       |
| charAnchor | [number, number] | Transform origin for characters `[x, y]`            | [0, 0]  | No       |
| wordAnchor | [number, number] | Transform origin for words `[x, y]`                 | [0, 0]  | No       |
| lineAnchor | [number, number] | Transform origin for lines `[x, y]`                 | [0, 0]  | No       |
| autoSplit  | boolean          | Whether to auto-update segments on text/style change | true    | No       |

> **Note:** `resolution` and `bitmapFont` are used during construction to configure text rendering before splitting. They do not map to properties on the `SplitBitmapText` class directly.

---

## Anchor Values

Anchor values are normalized 0-1:

| Value     | Position     |
| --------- | ------------ |
| [0, 0]    | Top-left     |
| [0.5, 0.5]| Center       |
| [1, 1]    | Bottom-right |
