import { getBatchSamplersUniformGroup } from '../../../../rendering/renderers/gl/shader/getBatchSamplersUniformGroup';
import { GlProgram } from '../../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../../rendering/renderers/gpu/shader/GpuProgram';
import { Shader } from '../../../../rendering/renderers/shared/shader/Shader';
import {
    buildGlVertexSrc,
    glFragmentPreamble,
    glHhaaAlphaBlock,
    glPixelLineFunction,
    glTextureSampleAndOutput,
    wgslFragmentOpen,
    wgslHelperFunctions,
    wgslHhaaAlphaBlock,
    wgslLocalUniformsBlock,
    wgslPixelLineFunction,
    wgslStructsAndConstants,
    wgslTextureBindingsAndBranches,
    wgslTextureSampleAndReturn,
    wgslVertexBody,
} from '../shaderSnippets';

export { buildGlVertexSrc, generateGlSampleSrc } from '../shaderSnippets';

function buildGlFragmentSrc(maxTextures: number): string
{
    return `${glFragmentPreamble(maxTextures)
        + glPixelLineFunction()
    }\nvoid main(void){\n    float alpha = 1.0;\n${
        glHhaaAlphaBlock()
    }${glTextureSampleAndOutput(maxTextures)}`;
}

function buildWgslSource(maxTextures: number, includeLocalUniforms = true): string
{
    const { bindings, branches } = wgslTextureBindingsAndBranches(maxTextures);

    const worldMatrixExpr = includeLocalUniforms
        ? 'globalUniforms.uWorldTransformMatrix * localUniforms.uTransformMatrix'
        : 'globalUniforms.uWorldTransformMatrix';

    const rawColorExpr = includeLocalUniforms
        ? 'input.aColor * localUniforms.uColor'
        : 'input.aColor * globalUniforms.uWorldColorAlpha';

    return `\n${
        wgslStructsAndConstants()
    }${includeLocalUniforms ? wgslLocalUniformsBlock() : ''
    }${bindings}\n${
        wgslHelperFunctions()
    }${wgslVertexBody(worldMatrixExpr, rawColorExpr)
    }${wgslPixelLineFunction()
    }${wgslFragmentOpen()
    }${wgslHhaaAlphaBlock()
    }${wgslTextureSampleAndReturn(branches)}`;
}

/**
 * Shader for smooth HHAA graphics rendering.
 * Includes both GLSL (WebGL) and WGSL (WebGPU) programs.
 * @category rendering
 * @advanced
 */
export class SmoothShader extends Shader
{
    /** @internal */
    public maxTextures?: number;

    constructor(maxTextures: number, includeLocalUniforms = false)
    {
        const glProgram = GlProgram.from({
            vertex: buildGlVertexSrc(includeLocalUniforms),
            fragment: buildGlFragmentSrc(maxTextures),
            name: includeLocalUniforms ? 'smooth-local' : 'smooth-batch',
        });

        const wgslSrc = buildWgslSource(maxTextures, includeLocalUniforms);

        const gpuProgram = GpuProgram.from({
            vertex: {
                source: wgslSrc,
                entryPoint: 'mainVertex',
            },
            fragment: {
                source: wgslSrc,
                entryPoint: 'mainFragment',
            },
            name: includeLocalUniforms ? 'smooth-local' : 'smooth-batch',
        });

        super({
            glProgram,
            gpuProgram,
            resources: {
                batchSamplers: getBatchSamplersUniformGroup(maxTextures),
            },
        });

        this.maxTextures = maxTextures;
    }
}
