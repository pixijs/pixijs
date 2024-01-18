import type { UboElement, UboLayout, UNIFORM_TYPES, UniformData } from '../../../shared/shader/types';

export const WGSL_ALIGN_SIZE_DATA: Record<UNIFORM_TYPES | string, {align: number, size: number}> = {
    i32: { align: 4, size: 4 },
    u32: { align: 4, size: 4 },
    f32: { align: 4, size: 4 },
    f16: { align: 2, size: 2 },
    'vec2<i32>': { align: 8, size: 8 },
    'vec2<u32>': { align: 8, size: 8 },
    'vec2<f32>': { align: 8, size: 8 },
    'vec2<f16>': { align: 4, size: 4 },
    'vec3<i32>': { align: 16, size: 12 },
    'vec3<u32>': { align: 16, size: 12 },
    'vec3<f32>': { align: 16, size: 12 },
    'vec3<f16>': { align: 8, size: 6 },
    'vec4<i32>': { align: 16, size: 16 },
    'vec4<u32>': { align: 16, size: 16 },
    'vec4<f32>': { align: 16, size: 16 },
    'vec4<f16>': { align: 8, size: 8 },
    'mat2x2<f32>': { align: 8, size: 16 },
    'mat2x2<f16>': { align: 4, size: 8 },
    'mat3x2<f32>': { align: 8, size: 24 },
    'mat3x2<f16>': { align: 4, size: 12 },
    'mat4x2<f32>': { align: 8, size: 32 },
    'mat4x2<f16>': { align: 4, size: 16 },
    'mat2x3<f32>': { align: 16, size: 32 },
    'mat2x3<f16>': { align: 8, size: 16 },
    'mat3x3<f32>': { align: 16, size: 48 },
    'mat3x3<f16>': { align: 8, size: 24 },
    'mat4x3<f32>': { align: 16, size: 64 },
    'mat4x3<f16>': { align: 8, size: 32 },
    'mat2x4<f32>': { align: 16, size: 32 },
    'mat2x4<f16>': { align: 8, size: 16 },
    'mat3x4<f32>': { align: 16, size: 48 },
    'mat3x4<f16>': { align: 8, size: 24 },
    'mat4x4<f32>': { align: 16, size: 64 },
    'mat4x4<f16>': { align: 8, size: 32 },
};

export function createUboElementsWGSL(uniformData: UniformData[]): UboLayout
{
    const uboElements: UboElement[] = uniformData.map((data: UniformData) =>
        ({
            data,
            offset: 0,
            size: 0,
        }));

    let offset = 0;

    for (let i = 0; i < uboElements.length; i++)
    {
        const uboElement = uboElements[i];

        let size = WGSL_ALIGN_SIZE_DATA[uboElement.data.type].size;
        const align = WGSL_ALIGN_SIZE_DATA[uboElement.data.type].align;

        if (!WGSL_ALIGN_SIZE_DATA[uboElement.data.type])
        {
            throw new Error(`[Pixi.js] WebGPU UniformBuffer: Unknown type ${uboElement.data.type}`);
        }

        if (uboElement.data.size > 1)
        {
            size = Math.max(size, align) * uboElement.data.size;
        }

        offset = Math.ceil((offset) / align) * align;

        // TODO deal with Arrays
        uboElement.size = size;

        uboElement.offset = offset;

        offset += size;
    }

    // must align to 16 bits!
    offset = Math.ceil(offset / 16) * 16;

    return { uboElements, size: offset };
}

