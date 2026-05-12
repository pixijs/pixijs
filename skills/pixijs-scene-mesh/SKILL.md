---
name: pixijs-scene-mesh
description: "Use this skill when rendering custom geometry in PixiJS v8. Covers Mesh with MeshGeometry (positions, uvs, indices, topology), MeshSimple for per-frame vertex animation, MeshPlane for subdivided deformation, MeshRope for path-following textures, PerspectiveMesh for 2.5D corners. Triggers on: Mesh, MeshGeometry, MeshSimple, MeshPlane, MeshRope, PerspectiveMesh, positions, uvs, indices, topology, setCorners, constructor options, MeshOptions, MeshPlaneOptions, MeshRopeOptions, SimpleMeshOptions, PerspectivePlaneOptions."
license: MIT
---

Meshes render arbitrary 2D (or perspective-projected) geometry with a texture or custom shader. PixiJS ships the base `Mesh` class plus four specialized subclasses for common shapes: `MeshSimple`, `MeshPlane`, `MeshRope`, and `PerspectiveMesh`. Pick the subclass that matches your shape; drop to the base `Mesh` when you need full vertex-level control or a custom shader.

Assumes familiarity with `pixijs-scene-core-concepts`. Meshes are leaf nodes; they cannot have children. Wrap multiple meshes in a `Container` to group them.

## Quick Start

```ts
const texture = await Assets.load("pattern.png");

const geometry = new MeshGeometry({
  positions: new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]),
  uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
  indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
  topology: "triangle-list",
});

const mesh = new Mesh({
  geometry,
  texture,
  roundPixels: false,
});
app.stage.addChild(mesh);
```

Every `Mesh` subclass takes a single options object. The base `Mesh` requires a `geometry`; subclasses (`MeshSimple`, `MeshPlane`, `MeshRope`, `PerspectiveMesh`) build the geometry internally and require a `texture` instead. See each variant's reference for the full field list.

## Variants

| Variant           | Use when                                              | Trade-offs                                              | Reference                                                        |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| `Mesh`            | Full control, custom geometry, custom shaders         | You build the `MeshGeometry` yourself                   | [references/mesh.md](references/mesh.md)                         |
| `MeshSimple`      | Quick textured shapes with per-frame vertex animation | Thin wrapper; auto-updates the vertex buffer            | [references/mesh-simple.md](references/mesh-simple.md)           |
| `MeshPlane`       | Subdivided textured rectangle for distortion effects  | Fixed topology; `verticesX`/`verticesY` control density | [references/mesh-plane.md](references/mesh-plane.md)             |
| `MeshRope`        | Texture following a polyline path                     | Bent at each point; needs many points for smooth curves | [references/mesh-rope.md](references/mesh-rope.md)               |
| `PerspectiveMesh` | 2D plane with perspective corners                     | Not true 3D; UV-level perspective correction only       | [references/mesh-perspective.md](references/mesh-perspective.md) |

## When to use what

- **"I need a textured quad"** → `Sprite` (see `pixijs-scene-sprite`), not a mesh. Meshes are for cases Sprite can't express.
- **"I need to deform a textured rectangle"** → `MeshPlane`. Set `verticesX`/`verticesY` for the desired smoothness.
- **"I need a rope or trail that follows points"** → `MeshRope`. Control thickness with `width`; use `textureScale: 0` to stretch or `> 0` to repeat.
- **"I need a tilted 2D card or floor"** → `PerspectiveMesh`. Pass four corner positions; not real 3D but good enough for 2.5D effects.
- **"I need per-frame animated vertices with a simple shape"** → `MeshSimple`. It handles the buffer-update dance for you.
- **"I need a custom shader or unusual geometry"** → Base `Mesh` with a hand-built `MeshGeometry`. See `pixijs-custom-rendering` for shader authoring.
- **"I need true 3D rendering"** → Use a dedicated 3D library. `PerspectiveMesh` simulates perspective at the UV level but has no depth buffer.

## Quick concepts

### MeshGeometry owns the vertex data

`MeshGeometry` holds the `positions`, `uvs`, `indices`, and `topology`. You can share one geometry across multiple `Mesh` instances; positions are reference-counted.

### Batching

A mesh batches (combines with other draw calls) only if it uses `MeshGeometry`, has no custom shader, no depth or culling state, and the `'auto'` rule (`batchMode = 'auto'` and ≤100 vertices). Custom shaders always render independently.

### Topology is on the geometry, not the mesh

`new MeshGeometry({ topology: 'triangle-strip' })`; topology is a geometry property. The default is `'triangle-list'`; set it explicitly if your data is organized differently.

### Extra knobs

- `new MeshGeometry({ shrinkBuffersToFit: true })` — trims GPU buffer storage to the actual vertex count on creation. Use it when feeding large, one-shot geometries.
- `Mesh.containsPoint(point)` — topology-aware hit test that walks the triangles. Works with any `MeshGeometry`, including custom layouts.
- `new Mesh({ geometry, state })` — pass a `State` object to control blend, depth, and culling. Batching is disabled automatically if depth or culling flags are set. Defaults to `State.for2d()` when omitted.

## Common Mistakes

### [HIGH] Using old `SimpleMesh` / `SimplePlane` / `SimpleRope` names

Wrong:

```ts
import { SimpleRope } from "pixi.js";
const rope = new SimpleRope(texture, points);
```

Correct:

```ts
import { MeshRope } from "pixi.js";
const rope = new MeshRope({ texture, points });
```

Renamed in v8: `SimpleMesh` → `MeshSimple`, `SimplePlane` → `MeshPlane`, `SimpleRope` → `MeshRope`. All switched to options-object constructors.


### [HIGH] Positional constructor args for `MeshGeometry`

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
  topology: "triangle-list",
});
```

v8 uses an options object. Note the property is `positions`, not `vertices`; the `vertices` name is only used by `MeshSimple`.


### [MEDIUM] Adding children to a mesh

Wrong:

```ts
mesh.addChild(otherMesh);
```

Correct:

```ts
const group = new Container();
group.addChild(mesh, otherMesh);
```

`Mesh` sets `allowChildren = false`. Adding children logs a deprecation warning. Group meshes inside a plain `Container`.


## API Reference

- [Mesh](https://pixijs.download/release/docs/scene.Mesh.html.md)
- [MeshGeometry](https://pixijs.download/release/docs/scene.MeshGeometry.html.md)
- [MeshSimple](https://pixijs.download/release/docs/scene.MeshSimple.html.md)
- [MeshPlane](https://pixijs.download/release/docs/scene.MeshPlane.html.md)
- [MeshRope](https://pixijs.download/release/docs/scene.MeshRope.html.md)
- [PerspectiveMesh](https://pixijs.download/release/docs/scene.PerspectiveMesh.html.md)
