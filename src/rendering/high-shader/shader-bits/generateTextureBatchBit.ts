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
            name: 'texture-batch-bit',
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

function generateSampleGlSrc(maxTextures: number): string
{
    const src = [];

    for (let i = 0; i < maxTextures; i++)
    {
        if (i > 0)
        {
            src.push('else');
        }

        if (i < maxTextures - 1)
        {
            src.push(`if(vTextureId < ${i}.5)`);
        }

        src.push('{');
        src.push(`\toutColor = texture(uSamplers[${i}], vUV);`);
        src.push('}');
    }

    return src.join('\n');
}

export function generateTextureBatchBitGl(maxTextures: number): HighShaderBit
{
    if (!textureBatchBitCache[maxTextures])
    {
        textureBatchBitCache[maxTextures] = {
            name: 'texture-batch-bit',
            vertex: {
                header: `
                in float aTextureId;
                out float vTextureId;
              
            `,
                main: `
                vTextureId = aTextureId;
            `
            },
            fragment: {
                header: `
                in float vTextureId;
    
                uniform sampler2D uSamplers[${maxTextures}];
              
            `,
                main: `
    
                ${generateSampleGlSrc(16)}
            `
            }
        };
    }

    return textureBatchBitCache[maxTextures];
}
