import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { compileHighShaderGpuProgram } from '../../../rendering/high-shader/compileHighShaderToProgram';
import { colorBit } from '../../../rendering/high-shader/shader-bits/colorBit';
import { generateTextureBatchBit } from '../../../rendering/high-shader/shader-bits/generateTextureBatchBit';
import { localUniformBitGroup2 } from '../../../rendering/high-shader/shader-bits/localUniformBit';
import { roundPixelsBit } from '../../../rendering/high-shader/shader-bits/roundPixelsBit';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { AbstractGpuGraphicsAdaptor } from './AbstractGpuGraphicsAdaptor';

import type { Renderer } from '../../../rendering/renderers/types';

/**
 * A GraphicsAdaptor that uses the GPU to render graphics.
 * @category rendering
 * @ignore
 */
export class GpuGraphicsAdaptor extends AbstractGpuGraphicsAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUPipesAdaptor,
        ],
        name: 'graphics',
    } as const;

    constructor()
    {
        super('graphicsContext');
    }

    public contextChange(renderer: Renderer): void
    {
        const localUniforms = new UniformGroup({
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uRound: { value: 0, type: 'f32' },
        });

        this._maxTextures = renderer.limits.maxBatchableTextures;

        const gpuProgram = compileHighShaderGpuProgram({
            name: 'graphics',
            bits: [
                colorBit,
                generateTextureBatchBit(this._maxTextures),

                localUniformBitGroup2,
                roundPixelsBit
            ]
        });

        this.shader = new Shader({
            gpuProgram,
            resources: {
                localUniforms,
            },
        });
    }
}
