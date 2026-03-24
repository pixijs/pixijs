# Scenes

[< Back to spec](./gl2D-spec.md)

A **scene** is a collection of root nodes. Multiple scenes can exist in one file (e.g., menu, gameplay, credits).

```json
"scenes": [
    {
        "name": "MainScene",
        "nodes": [0, 1],
        "width": 800,
        "height": 600
    }
],
"scene": 0
```

| Name   | Type                 | Description                          | Required |
| ------ | -------------------- | ------------------------------------ | -------- |
| name   | string               | Human-readable name of the scene     | Yes      |
| nodes  | (number \| string)[] | References into the global `nodes[]` | Yes      |
| width  | number               | Design width of the scene in pixels  | No       |
| height | number               | Design height of the scene in pixels | No       |
