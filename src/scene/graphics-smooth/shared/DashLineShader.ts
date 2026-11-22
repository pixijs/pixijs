import { Matrix } from '../../../maths/matrix/Matrix';
import { getBatchSamplersUniformGroup } from '../../../rendering/renderers/gl/shader/getBatchSamplersUniformGroup';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { getSmoothGlProgram, getSmoothGpuProgram } from './batcher/SmoothShader';

/**
 * Options for a {@link DashLineShader}.
 * @category scene
 * @standard
 */
export interface DashLineShaderOptions
{
    /**
     * Length of each dash, in pixels at a scale of 1.
     * @default 8
     */
    dash?: number;
    /**
     * Length of each gap between dashes, in pixels at a scale of 1.
     * @default 5
     */
    gap?: number;
    /**
     * Number of textures the shader can sample: set it to the number of different
     * textures the strokes of the context use, if more than one.
     * @default 1
     */
    maxTextures?: number;
}

/** Fades the coverage out between dashes, `vTravel.x` is the distance along the path */
const glDashAlpha = `
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
`;

const wgslDashHeader = `
struct DashUniforms {
    uDash: f32,
    uGap: f32,
}

@group(3) @binding(0) var<uniform> dashUniforms: DashUniforms;
`;

const wgslDashAlpha = `
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

/**
 * A shader that draws the strokes of a {@link SmoothGraphics} as dashed lines, with anti-aliased dash ends.
 *
 * Set it as the `customShader` of the context: it applies to every stroke of the context,
 * and the context is then rendered without batching. Dashes follow the path, and
 * restart at the beginning of each shape. Fills are hidden.
 * @example
 * ```ts
 * import { DashLineShader, SmoothGraphics } from 'pixi.js';
 *
 * const dashes = new DashLineShader({ dash: 10, gap: 5 });
 * const graphics = new SmoothGraphics();
 *
 * graphics.context.customShader = dashes;
 * graphics.moveTo(0, 0).lineTo(200, 100).stroke({ color: 0xff0000, width: 3 });
 *
 * // the dash pattern can be changed at any time
 * dashes.dash = 20;
 * ```
 * @category scene
 * @standard
 */
export class DashLineShader extends Shader
{
    private readonly _dashUniforms: UniformGroup<{
        uDash: { value: number; type: 'f32' };
        uGap: { value: number; type: 'f32' };
    }>;

    /**
     * @param options - Dash and gap lengths
     */
    constructor(options?: DashLineShaderOptions)
    {
        const { dash = 8, gap = 5, maxTextures = 1 } = options ?? {};

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
            glProgram: getSmoothGlProgram({
                name: 'smooth-dash',
                maxTextures,
                localUniforms: true,
                fragmentHeader: 'uniform float uDash;\nuniform float uGap;\n',
                fragmentAlpha: glDashAlpha,
            }),
            gpuProgram: getSmoothGpuProgram({
                name: 'smooth-dash',
                maxTextures,
                localUniforms: true,
                fragmentHeader: wgslDashHeader,
                fragmentAlpha: wgslDashAlpha,
            }),
            resources: {
                localUniforms,
                dashUniforms,
                batchSamplers: getBatchSamplersUniformGroup(maxTextures),
            },
        });

        this._dashUniforms = dashUniforms;
    }

    /**
     * Length of each dash, in pixels at a scale of 1. Set it to 0 to hide the strokes.
     * @default 8
     */
    get dash(): number
    {
        return this._dashUniforms.uniforms.uDash;
    }

    set dash(value: number)
    {
        this._dashUniforms.uniforms.uDash = value;
    }

    /**
     * Length of each gap between dashes, in pixels at a scale of 1.
     * @default 5
     */
    get gap(): number
    {
        return this._dashUniforms.uniforms.uGap;
    }

    set gap(value: number)
    {
        this._dashUniforms.uniforms.uGap = value;
    }
}
