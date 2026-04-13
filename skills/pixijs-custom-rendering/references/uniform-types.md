# Uniform Types Reference

All supported PixiJS v8 uniform types for use with `UniformGroup`. These type strings are passed in the `type` field of each uniform definition.

## Type Table

| PixiJS type | WGSL equivalent | GLSL equivalent | JS value |
|---|---|---|---|
| `f32` | `f32` | `float` | `number` |
| `i32` | `i32` | `int` | `number` |
| `vec2<f32>` | `vec2<f32>` | `vec2` | `Float32Array(2)` or `[x, y]` |
| `vec3<f32>` | `vec3<f32>` | `vec3` | `Float32Array(3)` |
| `vec4<f32>` | `vec4<f32>` | `vec4` | `Float32Array(4)` |
| `vec2<i32>` | `vec2<i32>` | `ivec2` | `Int32Array(2)` |
| `vec3<i32>` | `vec3<i32>` | `ivec3` | `Int32Array(3)` |
| `vec4<i32>` | `vec4<i32>` | `ivec4` | `Int32Array(4)` |
| `mat2x2<f32>` | `mat2x2<f32>` | `mat2` | `Float32Array(4)` |
| `mat3x3<f32>` | `mat3x3<f32>` | `mat3` | `Float32Array(9)` or `Matrix` |
| `mat4x4<f32>` | `mat4x4<f32>` | `mat4` | `Float32Array(16)` |
| `mat3x2<f32>` | `mat3x2<f32>` | `mat3x2` | `Float32Array(6)` |
| `mat4x2<f32>` | `mat4x2<f32>` | `mat4x2` | `Float32Array(8)` |
| `mat2x3<f32>` | `mat2x3<f32>` | `mat2x3` | `Float32Array(6)` |
| `mat4x3<f32>` | `mat4x3<f32>` | `mat4x3` | `Float32Array(12)` |
| `mat2x4<f32>` | `mat2x4<f32>` | `mat2x4` | `Float32Array(8)` |
| `mat3x4<f32>` | `mat3x4<f32>` | `mat3x4` | `Float32Array(12)` |

## Array Uniforms

For arrays of a type, use the `size` property instead of array syntax in the type:

```ts
import { UniformGroup } from 'pixi.js';

// Array of 10 vec4 values
const uniforms = new UniformGroup({
    uColors: { value: new Float32Array(40), type: 'vec4<f32>', size: 10 },
});
```

Using `array<vec4<f32>, 10>` in the type field will throw an error directing you to use the `size` property instead.

## Usage Examples

### Scalars

```ts
import { UniformGroup } from 'pixi.js';

const uniforms = new UniformGroup({
    uTime: { value: 0, type: 'f32' },
    uIndex: { value: 0, type: 'i32' },
});

uniforms.uniforms.uTime = 1.5;
uniforms.uniforms.uIndex = 3;
```

### Vectors

```ts
import { UniformGroup } from 'pixi.js';

const uniforms = new UniformGroup({
    uPosition: { value: new Float32Array([100, 200]), type: 'vec2<f32>' },
    uDirection: { value: new Float32Array([0, 1, 0]), type: 'vec3<f32>' },
    uColor: { value: new Float32Array([1, 0, 0, 1]), type: 'vec4<f32>' },
    uGridSize: { value: new Int32Array([16, 16]), type: 'vec2<i32>' },
});
```

### Matrices

```ts
import { UniformGroup, Matrix } from 'pixi.js';

const uniforms = new UniformGroup({
    uTransform: { value: new Matrix(), type: 'mat3x3<f32>' },
    uProjection: { value: new Float32Array(16), type: 'mat4x4<f32>' },
    uRotation: { value: new Float32Array(4), type: 'mat2x2<f32>' },
});
```

PixiJS `Matrix` (2D affine transform) maps to `mat3x3<f32>`. For 3D projection matrices, use a raw `Float32Array(16)` with `mat4x4<f32>`.

## UBO Constraints

When using `{ ubo: true }` on a UniformGroup:

- `f32` and `i32` based types are supported (scalars and vectors)
- Matrices are float-only (`mat*<f32>`)
- `u32` is not in the supported `UniformGroup` type list
- Samplers and textures cannot be placed in UBOs
- Field names and order must exactly match the shader's uniform block declaration
- The resource key in the shader must match the UBO block name

Source: `src/rendering/renderers/shared/shader/types.ts`
