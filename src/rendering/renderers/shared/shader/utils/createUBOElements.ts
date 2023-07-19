/* eslint-disable quote-props */
type UNIFORM_TYPES_SINGLE =
'f32' | 'vec2<f32>' | 'vec3<f32>' | 'vec4<f32>' |
'mat2x2<f32>' | 'mat3x3<f32>' | 'mat4x4<f32>' | 'u32';

type OPTIONAL_SPACE = ' ' | '';

type UNIFORM_TYPES_ARRAY = `array<${UNIFORM_TYPES_SINGLE},${OPTIONAL_SPACE}${number}>`;

export type UNIFORM_TYPES = UNIFORM_TYPES_SINGLE | UNIFORM_TYPES_ARRAY;

export const WGSL_TO_STD40_SIZE: Record<string, number> = {
    'f32': 4,
    'vec2<f32>': 8,
    'vec3<f32>': 12,
    'vec4<f32>': 16,

    'mat2x2<f32>': 16 * 3,
    'mat3x3<f32>': 16 * 3,
    'mat4x4<f32>': 16 * 4,

    // float:  4,
    // vec2:   8,
    // vec3:   12,
    // vec4:   16,

    // int:      4,
    // ivec2:    8,
    // ivec3:    12,
    // ivec4:    16,

    // uint:     4,
    // uvec2:    8,
    // uvec3:    12,
    // uvec4:    16,

    // bool:     4,
    // bvec2:    8,
    // bvec3:    12,
    // bvec4:    16,

    // mat2:     16 * 2,
    // mat3:     16 * 3,
    // mat4:     16 * 4,
};

export interface UniformData
{
    /** the value of the uniform, this could be any object - a parser will figure out how to write it to the buffer */
    value: unknown;

    type: UNIFORM_TYPES;
    /** the size of the variable (eg 2 for vec2, 3 for vec3, 4 for vec4) */
    size?: number;
    name?: string;
}

export interface UBOElement
{
    data: UniformData;
    offset: number;
    size: number;
}

export interface UniformBufferLayout
{
    uboElements: UBOElement[];
    /** float32 size // TODO change to bytes */
    size: number;
}

export function createUBOElements(uniformData: UniformData[]): UniformBufferLayout
{
    const uboElements: UBOElement[] = uniformData.map((data: UniformData) =>
        ({
            data,
            offset: 0,
            size: 0,
        }));

    let size = 0;
    let chunkSize = 0;
    let offset = 0;

    for (let i = 0; i < uboElements.length; i++)
    {
        const uboElement = uboElements[i];

        size = WGSL_TO_STD40_SIZE[uboElement.data.type];

        if (!size)
        {
            throw new Error(`Unknown type ${uboElement.data.type}`);
        }

        if (uboElement.data.size > 1)
        {
            size = Math.max(size, 16) * uboElement.data.size;
        }

        uboElement.size = size;

        // add some size offset..
        // must align to the nearest 16 bytes or internally nearest round size

        if (chunkSize % size !== 0 && chunkSize < 16)
        {
            // diff required to line up..
            const lineUpValue = (chunkSize % size) % 16;

            chunkSize += lineUpValue;
            offset += lineUpValue;
        }

        if ((chunkSize + size) > 16)
        {
            offset = Math.ceil(offset / 16) * 16;
            uboElement.offset = offset;
            offset += size;
            chunkSize = size;
        }
        else
        {
            uboElement.offset = offset;
            chunkSize += size;
            offset += size;
        }
    }

    offset = Math.ceil(offset / 16) * 16;

    return { uboElements, size: offset };
}
