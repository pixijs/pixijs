import type { HighShaderBit } from '../compiler/types';

const textureBatchBitCache: Record<number, HighShaderBit> = {};

function generateBindingSrc(maxTextures: number): string
{
    const src = [];

    if (maxTextures === 1)
    {
        src.push('@group(1) @binding(0) var textureSource1: texture_2d<f32>;');
        src.push('@group(1) @binding(1) var textureSampler1: sampler;');
    }
    else
    {
        let bindingIndex = 0;

        for (let i = 0; i < maxTextures; i++)
        {
            src.push(`@group(1) @binding(${bindingIndex++}) var textureSource${i + 1}: texture_2d<f32>;`);
            src.push(`@group(1) @binding(${bindingIndex++}) var textureSampler${i + 1}: sampler;`);
        }
    }

    return src.join('\n');
}

function generateSampleSrc(maxTextures: number): string
{
    const src = [];

    if (maxTextures === 1)
    {
        src.push('outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);');
    }
    else
    {
        src.push('switch vTextureId {');

        for (let i = 0; i < maxTextures; i++)
        {
            if (i === maxTextures - 1)
            {
                src.push(`  default:{`);
            }
            else
            {
                src.push(`  case ${i}:{`);
            }
            src.push(`      outColor = textureSampleGrad(textureSource${i + 1}, textureSampler${i + 1}, vUV, uvDx, uvDy);`);
            src.push(`      break;}`);
        }

        src.push(`}`);
    }

    return src.join('\n');
}

export function generateTextureBatchBit(maxTextures: number): HighShaderBit
{
    if (!textureBatchBitCache[maxTextures])
    {
        textureBatchBitCache[maxTextures] = {
            name: 'textureBatchBit',
            vertex: {
                header: `
                @in aTextureId: f32;
                @out @interpolate(flat) vTextureId : u32;
            `,
                main: `
                vTextureId = u32(aTextureId);
            `
            },
            fragment: {
                header: `
                @in @interpolate(flat) vTextureId: u32;
    
                ${generateBindingSrc(16)}
            `,
                main: `
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);
    
                ${generateSampleSrc(16)}
            `
            }
        };
    }

    return textureBatchBitCache[maxTextures];
}
