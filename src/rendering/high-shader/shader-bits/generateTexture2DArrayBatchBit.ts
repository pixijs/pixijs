import type { HighShaderBit } from '../compiler/types';

const texture2dArrayBatchBitGpuCache: Record<number, HighShaderBit> = {};

/**
 *
 * @param maxTextures - the max textures the shader can use.
 * @returns a shader bit that will allow the shader to sample multiple textures AND round pixels.
 */
function generateBindingSrc(maxTextures: number): string
{
    const src = [];

    if (maxTextures === 1)
    {
        src.push('@group(1) @binding(0) var textureSource1: texture_2d_array<f32>;');
        src.push('@group(1) @binding(1) var textureSampler1: sampler;');
    }
    else
    {
        let bindingIndex = 0;

        for (let i = 0; i < maxTextures; i++)
        {
            src.push(`@group(1) @binding(${bindingIndex++}) var textureSource${i + 1}: texture_2d_array<f32>;`);
            src.push(`@group(1) @binding(${bindingIndex++}) var textureSampler${i + 1}: sampler;`);
        }
    }

    return src.join('\n');
}

function generateSample2DArraySrc(maxTextures: number): string
{
    const src = [];

    if (maxTextures === 1)
    {
        src.push('outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, vLayerId, uvDx, uvDy);');
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
            let text = '      outColor = textureSampleGrad(';

            text += `textureSource${i + 1}, textureSampler${i + 1}, vUV, vLayerId, uvDx, uvDy`;
            text += ');';

            src.push(text);
            src.push(`      break;}`);
        }

        src.push(`}`);
    }

    return src.join('\n');
}

export function generateTexture2DArrayBatchBit(maxTextures: number): HighShaderBit
{
    if (!texture2dArrayBatchBitGpuCache[maxTextures])
    {
        texture2dArrayBatchBitGpuCache[maxTextures] = {
            name: 'texture-2darray-batch-bit',
            vertex: {
                header: `
                @in aTextureIdAndRound: vec2<u32>;
                @in aLayerId: f32;
                @out @interpolate(flat) vTextureId : u32;
                @out @interpolate(flat) vLayerId: u32;
            `,
                main: `
                vTextureId = aTextureIdAndRound.y;
                vLayerId = u32(aLayerId);
            `,
                end: `
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `
            },
            fragment: {
                header: `
                @in @interpolate(flat) vTextureId: u32;
                @in @interpolate(flat) vLayerId: u32;

                ${generateBindingSrc(maxTextures)}
            `,
                main: `
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${generateSample2DArraySrc(maxTextures)}
            `
            }
        };
    }

    return texture2dArrayBatchBitGpuCache[maxTextures];
}

const texture2dArrayBatchBitGlCache: Record<number, HighShaderBit> = {};

/**
 *
 * @param maxTextures - the max textures the shader can use.
 * @returns a shader bit that will allow the shader to sample multiple textures AND round pixels.
 */
function generateSample2DArrayGlSrc(maxTextures: number): string
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
        src.push(`\toutColor = texture(uTextures[${i}], vec3(vUV, vLayerId));`);
        src.push('}');
    }

    return src.join('\n');
}

export function generateTexture2DArrayBatchBitGl(maxTextures: number): HighShaderBit
{
    if (!texture2dArrayBatchBitGlCache[maxTextures])
    {
        texture2dArrayBatchBitGlCache[maxTextures] = {
            name: 'texture-2darray-batch-bit',
            vertex: {
                header: `
                #version 300 es
                in vec2 aTextureIdAndRound;
                in float aLayerId;
                out float vTextureId;
                out float vLayerId;

            `,
                main: `
                vTextureId = aTextureIdAndRound.y;
                vLayerId = aLayerId;
            `,
                end: `
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `
            },
            fragment: {
                header: `
                #version 300 es
                in float vTextureId;
                in float vLayerId;

                uniform highp sampler2DArray uTextures[${maxTextures}];
                uniform int uLayerId;

            `,
                main: `

                ${generateSample2DArrayGlSrc(maxTextures)}
            `
            }
        };
    }

    return texture2dArrayBatchBitGlCache[maxTextures];
}
