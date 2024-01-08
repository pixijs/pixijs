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
    'f32': `data[offset] = v;`,
    'vec2<f32>': `data[offset] = v[0];
        data[offset + 1] = v[1];`,
    'vec3<f32>': `data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];`,
    'vec4<f32>': `data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];`,
    'mat2x2<f32>': `data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 4] = v[2];
        data[offset + 5] = v[3];`,
    'mat3x3<f32>': `data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];
        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];`,
    'mat4x4<f32>': `for (let i = 0; i < 16; i++) {
            data[offset + i] = v[i];
        }`,
};
