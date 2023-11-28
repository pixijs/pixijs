import { parseFunctionBody } from '../../utils/parseFunctionBody';

/* eslint-disable quote-props */
export type UniformsSyncCallback = (...args: any[]) => void;

type SingleSetterFunction = (data: Float32Array, offset: number, v: number | number[]) => void;
export type UBO_TYPE = 'f32' | 'vec2<f32>' | 'vec3<f32>' | 'vec4<f32>' | 'mat2x2<f32>' | 'mat3x3<f32>' | 'mat4x4<f32>';

export const UBO_TO_SINGLE_SETTERS_FN: Record<UBO_TYPE, SingleSetterFunction> = {
    'f32': (data: Float32Array, offset: number, v: number | number[]): void =>
    {
        data[offset] = v as number;
    },
    'vec2<f32>': (data: Float32Array, offset: number, v: number | number[]): void =>
    {
        data[offset] = (v as number[])[0];
        data[offset + 1] = (v as number[])[1];
    },
    'vec3<f32>': (data: Float32Array, offset: number, v: number | number[]): void =>
    {
        data[offset] = (v as number[])[0];
        data[offset + 1] = (v as number[])[1];
        data[offset + 2] = (v as number[])[2];
    },
    'vec4<f32>': (data: Float32Array, offset: number, v: number | number[]): void =>
    {
        data[offset] = (v as number[])[0];
        data[offset + 1] = (v as number[])[1];
        data[offset + 2] = (v as number[])[2];
        data[offset + 3] = (v as number[])[3];
    },
    'mat2x2<f32>': (data: Float32Array, offset: number, v: number | number[]): void =>
    {
        data[offset] = (v as number[])[0];
        data[offset + 1] = (v as number[])[1];

        data[offset + 4] = (v as number[])[2];
        data[offset + 5] = (v as number[])[3];
    },
    'mat3x3<f32>': (data: Float32Array, offset: number, v: number | number[]): void =>
    {
        data[offset] = (v as number[])[0];
        data[offset + 1] = (v as number[])[1];
        data[offset + 2] = (v as number[])[2];

        data[offset + 4] = (v as number[])[3];
        data[offset + 5] = (v as number[])[4];
        data[offset + 6] = (v as number[])[5];

        data[offset + 8] = (v as number[])[6];
        data[offset + 9] = (v as number[])[7];
        data[offset + 10] = (v as number[])[8];
    },
    'mat4x4<f32>': (data: Float32Array, offset: number, v: number | number[]): void =>
    {
        for (let i = 0; i < 16; i++)
        {
            data[offset + i] = (v as number[])[i];
        }
    },
};

export const UBO_TO_SINGLE_SETTERS: Record<UBO_TYPE, string> = {
    // eslint-disable-next-line dot-notation
    'f32': parseFunctionBody(UBO_TO_SINGLE_SETTERS_FN['f32']),
    'vec2<f32>': parseFunctionBody(UBO_TO_SINGLE_SETTERS_FN['vec2<f32>']),
    'vec3<f32>': parseFunctionBody(UBO_TO_SINGLE_SETTERS_FN['vec3<f32>']),
    'vec4<f32>': parseFunctionBody(UBO_TO_SINGLE_SETTERS_FN['vec4<f32>']),
    'mat2x2<f32>': parseFunctionBody(UBO_TO_SINGLE_SETTERS_FN['mat2x2<f32>']),
    'mat3x3<f32>': parseFunctionBody(UBO_TO_SINGLE_SETTERS_FN['mat3x3<f32>']),
    'mat4x4<f32>': parseFunctionBody(UBO_TO_SINGLE_SETTERS_FN['mat4x4<f32>']),
};

// const WGSL_TO_SIZE: Dict<number> = {
//     float:    1,
//     vec2:     2,
//     vec3:     3,
//     vec4:     4,

//     int:      1,
//     ivec2:    2,
//     ivec3:    3,
//     ivec4:    4,

//     uint:     1,
//     uvec2:    2,
//     uvec3:    3,
//     uvec4:    4,

//     bool:     1,
//     bvec2:    2,
//     bvec3:    3,
//     bvec4:    4,

//     mat2:     4,
//     mat3:     9,
//     mat4:     16,
// };
