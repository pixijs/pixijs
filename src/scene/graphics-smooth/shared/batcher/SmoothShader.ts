import { getBatchSamplersUniformGroup } from '../../../../rendering/renderers/gl/shader/getBatchSamplersUniformGroup';
import { GlProgram } from '../../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../../rendering/renderers/gpu/shader/GpuProgram';
import { Shader } from '../../../../rendering/renderers/shared/shader/Shader';
import { generateSmoothGlSource, generateSmoothWgslSource } from './smoothShaderSource';

import type { SmoothShaderSourceOptions } from './smoothShaderSource';

/**
 * Returns the (cached) GLSL program of a smooth graphics shader.
 * @param options - The shader options
 * @internal
 */
export function getSmoothGlProgram(options: SmoothShaderSourceOptions & { name: string }): GlProgram
{
    return GlProgram.from({ ...generateSmoothGlSource(options), name: options.name });
}

/**
 * Returns the (cached) WGSL program of a smooth graphics shader.
 * @param options - The shader options
 * @internal
 */
export function getSmoothGpuProgram(options: SmoothShaderSourceOptions & { name: string }): GpuProgram
{
    const source = generateSmoothWgslSource(options);

    return GpuProgram.from({
        vertex: { source, entryPoint: 'mainVertex' },
        fragment: { source, entryPoint: 'mainFragment' },
        name: options.name,
    });
}

/**
 * Batch shader of {@link SmoothGraphics}, with GLSL and WGSL programs.
 * @category rendering
 * @internal
 */
export class SmoothShader extends Shader
{
    /** Max batch textures */
    public readonly maxTextures: number;

    /**
     * @param maxTextures - Max batch textures
     * @param textured - Whether the vertices carry a texture coordinate matrix
     */
    constructor(maxTextures: number, textured = false)
    {
        const options = { maxTextures, textured, name: textured ? 'smooth-batch-textured' : 'smooth-batch' };

        super({
            glProgram: getSmoothGlProgram(options),
            gpuProgram: getSmoothGpuProgram(options),
            resources: {
                batchSamplers: getBatchSamplersUniformGroup(maxTextures),
            },
        });

        this.maxTextures = maxTextures;
    }
}
