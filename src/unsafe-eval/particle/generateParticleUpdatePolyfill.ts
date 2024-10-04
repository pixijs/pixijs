import { getAttributeInfoFromFormat } from '../../rendering/renderers/shared/geometry/utils/getAttributeInfoFromFormat';
import { particleUpdateFunctions } from './particleUpdateFunctions';

import type { IParticle } from '../../scene/particle-container/shared/Particle';
import type { ParticleRendererProperty } from '../../scene/particle-container/shared/particleData';

// eslint-disable-next-line max-len
export type ParticleUpdateFunction = (ps: IParticle[], f32v: Float32Array, u32v: Uint32Array, offset: number, stride: number) => void;

export function generateParticleUpdatePolyfill(properties: ParticleRendererProperty[])
{
    const dynamicProperties = properties.filter((p) => p.dynamic);
    const staticProperties = properties.filter((p) => !p.dynamic);

    return {
        dynamicUpdate: generateUpdateFunction(dynamicProperties),
        staticUpdate: generateUpdateFunction(staticProperties),
    };
}

function generateUpdateFunction(properties: ParticleRendererProperty[]): ParticleUpdateFunction
{
    let stride = 0;

    const updateData: { stride: number; updateFunction: ParticleUpdateFunction }[] = [];

    for (let i = 0; i < properties.length; i++)
    {
        const property = properties[i];

        const attributeStride = getAttributeInfoFromFormat(property.format).stride / 4;

        stride += attributeStride;

        updateData.push({
            stride: attributeStride,
            updateFunction:
            property.updateFunction
            || particleUpdateFunctions[property.attributeName as keyof typeof particleUpdateFunctions]
        });
    }

    return (ps: IParticle[], f32v: Float32Array, u32v: Uint32Array) =>
    {
        let offset = 0;

        for (let i = 0; i < updateData.length; i++)
        {
            const obx = updateData[i];

            obx.updateFunction(ps, f32v, u32v, offset, stride);
            offset += obx.stride;
        }
    };
}
