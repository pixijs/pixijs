import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { compileHighShaderGlProgram } from '../../../rendering/high-shader/compileHighShaderToProgram';
import { colorBitGl } from '../../../rendering/high-shader/shader-bits/colorBit';
import { generateTextureBatchBitGl } from '../../../rendering/high-shader/shader-bits/generateTextureBatchBit';
import { localUniformBitGl } from '../../../rendering/high-shader/shader-bits/localUniformBit';
import { roundPixelsBitGl } from '../../../rendering/high-shader/shader-bits/roundPixelsBit';
import { getBatchSamplersUniformGroup } from '../../../rendering/renderers/gl/shader/getBatchSamplersUniformGroup';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { AbstractGlGraphicsAdaptor } from './AbstractGlGraphicsAdaptor';

import type { Renderer } from '../../../rendering/renderers/types';

/**
 * A GraphicsAdaptor that uses WebGL to render graphics.
 * @category rendering
 * @ignore
 */
export class GlGraphicsAdaptor extends AbstractGlGraphicsAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLPipesAdaptor,
        ],
        name: 'graphics',
    } as const;

    constructor()
    {
        super('graphicsContext');
    }

    public contextChange(renderer: Renderer): void
    {
        const uniforms = new UniformGroup({
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uRound: { value: 0, type: 'f32' },
        });

        const maxTextures = renderer.limits.maxBatchableTextures;

        const glProgram = compileHighShaderGlProgram({
            name: 'graphics',
            bits: [
                colorBitGl,
                generateTextureBatchBitGl(maxTextures),
                localUniformBitGl,
                roundPixelsBitGl,
            ]
        });

        this.shader = new Shader({
            glProgram,
            resources: {
                localUniforms: uniforms,
                batchSamplers: getBatchSamplersUniformGroup(maxTextures),
            }
        });
    }
}
