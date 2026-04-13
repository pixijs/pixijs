---
name: pixijs-mesh
description: >
  Create custom geometry with PixiJS Mesh. MeshGeometry (positions, uvs,
  indices, topology). MeshSimple for quick textured quads. MeshPlane for
  subdivided deformation planes. MeshRope for path-following textures.
  PerspectiveMesh for 3D perspective transforms. Topology types:
  triangle-list, triangle-strip, line-list, line-strip, point-list.
  Use when the user asks about custom geometry, vertex buffers, UV mapping,
  mesh deformation, rope effects, texture along a path, perspective projection,
  subdivided planes, triangle meshes, custom vertex data, or topology types.
  Covers Mesh, MeshGeometry, MeshSimple, MeshPlane, MeshRope, PerspectiveMesh,
  positions, uvs, indices, topology, batchMode, setCorners.
metadata:
  type: sub-skill
  library: pixi.js
  library-version: "8.17.1"
  sources: "pixijs/pixijs:src/scene/mesh/shared/Mesh.ts, pixijs/pixijs:src/scene/mesh/shared/MeshGeometry.ts, pixijs/pixijs:src/scene/mesh-simple/MeshSimple.ts, pixijs/pixijs:src/scene/mesh-plane/MeshPlane.ts, pixijs/pixijs:src/scene/mesh-perspective/PerspectiveMesh.ts"
---

## When to Use This Skill

Apply when the user needs custom geometry, deformable surfaces, rope/path-following textures, or perspective-projected planes that go beyond what Sprite and Graphics offer.

**Related skills:** For simple image display use **sprite**; for vector shapes use **graphics**; for custom shaders on meshes use **custom-rendering**; for GPU performance tuning use **performance**.

## Setup

```ts
import { Mesh, MeshGeometry, MeshSimple, MeshPlane, MeshRope, Point } from 'pixi.js';
import { Assets } from 'pixi.js';

const texture = await Assets.load('myTexture.png');

// Basic mesh with custom geometry
const geometry = new MeshGeometry({
    positions: new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]),
    uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
    indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
    topology: 'triangle-list',
});

const mesh = new Mesh({ geometry, texture });
app.stage.addChild(mesh);
```

Key points:
- `MeshGeometry` takes an options object with `positions`, `uvs`, `indices`, and `topology`.
- Positions are flat x,y pairs. UVs are 0-1 texture coordinates. Indices define triangles.
- `Mesh` requires a `geometry`. A `texture` or `shader` provides the visual. Without a shader, the default texture shader is used.
- Meshes are leaf nodes; they cannot have children.

## Core Patterns

### MeshSimple: quick textured shapes

```ts
import { MeshSimple } from 'pixi.js';

const triangle = new MeshSimple({
    texture,
    vertices: new Float32Array([0, 0, 100, 0, 50, 100]),
    uvs: new Float32Array([0, 0, 1, 0, 0.5, 1]),
});

app.stage.addChild(triangle);
```

MeshSimple wraps MeshGeometry creation. Set `autoUpdate = true` (default) to push vertex buffer changes every frame automatically. Set `autoUpdate = false` and call `mesh.geometry.getBuffer('aPosition').update()` for manual control.

Animating vertices:

```ts
app.ticker.add((ticker) => {
    const verts = triangle.vertices;
    verts[5] = 100 + Math.sin(performance.now() / 500) * 20;
    triangle.vertices = verts;
});
```

### MeshPlane: subdivided deformation surface

```ts
import { MeshPlane } from 'pixi.js';

const plane = new MeshPlane({
    texture,
    verticesX: 10,
    verticesY: 10,
});

app.stage.addChild(plane);
```

`verticesX`/`verticesY` control subdivision density. More vertices allow smoother deformation but cost more draw overhead. `autoResize = true` (default) makes the plane resize when the texture changes.

Deform the plane each frame:

```ts
const { buffer } = plane.geometry.getAttribute('aPosition');

app.ticker.add(() => {
    for (let i = 0; i < buffer.data.length; i++) {
        buffer.data[i] += Math.sin(performance.now() / 1000 + i) * 0.3;
    }
    buffer.update();
});
```

### MeshRope: texture along a path

