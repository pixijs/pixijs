# Animated Sprite

[< Back to nodes](../gl2D-nodes.md) | [< Back to spec](../gl2D-spec.md)

Renders a sequence of texture frames as an animation.

All nodes also support the [PixiJS Container Extension](container.md#pixijs-container-extension) for properties like anchor, tint, blendMode, and more.

The frame source is specified using **one** of two mutually exclusive approaches:

- **`textures`**: an array of texture references (for loose textures)
- **`animation`**: a named animation within a [spritesheet](../gl2D-resources.md#spritesheet) resource

```json
{
    "type": "animated_sprite",
    "textures": [0, 1, 2, 3],
    "animationSpeed": 1,
    "loop": true,
    "autoPlay": false
}
```

```json
{
    "type": "animated_sprite",
    "spritesheet": 0,
    "animation": "hero_idle",
    "animationSpeed": 0.5,
    "loop": true,
    "autoPlay": true
}
```

| Name           | Type                 | Description                                                               | Default | Required |
| -------------- | -------------------- | ------------------------------------------------------------------------- | ------- | -------- |
| textures       | (number \| string)[] | Array of texture references (mutually exclusive with animation)           |         | No       |
| spritesheet    | number \| string     | Reference to spritesheet resource                                         |         | No       |
| animation      | string               | Named animation within the spritesheet (mutually exclusive with textures) |         | No       |
| animationSpeed | number               | Playback speed multiplier                                                 | 1       | No       |
| loop           | boolean              | Whether the animation loops                                               | true    | No       |
| autoPlay       | boolean              | Whether to start playing automatically                                    | false   | No       |
| currentFrame   | integer              | Frame index to start at (0-based)                                         | 0       | No       |

Either `textures` OR (`spritesheet` + `animation`) must be provided. Not both.

---

### PixiJS Animated Sprite Extension

```json
{
    "extensions": {
        "pixi_animated_sprite_node": {
            "autoUpdate": true,
            "updateAnchor": false
        }
    }
}
```

| Name         | Type    | Description                                         | Default | Required |
| ------------ | ------- | --------------------------------------------------- | ------- | -------- |
| autoUpdate   | boolean | Whether to use the shared ticker for updates        | true    | No       |
| updateAnchor | boolean | Whether to update anchor to texture's defaultAnchor | false   | No       |
