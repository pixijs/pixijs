/* eslint-disable quote-props */
import { WGSL_TO_STD40_SIZE } from './createUBOElements';
import { uniformBufferParsers } from './uniformBufferParsers';

import type { UBOElement } from './createUBOElements';

export type UniformsSyncCallback = (...args: any[]) => void;

const UBO_TO_SINGLE_SETTERS: Record<string, string> = {
    'f32': `
        data[offset] = v;
    `,
    'vec2<f32>': `
        data[offset] = v[0];
        data[offset+1] = v[1];
    `,
    'vec3<f32>': `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];

    `,
    'vec4<f32>': `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];
        data[offset+3] = v[3];
    `,
    'mat2x2<f32>': `
        data[offset] = v[0];
        data[offset+1] = v[1];

        data[offset+4] = v[2];
        data[offset+5] = v[3];
    `,
    'mat3x3<f32>': `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];

        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];

        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];
    `,
    'mat4x4<f32>': `
        for(var i = 0; i < 16; i++)
        {
            data[offset + i] = v[i];
        }
    `,
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

export function generateUniformBufferSync(
    uboElements: UBOElement[],
): UniformsSyncCallback
{
    const funcFragments = [`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
    `];

    let prev = 0;

    for (let i = 0; i < uboElements.length; i++)
    {
        const uboElement = uboElements[i];

        const name = uboElement.data.name;

        let parsed = false;
        let offset = 0;

        for (let j = 0; j < uniformBufferParsers.length; j++)
        {
            const uniformParser = uniformBufferParsers[j];

            if (uniformParser.test(uboElement.data))
            {
                offset = uboElement.offset / 4;

                funcFragments.push(
                    `offset += ${offset - prev};`,
                    uniformBufferParsers[j].code(name));
                parsed = true;

                break;
            }
        }

        if (!parsed)
        {
            if (uboElement.data.size > 1)
            {
                const rowSize = Math.max(WGSL_TO_STD40_SIZE[uboElement.data.type] / 16, 1);
                const elementSize = (uboElement.data.value as Array<number>).length / uboElement.data.size;// size / rowSize;

                const remainder = (4 - (elementSize % 4)) % 4;

                offset = uboElement.offset / 4;

                funcFragments.push(/* wgsl */`
                    v = uv.${name};
                    offset += ${offset - prev};

                    let arrayOffset = offset;
                    
                    t = 0;

                    for(var i=0; i < ${uboElement.data.size * rowSize}; i++)
                    {
                        for(var j = 0; j < ${elementSize}; j++)
                        {
                            data[arrayOffset++] = v[t++];
                        }
                        ${remainder !== 0 ? 'arrayOffset += ${remainder};' : ''}
                    }
                `);
            }
            else
            {
                const template = UBO_TO_SINGLE_SETTERS[uboElement.data.type];

                offset = uboElement.offset / 4;

                funcFragments.push(/* wgsl */`
                    v = uv.${name};
                    offset += ${offset - prev};
                    ${template};
                `);
            }
        }

        prev = offset;
    }

    const fragmentSrc = funcFragments.join('\n');

    // eslint-disable-next-line no-new-func
    return new Function(
        'uv',
        'data',
        'offset',
        fragmentSrc,
    ) as UniformsSyncCallback;
}
