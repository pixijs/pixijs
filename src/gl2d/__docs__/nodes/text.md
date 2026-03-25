# Text

[< Back to nodes](../gl2D-nodes.md) | [< Back to spec](../gl2D-spec.md)

Renders text content using a specified [text style](../gl2D-resources.md#text-style) and optional [web font](../gl2D-resources.md#web-font).

All nodes also support the [PixiJS Container Extension](container.md#pixijs-container-extension) for properties like anchor, tint, and more.

```json
{
    "type": "text",
    "text": "Hello World!",
    "style": 0,
    "resolution": 1,
    "webFont": 0
}
```

| Name       | Type             | Description                      | Default | Required |
| ---------- | ---------------- | -------------------------------- | ------- | -------- |
| text       | string           | The text content to display      |         | Yes      |
| style      | number \| string | Reference to text style resource |         | Yes      |
| resolution | number           | Resolution of the text rendering | 1       | No       |
| webFont    | number \| string | Reference to web font resource   |         | No       |

---

## PixiJS Text Extension

```json
{
    "extensions": {
        "pixi_text_node": {
            "textureStyle": {
                "scaleMode": "linear"
            },
            "autoGenerateMipmaps": false
        }
    }
}
```

| Name                 | Type    | Description                                   | Default | Required |
| -------------------- | ------- | --------------------------------------------- | ------- | -------- |
| textureStyle         | object  | Texture style options for the internal texture |         | No       |
| autoGenerateMipmaps  | boolean | Generate mipmaps for the text texture          | false   | No       |
