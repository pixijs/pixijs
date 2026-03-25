# pixi_gif_sprite (Extension)

[< Back to nodes](../../gl2D-nodes.md) | [< Back to spec](../../gl2D-spec.md)

A PixiJS-specific node that renders an animated GIF. References a `pixi_gif` resource for frame data.

All nodes also support the [PixiJS Container Extension](../container.md#pixijs-container-extension) for properties like anchor, tint, and more.

Requires `pixi_gif_sprite` in `extensionsUsed` or `extensionsRequired`.

```json
{
    "type": "pixi_gif_sprite",
    "gif": 0,
    "animationSpeed": 1,
    "loop": true,
    "autoPlay": false,
    "autoUpdate": true,
    "currentFrame": 0
}
```

| Name           | Type             | Description                                    | Default | Required |
| -------------- | ---------------- | ---------------------------------------------- | ------- | -------- |
| gif            | number \| string | Reference to a `pixi_gif` resource             |         | Yes      |
| animationSpeed | number           | Playback speed multiplier                      | 1       | No       |
| loop           | boolean          | Whether the animation loops                    | true    | No       |
| autoPlay       | boolean          | Whether to start playing automatically         | false   | No       |
| autoUpdate     | boolean          | Whether to use the shared ticker for updates   | true    | No       |
| currentFrame   | integer          | Frame index to start at (0-based)              | 0       | No       |
