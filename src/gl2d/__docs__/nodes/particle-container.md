# Particle Container

[< Back to nodes](../gl2D-nodes.md) | [< Back to spec](../gl2D-spec.md)

Renders a large number of particles efficiently using a shared texture. Particle data is stored as parallel flat arrays for compact serialization and direct GPU buffer mapping.

All nodes also support the [PixiJS Container Extension](container.md#pixijs-container-extension) for properties like anchor, tint, blendMode, and more.

Particle containers do not support scene graph children. Wrap in a `container` node for hierarchy.

```json
{
    "type": "particle_container",
    "texture": 0,
    "positions": [10, 20, 30, 40, 50, 60],
    "rotations": [0, 0.5, 1.0],
    "scales": [1, 1, 0.5, 0.5, 2, 2],
    "tints": ["#ffffff", "#ff0000", "#00ff00"],
    "alphas": [1, 0.8, 0.5]
}
```

| Name      | Type             | Description                                       | Default | Required |
| --------- | ---------------- | ------------------------------------------------- | ------- | -------- |
| texture   | number \| string | Reference to shared texture resource               |         | Yes      |
| positions | number[]         | Flat array of `[x, y]` pairs per particle          |         | Yes      |
| rotations | number[]         | One rotation (radians) per particle                |         | No       |
| scales    | number[]         | Flat array of `[x, y]` pairs per particle          |         | No       |
| tints     | string[]         | One CSS color string per particle                  |         | No       |
| alphas    | number[]         | One opacity value (0.0-1.0) per particle           |         | No       |

## Array Lengths

- `positions` must have an even number of elements; particle count is `positions.length / 2`
- `rotations` must have exactly `particleCount` elements (if present)
- `scales` must have exactly `particleCount * 2` elements (if present)
- `tints` must have exactly `particleCount` elements (if present)
- `alphas` must have exactly `particleCount` elements (if present)

## Defaults for Omitted Arrays

When an optional array is omitted, all particles use the default value:

| Array     | Default per particle |
| --------- | -------------------- |
| rotations | 0                    |
| scales    | [1, 1]               |
| tints     | "#ffffff"            |
| alphas    | 1                    |
