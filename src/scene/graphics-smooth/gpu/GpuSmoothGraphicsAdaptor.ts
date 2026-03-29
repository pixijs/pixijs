import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { AbstractGpuGraphicsAdaptor } from '../../graphics/gpu/AbstractGpuGraphicsAdaptor';
import { SmoothShader } from '../shared/batcher/SmoothShader';

import type { Renderer } from '../../../rendering/renderers/types';

/**
 * WebGPU adaptor for non-batchable smooth graphics rendering.
 * @category rendering
 * @internal
 */
export class GpuSmoothGraphicsAdaptor extends AbstractGpuGraphicsAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUPipesAdaptor,
        ],
        name: 'smoothGraphics',
    } as const;

    constructor()
    {
        super('smoothGraphicsContext');
    }

    public contextChange(renderer: Renderer): void
    {
        const localUniforms = new UniformGroup({
            uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
            uRound: { value: 0, type: 'f32' },
        });

        this._maxTextures = renderer.limits.maxBatchableTextures;

        const smoothShader = new SmoothShader(this._maxTextures, true);

        this.shader = new Shader({
            gpuProgram: smoothShader.gpuProgram,
            resources: {
                localUniforms,
            },
        });
    }
}
