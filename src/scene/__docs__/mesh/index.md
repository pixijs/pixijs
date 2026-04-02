---
title: Mesh
description: Learn how to create and manipulate meshes in PixiJS v8, including custom geometry, shaders, and built-in mesh types like MeshSimple, MeshRope, and PerspectiveMesh.
category: scene
---
# Mesh

The PixiJS `Mesh` system gives you full control over geometry, UVs, indices, shaders, and WebGL/WebGPU state. Meshes are ideal for custom rendering effects, distortion, perspective manipulation, or performance-tuned rendering pipelines.

```ts
import { Assets, Texture, Mesh, MeshGeometry, Shader } from 'pixi.js';

const geometry = new MeshGeometry({
  positions: new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]),
  uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
  indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
});

const texture = await Assets.load('image.png');

const shader = Shader.from({
  gl: {
    vertex: `
            in vec2 aPosition;
            in vec2 aUV;
            out vec2 vUV;
            void main() {
                gl_Position = vec4(aPosition / 100.0 - 1.0, 0.0, 1.0);
                vUV = aUV;
            }
        `,
    fragment: `
            precision mediump float;
            in vec2 vUV;
            out vec4 finalColor;
            uniform sampler2D uSampler;
            void main() {
                finalColor = texture(uSampler, vUV);
            }
        `,
  },
  resources: {
    uSampler: texture.source,
  },
});

const mesh = new Mesh({ geometry, shader });
app.stage.addChild(mesh);
```

## What is a mesh?

A mesh is a low-level rendering primitive composed of:

- **Geometry**: Vertex positions, UVs, indices, and other attributes
- **Shader**: A GPU program that defines how the geometry is rendered
- **State**: GPU state configuration (e.g. blending, depth, stencil)

With these elements, you can build anything from simple quads to curved surfaces and procedural effects.

## MeshGeometry

All meshes use the `MeshGeometry` class to define vertex positions, UV coordinates, and indices that describe the mesh's shape and texture mapping.

```ts
const geometry = new MeshGeometry({
  positions: Float32Array, // 2 floats per vertex
  uvs: Float32Array, // matching number of floats
  indices: Uint32Array, // 3 indices per triangle
  topology: 'triangle-list',
});
```

You can access and modify buffers directly:

```ts
geometry.positions[0] = 50;
geometry.uvs[0] = 0.5;
geometry.indices[0] = 1;
```

## Built-in mesh types

### MeshSimple

A minimal wrapper over `Mesh` that accepts vertex, UV, and index arrays directly. Good for fast static or dynamic meshes.

```ts
const texture = await Assets.load('image.png');

const mesh = new MeshSimple({
  texture,
  vertices: new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]),
  uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
  indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
});
```

- Use `autoUpdate = true` to update geometry per frame.
- Access `mesh.vertices` to read/write data.

### MeshRope

Bends a texture along a series of control points. Often used for trails, snakes, and animated ribbons.

```ts
const texture = await Assets.load('snake.png');

const points = [new Point(0, 0), new Point(100, 0), new Point(200, 50)];
const rope = new MeshRope({
  texture,
  points,
  textureScale: 1, // optional
});
```

- `textureScale > 0` repeats texture; `0` stretches it.
- `autoUpdate = true` re-evaluates geometry each frame.

### MeshPlane

A flexible subdivided quad mesh, suitable for distortion or grid-based warping.

```ts
const texture = await Assets.load('image.png');

const plane = new MeshPlane({
  texture,
  verticesX: 10,
  verticesY: 10,
});
```

- Automatically resizes on texture update when `autoResize = true`.

### PerspectiveMesh

A subclass of `Mesh` that applies perspective correction by transforming the UVs.

```ts
import { PerspectiveMesh } from 'pixi.js';

const texture = await Assets.load('image.png');

const mesh = new PerspectiveMesh({
  texture,
  verticesX: 20,
  verticesY: 20,
  x0: 0,
  y0: 0,
  x1: 300,
  y1: 30,
  x2: 280,
  y2: 300,
  x3: 20,
  y3: 280,
});
```

- Set corner coordinates via `setCorners(...)`.
- Ideal for emulating 3D projection in 2D.

---

## API reference

- {@link Mesh}
- {@link MeshGeometry}
- {@link MeshSimple}
- {@link MeshRope}
- {@link MeshPlane}
- {@link PerspectiveMesh}
- {@link Shader}
- {@link Texture}
