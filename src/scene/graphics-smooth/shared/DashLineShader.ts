import { Matrix } from '../../../maths/matrix/Matrix';
import { getBatchSamplersUniformGroup } from '../../../rendering/renderers/gl/shader/getBatchSamplersUniformGroup';
import { GlProgram } from '../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../rendering/renderers/gpu/shader/GpuProgram';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
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
} from './shaderSnippets';

/**
 * Options for configuring a DashLineShader.
 * @category scene
 * @advanced
 */
export interface DashLineShaderOptions
{
    /** Length of each dash segment in pixels. */
    dash?: number;
    /** Length of each gap between dashes in pixels. */
    gap?: number;
    /** Max batch textures supported by the renderer. */
    maxTextures?: number;
}

function buildDashGlFragmentSrc(maxTextures: number): string
{
    return `${glFragmentPreamble(maxTextures, 'uniform float uDash;\nuniform float uGap;\n')
        + glPixelLineFunction()
    }\nvoid main(void){\n    float alpha = 1.0;\n${
        glHhaaAlphaBlock()
    }
    float dd = uDash * vTravel.y;
    if (dd > 0.0) {
        float gg = uGap * vTravel.y;
        if (gg > 0.0) {
            float t = mod(vTravel.x, dd + gg);
            alpha *= mix(
                min(0.5 * dd + 0.5 - abs(t - 0.5 * dd), 1.0),
                max(abs(t - 0.5 * gg - dd) - 0.5 * gg + 0.5, 0.0),
                step(dd, t)
            );
        }
    } else {
        alpha = 0.0;
    }
${
    glTextureSampleAndOutput(maxTextures)}`;
}

function buildDashWgslSource(maxTextures: number): string
{
    const { bindings, branches } = wgslTextureBindingsAndBranches(maxTextures);

    const dashUniformsBlock = `
struct DashUniforms {
    uDash: f32,
    uGap: f32,
}

@group(3) @binding(0) var<uniform> dashUniforms: DashUniforms;
`;

    const dashModulation = `
    let dd = dashUniforms.uDash * input.vTravel.y;
    if (dd > 0.0) {
        let gg = dashUniforms.uGap * input.vTravel.y;
        if (gg > 0.0) {
            let t = input.vTravel.x % (dd + gg);
            alpha *= mix(
                min(0.5 * dd + 0.5 - abs(t - 0.5 * dd), 1.0),
                max(abs(t - 0.5 * gg - dd) - 0.5 * gg + 0.5, 0.0),
                step(dd, t)
            );
        }
    } else {
        alpha = 0.0;
    }
`;

    return `\n${
        wgslStructsAndConstants()
    }${wgslLocalUniformsBlock()
    }${dashUniformsBlock
    }${bindings}\n${
        wgslHelperFunctions()
    }${wgslVertexBody(
        'globalUniforms.uWorldTransformMatrix * localUniforms.uTransformMatrix',
        'input.aColor * localUniforms.uColor',
    )
    }${wgslPixelLineFunction()
    }${wgslFragmentOpen()
    }${wgslHhaaAlphaBlock()
    }${dashModulation
    }${wgslTextureSampleAndReturn(branches)}`;
}

/**
 * A shader for rendering dashed lines with SmoothGraphics.
 * Modulates alpha based on `vTravel` (distance along the path) to create
 * a dash/gap pattern with smooth transitions.
 *
 * Assign to `graphicsContext.customShader` to trigger the non-batchable rendering path.
 * @example
 * ```ts
 * const dashShader = new DashLineShader({ dash: 10, gap: 5 });
 * const sg = new SmoothGraphics();
 * sg.context.customShader = dashShader;
 * sg.moveTo(0, 0).lineTo(200, 100).stroke({ color: 0xff0000, width: 3 });
 * ```
 * @category scene
 * @advanced
 */
export class DashLineShader extends Shader
{
    private readonly _dashUniforms: UniformGroup;

    constructor(options?: DashLineShaderOptions)
    {
        const { dash = 8, gap = 5, maxTextures = 1 } = options ?? {};

        const glProgram = GlProgram.from({
            vertex: buildGlVertexSrc(true),
            fragment: buildDashGlFragmentSrc(maxTextures),
            name: 'smooth-dash',
        });

        const dashWgslSrc = buildDashWgslSource(maxTextures);

        const gpuProgram = GpuProgram.from({
            vertex: {
                source: dashWgslSrc,
                entryPoint: 'mainVertex',
            },
            fragment: {
                source: dashWgslSrc,
                entryPoint: 'mainFragment',
            },
            name: 'smooth-dash',
        });

        const localUniforms = new UniformGroup({
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uRound: { value: 0, type: 'f32' },
        });

        const dashUniforms = new UniformGroup({
            uDash: { value: dash, type: 'f32' },
            uGap: { value: gap, type: 'f32' },
        });

        super({
            glProgram,
            gpuProgram,
            resources: {
                localUniforms,
                dashUniforms,
                batchSamplers: getBatchSamplersUniformGroup(maxTextures),
            },
        });

        this._dashUniforms = dashUniforms;
    }

    /** The length of each dash segment in pixels. Set to 0 to hide all strokes. */
    public get dash(): number
    {
        return this._dashUniforms.uniforms.uDash as number;
    }

    public set dash(value: number)
    {
        this._dashUniforms.uniforms.uDash = value;
    }

    /** The length of each gap between dashes in pixels. */
    public get gap(): number
    {
        return this._dashUniforms.uniforms.uGap as number;
    }

    public set gap(value: number)
    {
        this._dashUniforms.uniforms.uGap = value;
    }
}
