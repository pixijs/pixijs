import { ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/matrix/Matrix';
import { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { executeGpuBatches } from '../../graphics/shared/utils/executeGpuBatches';
import { SmoothShader } from '../shared/batcher/SmoothShader';

import type { WebGPURenderer } from '../../../rendering/renderers/gpu/WebGPURenderer';
import type { Renderer } from '../../../rendering/renderers/types';
import type { GraphicsAdaptor, GraphicsPipeLike } from '../../graphics/shared/GraphicsAdaptorTypes';
import type { SmoothGraphics } from '../shared/SmoothGraphics';
import type { SmoothGraphicsContextSystem } from '../shared/SmoothGraphicsContextSystem';

/**
 * WebGPU adaptor for non-batchable smooth graphics rendering.
 * @category rendering
 * @internal
 */
export class GpuSmoothGraphicsAdaptor implements GraphicsAdaptor
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUPipesAdaptor,
        ],
        name: 'smoothGraphics',
    } as const;

    public shader: Shader;

    private _maxTextures = 0;

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

    public execute(graphicsPipe: GraphicsPipeLike, renderable: SmoothGraphics): void
    {
        const context = renderable.context;
        const shader = context.customShader || this.shader;
        const renderer = graphicsPipe.renderer as WebGPURenderer;
        const contextSystem = renderer.smoothGraphicsContext as SmoothGraphicsContextSystem;

        const {
            batcher, instructions,
        } = contextSystem.getContextRenderData(context);

        executeGpuBatches(renderer, shader, batcher, instructions, graphicsPipe.state, this._maxTextures);
    }

    public destroy(): void
    {
        this.shader.destroy(true);
        this.shader = null;
    }
}
