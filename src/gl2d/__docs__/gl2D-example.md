# Example Full File

[< Back to spec](./gl2D-spec.md)

```json
{
    "asset": {
        "version": "1.0",
        "generator": "PixiJS"
    },
    "scene": 0,
    "scenes": [
        {
            "name": "MainScene",
            "nodes": [0],
            "width": 800,
            "height": 600
        }
    ],
    "nodes": [
        {
            "type": "container",
            "uid": "root",
            "name": "Root",
            "children": ["hero", "scoreText"],
            "translation": [100, 100]
        },
        {
            "type": "sprite",
            "uid": "hero",
            "name": "Hero",
            "texture": "heroTexture",
            "translation": [50, 0],
            "extensions": {
                "pixi_container_node": {
                    "anchor": [0.5, 0.5]
                },
                "pixi_sprite_node": {
                    "roundPixels": true
                }
            }
        },
        {
            "type": "text",
            "uid": "scoreText",
            "name": "Score",
            "text": "Score: 0",
            "style": "heading",
            "translation": [0, -50]
        }
    ],
    "resources": [
        {
            "type": "texture",
            "uid": "heroTexture",
            "source": "heroImage",
            "extensions": {
                "pixi_texture_resource": {
                    "orig": [0, 0, 64, 64],
                    "trim": [0, 0, 64, 64],
                    "defaultAnchor": [0.5, 0.5],
                    "rotate": 0,
                    "dynamic": false
                }
            }
        },
        {
            "type": "image_source",
            "uid": "heroImage",
            "uri": "/textures/hero.png"
        },
        {
            "type": "text_style",
            "uid": "heading",
            "fontFamily": ["Arial", "sans-serif"],
            "fontSize": 24,
            "fill": "#ffffff"
        }
    ],
    "extensionsUsed": [
        "pixi_container_node",
        "pixi_sprite_node",
        "pixi_texture_resource"
    ]
}
```