```ts
import { MeshRope, Point } from 'pixi.js';

const points = [];
for (let i = 0; i < 20; i++) {
    points.push(new Point(i * 50, 0));
}

const rope = new MeshRope({ texture, points, textureScale: 0 });

app.stage.addChild(rope);
```

`textureScale: 0` (default) stretches the texture across the full rope length. A positive value repeats the texture with preserved aspect ratio. `width` controls the rope thickness (defaults to `texture.height`). Move the points each frame to animate the rope.

### PerspectiveMesh: 2D plane with perspective projection

```ts
import { PerspectiveMesh } from 'pixi.js';

const mesh = new PerspectiveMesh({
    texture,
    verticesX: 20,
    verticesY: 20,
    x0: 0,   y0: 0,     // top-left
    x1: 300, y1: 30,    // top-right
    x2: 280, y2: 300,   // bottom-right
    x3: 20,  y3: 280,   // bottom-left
});

app.stage.addChild(mesh);
```

Subclass of `Mesh` using `PerspectivePlaneGeometry`. Higher `verticesX`/`verticesY` values produce smoother perspective at the cost of more geometry. Update corners at runtime with `mesh.setCorners(x0, y0, x1, y1, x2, y2, x3, y3)`. This is a 2D mesh with perspective UV correction, not true 3D.

### Topology and batching

MeshGeometry supports five topology types:
- `'triangle-list'` (default): every 3 indices form one triangle
- `'triangle-strip'`: each new index extends the strip by one triangle
- `'line-list'`: pairs of indices form lines
- `'line-strip'`: connected line segments
- `'point-list'`: each index renders a point

Batching rules: a Mesh is batched (combined with other draw calls) only when it has no custom `shader`, no depth-test/culling state, and uses `MeshGeometry`. The `geometry.batchMode` property controls batching:
- `'auto'` (default): batched when the geometry has 100 or fewer vertices
- `'batch'`: always batched regardless of vertex count
- `'no-batch'`: never batched

Meshes with a custom shader always render independently. Geometry can be shared across multiple Mesh instances.

## Common Mistakes

### [HIGH] Using old SimpleMesh/SimplePlane/SimpleRope names

Wrong:
```ts
import { SimpleRope } from 'pixi.js';
const rope = new SimpleRope(texture, points);
```

Correct:
```ts
import { MeshRope } from 'pixi.js';
const rope = new MeshRope({ texture, points });
```

Renamed in v8: `SimpleMesh` -> `MeshSimple`, `SimplePlane` -> `MeshPlane`, `SimpleRope` -> `MeshRope`. The old names do not exist.

Source: src/__docs__/migrations/v8.md

### [HIGH] Positional constructor args for MeshGeometry

Wrong:
```ts
const geom = new MeshGeometry(vertices, uvs, indices);
```

Correct:
```ts
const geom = new MeshGeometry({
    positions: vertices,
    uvs,
    indices,
    topology: 'triangle-list',
});
```

v8 uses an options object. The positional constructor is deprecated and logs a warning. Note the property is `positions`, not `vertices`.

Source: src/__docs__/migrations/v8.md

### [MEDIUM] Not providing topology for mesh geometry

MeshGeometry defaults to `'triangle-list'`. If your data is organized as a triangle strip or line list, you must set `topology` explicitly or the mesh will render garbage. The topology is set on the geometry, not the mesh.

Source: src/scene/mesh/shared/MeshGeometry.ts

---

See also: core-concepts (Container transforms, textures), custom-rendering (custom shaders for meshes), sprite (simpler image display), performance (batching optimization)

## Learn More

- [Mesh](https://pixijs.download/release/docs/scene.Mesh.html.md)
- [MeshGeometry](https://pixijs.download/release/docs/scene.MeshGeometry.html.md)
- [MeshSimple](https://pixijs.download/release/docs/scene.MeshSimple.html.md)
- [MeshPlane](https://pixijs.download/release/docs/scene.MeshPlane.html.md)
- [MeshRope](https://pixijs.download/release/docs/scene.MeshRope.html.md)
- [PerspectiveMesh](https://pixijs.download/release/docs/scene.PerspectiveMesh.html.md)
