# Bitmap Text

[< Back to nodes](../gl2D-nodes.md) | [< Back to spec](../gl2D-spec.md)

Renders text using a pre-rendered [bitmap font](../gl2D-resources.md#bitmap-font) atlas for improved performance.

All nodes also support the [PixiJS Container Extension](container.md#pixijs-container-extension) for properties like anchor, tint, and more.

```json
{
    "type": "bitmap_text",
    "text": "Score: 1000",
    "style": 1,
    "resolution": 1,
    "bitmapFont": 0
}
```

| Name       | Type             | Description                       | Default | Required |
| ---------- | ---------------- | --------------------------------- | ------- | -------- |
| text       | string           | The text content to display       |         | Yes      |
| style      | number \| string | Reference to text style resource  |         | Yes      |
| resolution | number           | Resolution of the text rendering  | 1       | No       |
| bitmapFont | number \| string | Reference to bitmap font resource |         | No       |

