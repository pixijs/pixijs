# HTML Text

[< Back to nodes](../gl2D-nodes.md) | [< Back to spec](../gl2D-spec.md)

Renders HTML/CSS content into a texture.

All nodes also support the [PixiJS Container Extension](container.md#pixijs-container-extension) for properties like anchor, tint, and more.

```json
{
    "type": "html_text",
    "text": "<b>Hello</b> <i>World</i>",
    "style": 0
}
```

| Name       | Type             | Description                      | Default | Required |
| ---------- | ---------------- | -------------------------------- | ------- | -------- |
| text       | string           | HTML content to display          |         | Yes      |
| style      | number \| string | Reference to text style resource |         | Yes      |
| resolution | number           | Resolution of the text rendering | 1       | No       |
| webFont    | number \| string | Reference to web font resource   |         | No       |

---

## PixiJS HTML Text Extension

```json
{
    "extensions": {
        "pixi_html_text_node": {
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
