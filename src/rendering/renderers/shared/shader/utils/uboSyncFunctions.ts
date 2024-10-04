import type { UNIFORM_TYPES_SINGLE } from '../types';

function loopMatrix(col: number, row: number)
{
    const total = col * row;

    return `
        for (let i = 0; i < ${total}; i++) {
            data[offset + (((i / ${col})|0) * 4) + (i % ${col})] = v[i];
        }
    `;
}

export const uboSyncFunctionsSTD40: Record<UNIFORM_TYPES_SINGLE, string> = {
    f32: `
        data[offset] = v;`,
    i32: `
        dataInt32[offset] = v;`,
    'vec2<f32>': `
        data[offset] = v[0];
        data[offset + 1] = v[1];`,
    'vec3<f32>': `
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];`,
    'vec4<f32>': `
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];`,
    'vec2<i32>': `
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];`,
    'vec3<i32>': `
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];`,
    'vec4<i32>': `
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];
        dataInt32[offset + 3] = v[3];`,
    'mat2x2<f32>': `
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 4] = v[2];
        data[offset + 5] = v[3];`,
    'mat3x3<f32>': `
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];
        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];`,
    'mat4x4<f32>': `
        for (let i = 0; i < 16; i++) {
            data[offset + i] = v[i];
        }`,
    'mat3x2<f32>': loopMatrix(3, 2),
    'mat4x2<f32>': loopMatrix(4, 2),
    'mat2x3<f32>': loopMatrix(2, 3),
    'mat4x3<f32>': loopMatrix(4, 3),
    'mat2x4<f32>': loopMatrix(2, 4),
    'mat3x4<f32>': loopMatrix(3, 4),
};

export const uboSyncFunctionsWGSL: Record<UNIFORM_TYPES_SINGLE, string> = {
    ...uboSyncFunctionsSTD40,
    'mat2x2<f32>': `
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `,
};
