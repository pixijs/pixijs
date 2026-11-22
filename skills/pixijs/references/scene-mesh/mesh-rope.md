# MeshRope

A texture stretched or tiled along a polyline of points (ropes, trails, tentacles). v7's `SimpleRope(texture, points)` is `new MeshRope({ texture, points })`.

```ts
const points: Point[] = [];
for (let i = 0; i < 20; i++) points.push(new Point(i * 50, 0));

const rope = new MeshRope({ texture: tex, points, textureScale: 0 });

app.ticker.add(() => {
  const t = performance.now() / 500;
  points.forEach((p, i) => (p.y = Math.sin(i * 0.5 + t) * 30));
});
```

The texture's x-axis runs along the path and its y-axis is the thickness. The rope bends only at points, so a visible curve needs many closely spaced points (typically 15–30); two points draw a straight segment. With `autoUpdate` on (default), moving the points updates the geometry on the next render.

Two silent traps:

- **Keep the point count fixed.** With `textureScale: 0` the buffers are sized once from the initial array; points pushed later are never drawn. Preallocate the full length (a trail of N points shifted each frame), or create a new rope when the count changes. `textureScale > 0` rebuilds on every update and does follow the length.
- **Thickness is `texture.height`, not `width`.** The rope's render hook resets the geometry width to `texture.height` every frame, so the `width` option only lasts until the first render. Use a texture whose height is the thickness you want, or replace the hook:

```ts
declare const points: Point[];
const thick = new MeshRope({ texture: tex, points, width: 60 });
thick.onRender = () => (thick.geometry as RopeGeometry).update();
```

## Options

| Option         | Default          | Notes                                                                                                                       |
| -------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `texture`      | —                | Required.                                                                                                                   |
| `points`       | —                | Required. `PointData[]`, the ordered path.                                                                                  |
| `textureScale` | `0`              | `0` stretches the texture over the full length. `> 0` repeats it at its aspect ratio, scales the thickness to `texture.height * textureScale`, and sets the shared source's `addressMode` to `'repeat'`. Values `< 1` with a larger source reduce alpha artifacts. |
| `width`        | `texture.height` | Overwritten with `texture.height` on the first render (see above).                                                          |

`geometry` is not an option (it builds a `RopeGeometry`); `shader`, `state` and `roundPixels` behave as on [Mesh](mesh.md). `MeshRope.defaultOptions` overrides the `textureScale` default globally.

`autoUpdate` is a runtime property (default `true`), not a constructor option. Set `rope.autoUpdate = false` and call `(rope.geometry as RopeGeometry).update()` when you choose. The auto-update is the rope's own `onRender`; assigning `rope.onRender = ...` replaces it, so call `(rope.geometry as RopeGeometry).update()` yourself inside your callback.

With `textureScale > 0` on a WebGL1 context (`preferWebGLVersion: 1`, or a device without WebGL2), PixiJS forces non-power-of-two textures to clamp, so the tiles smear into stretched edge pixels. WebGL2 and WebGPU repeat any size; use power-of-two dimensions (128, 256, 512, ...) when WebGL1 must be supported.
