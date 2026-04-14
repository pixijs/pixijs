import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { getBatchSamplersUniformGroup } from '../../../rendering/renderers/gl/shader/getBatchSamplersUniformGroup';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { AbstractGlGraphicsAdaptor } from '../../graphics/gl/AbstractGlGraphicsAdaptor';
import { SmoothShader } from '../shared/batcher/SmoothShader';

import type { Renderer } from '../../../rendering/renderers/types';

/**
 * WebGL adaptor for non-batchable smooth graphics rendering.
 * Creates a shader with local uniforms (uTransformMatrix, uColor, uRound)
 * and delegates to the SmoothShader's GLSL programs.
 * @category rendering
 * @internal
 */
export class GlSmoothGraphicsAdaptor extends AbstractGlGraphicsAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipesAdaptor,
        ],
        name: 'smoothGraphics',
    } as const;

    constructor()
    {
        super('smoothGraphicsContext');
    }

    public contextChange(renderer: Renderer): void
    {
        const uniforms = new UniformGroup({
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uRound: { value: 0, type: 'f32' },
        });

        const maxTextures = renderer.limits.maxBatchableTextures;

        const smoothShader = new SmoothShader(maxTextures, true);

        this.shader = new Shader({
            glProgram: smoothShader.glProgram,
            resources: {
                localUniforms: uniforms,
                batchSamplers: getBatchSamplersUniformGroup(maxTextures),
            }
        });
    }
}
