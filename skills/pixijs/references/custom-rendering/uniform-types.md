# Uniform types

Every `type` string a `UniformGroup` entry accepts, and the JS value each takes.

| PixiJS type   | GLSL     | JS value                      |
| ------------- | -------- | ----------------------------- |
| `f32`         | `float`  | `number`                      |
| `i32`         | `int`    | `number`                      |
| `u32`         | `uint`   | `number`                      |
| `vec2<f32>`   | `vec2`   | `Float32Array(2)` or `[x, y]` |
| `vec3<f32>`   | `vec3`   | `Float32Array(3)`             |
| `vec4<f32>`   | `vec4`   | `Float32Array(4)`             |
| `vec2<i32>`   | `ivec2`  | `Int32Array(2)`               |
| `vec3<i32>`   | `ivec3`  | `Int32Array(3)`               |
| `vec4<i32>`   | `ivec4`  | `Int32Array(4)`               |
| `vec2<u32>`   | `uvec2`  | `Uint32Array(2)`              |
| `vec3<u32>`   | `uvec3`  | `Uint32Array(3)`              |
| `vec4<u32>`   | `uvec4`  | `Uint32Array(4)`              |
| `mat2x2<f32>` | `mat2`   | `Float32Array(4)`             |
| `mat3x3<f32>` | `mat3`   | `Float32Array(9)` or `Matrix` |
| `mat4x4<f32>` | `mat4`   | `Float32Array(16)`            |
| `mat3x2<f32>` | `mat3x2` | `Float32Array(6)`             |
| `mat4x2<f32>` | `mat4x2` | `Float32Array(8)`             |
| `mat2x3<f32>` | `mat2x3` | `Float32Array(6)`             |
| `mat4x3<f32>` | `mat4x3` | `Float32Array(12)`            |
| `mat2x4<f32>` | `mat2x4` | `Float32Array(8)`             |
| `mat3x4<f32>` | `mat3x4` | `Float32Array(12)`            |

The type string is the WGSL type. A PixiJS `Matrix` (2D affine) maps to `mat3x3<f32>`; a 3D projection is a `Float32Array(16)` with `mat4x4<f32>`.

Non-square matrices (`mat3x2` and the rest) work on WebGPU and inside a WebGL UBO only. As a plain WebGL `uniform` they throw at render time ("Cannot read properties of undefined (reading 'replace')"); use `mat2x2`, `mat3x3` or `mat4x4` there.

`uint` and `uvec*` need GLSL ES 3.0 (`#version 300 es` as the first line).

## Arrays

Use the `size` property; `array<vec4<f32>, 10>` in the type field throws an error directing you to `size`.

```ts
import { UniformGroup } from "pixi.js";

const uniforms = new UniformGroup({
  uColors: { value: new Float32Array(40), type: "vec4<f32>", size: 10 },
});
```

Which types a `{ ubo: true }` group can hold and how it must match the shader's block: [custom-rendering](../custom-rendering.md#ubo-mode-uniform-buffer-objects).
