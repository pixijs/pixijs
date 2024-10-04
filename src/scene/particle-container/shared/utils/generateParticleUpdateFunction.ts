import {
    getAttributeInfoFromFormat
} from '../../../../rendering/renderers/shared/geometry/utils/getAttributeInfoFromFormat';

import type { IParticle } from '../Particle';
import type { ParticleRendererProperty } from '../particleData';

// TODO rename to update function
export type ParticleUpdateFunction = (ps: IParticle[], f32v: Float32Array, u32v: Uint32Array) => void;

export function generateParticleUpdateFunction(properties: Record<string, ParticleRendererProperty>)
{
    return {
        dynamicUpdate: generateUpdateFunction(properties, true),
        staticUpdate: generateUpdateFunction(properties, false),
    };
}

function generateUpdateFunction(
    properties: Record<string, ParticleRendererProperty>,
    dynamic: boolean
): ParticleUpdateFunction
{
    const funcFragments: string[] = [];

    funcFragments.push(`
      
        var index = 0;

        for (let i = 0; i < ps.length; ++i)
        {
            const p = ps[i];

            `);

    let offset = 0;

    for (const i in properties)
    {
        const property = properties[i];

        if (dynamic !== property.dynamic) continue;

        funcFragments.push(`offset = index + ${offset}`);

        funcFragments.push(property.code);

        const attributeInfo = getAttributeInfoFromFormat(property.format);

        offset += attributeInfo.stride / 4;
    }

    funcFragments.push(`
            index += stride * 4;
        }
    `);

    // add to the front..
    funcFragments.unshift(`
        var stride = ${offset};
    `);

    const functionSource = funcFragments.join('\n');

    // eslint-disable-next-line no-new-func
    return new Function('ps', 'f32v', 'u32v', functionSource) as ParticleUpdateFunction;
}
